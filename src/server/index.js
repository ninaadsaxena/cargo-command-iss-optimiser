
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup file upload with multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// In-memory database for demonstration
let items = [];
let containers = [];
let logs = [];
let currentDate = new Date().toISOString();

// Helper functions
function getContainerById(containerId) {
  return containers.find(container => container.id === containerId);
}

function getItemById(itemId) {
  return items.find(item => item.id === itemId);
}

function calculateItemVolume(item) {
  return item.width * item.depth * item.height;
}

function checkItemExpiry(item, date) {
  if (!item.expiryDate) return false;
  return new Date(item.expiryDate) <= new Date(date);
}

function checkUsageLimitExceeded(item) {
  if (item.usageLimit === null) return false;
  return item.usageCount >= item.usageLimit;
}

function markItemAsWaste(item, reason) {
  item.isWaste = true;
  addLog({
    timestamp: new Date().toISOString(),
    userId: "system",
    actionType: "waste-marking",
    itemId: item.id,
    details: {
      reason: reason
    }
  });
  return item;
}

function addLog(logEntry) {
  const log = {
    id: uuidv4(),
    timestamp: logEntry.timestamp || new Date().toISOString(),
    ...logEntry
  };
  logs.push(log);
  return log;
}

function findOptimalContainer(item, containers) {
  // Sort containers by preferred zone first, then by available space
  return containers
    .filter(container => {
      // Check if container has enough space for the item
      const itemVolume = calculateItemVolume(item);
      const containerVolume = container.width * container.depth * container.height;
      const availableVolume = containerVolume * (1 - container.spaceUtilization / 100);
      return availableVolume >= itemVolume;
    })
    .sort((a, b) => {
      // Prioritize preferred zone
      const aInPreferredZone = a.zone === item.preferredZone ? 0 : 1;
      const bInPreferredZone = b.zone === item.preferredZone ? 0 : 1;
      
      if (aInPreferredZone !== bInPreferredZone) {
        return aInPreferredZone - bInPreferredZone;
      }
      
      // If both in or both not in preferred zone, choose the one with more space
      return a.spaceUtilization - b.spaceUtilization;
    })[0];
}

function findOptimalPosition(item, container) {
  // Simple algorithm to find a position: just stack items from the bottom
  const existingItems = items.filter(i => 
    i.position && i.position.containerId === container.id
  );
  
  // If container is empty, place at the bottom-left corner
  if (existingItems.length === 0) {
    return {
      x: 0,
      y: 0,
      z: 0
    };
  }
  
  // Find the highest point in the container
  let maxHeight = 0;
  let baseX = 0;
  let baseY = 0;
  
  existingItems.forEach(existingItem => {
    const pos = existingItem.position;
    const itemHeight = existingItem.height;
    const totalHeight = pos.z + itemHeight;
    
    if (totalHeight > maxHeight) {
      maxHeight = totalHeight;
      baseX = pos.x;
      baseY = pos.y;
    }
  });
  
  // Check if there's enough vertical space left
  if (maxHeight + item.height <= container.height) {
    return {
      x: baseX,
      y: baseY,
      z: maxHeight
    };
  }
  
  // If not enough vertical space, try to find another spot
  // For simplicity, we'll place it next to existing items
  return {
    x: baseX + 20, // Add some spacing
    y: baseY,
    z: 0
  };
}

function calculateRetrievalSteps(targetItem, container) {
  if (!targetItem.position) {
    return { steps: [], count: 0 };
  }
  
  const itemsToMove = [];
  const retrievalSteps = [];
  let stepCount = 0;
  
  // Find items that are blocking this item
  items.forEach(item => {
    if (item.id === targetItem.id || !item.position || item.position.containerId !== container.id) {
      return;
    }
    
    const targetPos = targetItem.position;
    const itemPos = item.position;
    
    // Check if this item is blocking the target
    if (itemPos.x < targetPos.x + targetItem.width &&
        itemPos.x + item.width > targetPos.x &&
        itemPos.y < targetPos.y + targetItem.depth &&
        itemPos.y + item.depth > targetPos.y &&
        itemPos.z > targetPos.z) {
      
      itemsToMove.push(item);
      
      // Add steps for each blocking item
      retrievalSteps.push({
        step: ++stepCount,
        action: "remove",
        itemId: item.id,
        itemName: item.name
      });
    }
  });
  
  // Add step for retrieving target item
  retrievalSteps.push({
    step: ++stepCount,
    action: "retrieve",
    itemId: targetItem.id,
    itemName: targetItem.name
  });
  
  // Add steps for putting back blocking items
  itemsToMove.reverse().forEach(item => {
    retrievalSteps.push({
      step: ++stepCount,
      action: "placeBack",
      itemId: item.id,
      itemName: item.name
    });
  });
  
  return { 
    steps: retrievalSteps, 
    count: itemsToMove.length,
    itemsToMove: itemsToMove
  };
}

function updateContainerSpaceUtilization(containerId) {
  const container = getContainerById(containerId);
  if (!container) return;
  
  const containerVolume = container.width * container.depth * container.height;
  const containerItems = items.filter(item => 
    item.position && item.position.containerId === containerId
  );
  
  const usedVolume = containerItems.reduce((total, item) => {
    return total + calculateItemVolume(item);
  }, 0);
  
  container.spaceUtilization = Math.round((usedVolume / containerVolume) * 100);
}

// API routes
// 1. Placement Recommendations API
app.post('/api/placement', (req, res) => {
  const { items: newItems, containers: newContainers } = req.body;
  
  // Create or update containers
  newContainers.forEach(container => {
    const existingContainer = getContainerById(container.containerId);
    if (existingContainer) {
      // Update existing container
      Object.assign(existingContainer, {
        zone: container.zone,
        width: container.width,
        depth: container.depth,
        height: container.height
      });
    } else {
      // Add new container
      containers.push({
        id: container.containerId,
        zone: container.zone,
        width: container.width,
        depth: container.depth,
        height: container.height,
        items: [],
        spaceUtilization: 0
      });
    }
  });
  
  const placements = [];
  const rearrangements = [];
  
  // Process new items
  newItems.forEach(newItem => {
    // Create item object
    const item = {
      id: newItem.itemId,
      name: newItem.name,
      width: newItem.width,
      depth: newItem.depth,
      height: newItem.height,
      mass: newItem.mass || 1, // Default mass if not provided
      priority: newItem.priority,
      expiryDate: newItem.expiryDate,
      usageLimit: newItem.usageLimit,
      usageCount: 0,
      preferredZone: newItem.preferredZone,
      isWaste: false
    };
    
    // Find optimal container
    const container = findOptimalContainer(item, containers);
    
    if (container) {
      // Find position in container
      const position = findOptimalPosition(item, container);
      
      // Add placement
      placements.push({
        itemId: item.id,
        containerId: container.id,
        position: {
          startCoordinates: {
            width: position.x,
            depth: position.y,
            height: position.z
          },
          endCoordinates: {
            width: position.x + item.width,
            depth: position.y + item.depth,
            height: position.z + item.height
          }
        }
      });
      
      // Update item with position
      item.position = {
        containerId: container.id,
        x: position.x,
        y: position.y,
        z: position.z
      };
      
      // Add item to database
      items.push(item);
      
      // Update container space utilization
      updateContainerSpaceUtilization(container.id);
      
      // Add log
      addLog({
        timestamp: new Date().toISOString(),
        userId: "system",
        actionType: "placement",
        itemId: item.id,
        details: {
          containerId: container.id,
          position: position
        }
      });
    } else {
      // No suitable container found, suggest rearrangement
      // For simplicity, we'll just return an empty rearrangement plan
      rearrangements.push({
        step: 1,
        action: "rearrangement-needed",
        itemId: item.id,
        fromContainer: null,
        fromPosition: null,
        toContainer: null,
        toPosition: null
      });
    }
  });
  
  res.json({
    success: true,
    placements,
    rearrangements
  });
});

// 2. Item Search and Retrieval API
app.get('/api/search', (req, res) => {
  const { itemId, itemName, userId } = req.query;
  
  // Find item by ID or name
  let item = null;
  if (itemId) {
    item = getItemById(itemId);
  } else if (itemName) {
    item = items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
  }
  
  if (!item) {
    return res.json({
      success: true,
      found: false,
      item: null,
      retrievalSteps: []
    });
  }
  
  // Get container
  const container = item.position ? getContainerById(item.position.containerId) : null;
  
  // Calculate retrieval steps
  const { steps } = container ? calculateRetrievalSteps(item, container) : { steps: [] };
  
  // Log search
  if (userId) {
    addLog({
      timestamp: new Date().toISOString(),
      userId,
      actionType: "search",
      itemId: item.id
    });
  }
  
  res.json({
    success: true,
    found: true,
    item: {
      itemId: item.id,
      name: item.name,
      containerId: item.position ? item.position.containerId : null,
      zone: container ? container.zone : null,
      position: item.position ? {
        startCoordinates: {
          width: item.position.x,
          depth: item.position.y,
          height: item.position.z
        },
        endCoordinates: {
          width: item.position.x + item.width,
          depth: item.position.y + item.depth,
          height: item.position.z + item.height
        }
      } : null
    },
    retrievalSteps: steps
  });
});

// Retrieve item API
app.post('/api/retrieve', (req, res) => {
  const { itemId, userId, timestamp } = req.body;
  
  const item = getItemById(itemId);
  if (!item) {
    return res.json({
      success: false,
      message: "Item not found"
    });
  }
  
  // Update usage count
  item.usageCount += 1;
  
  // Remove position (item is now retrieved)
  const oldPosition = item.position;
  item.position = null;
  
  // Check if item is now waste due to usage limit
  if (checkUsageLimitExceeded(item)) {
    markItemAsWaste(item, "Out of Uses");
  }
  
  // Update container space utilization
  if (oldPosition) {
    updateContainerSpaceUtilization(oldPosition.containerId);
  }
  
  // Log retrieval
  addLog({
    timestamp: timestamp || new Date().toISOString(),
    userId,
    actionType: "retrieval",
    itemId: item.id,
    details: {
      fromContainer: oldPosition ? oldPosition.containerId : null,
      usageCount: item.usageCount
    }
  });
  
  res.json({ success: true });
});

// Place item API
app.post('/api/place', (req, res) => {
  const { itemId, userId, timestamp, containerId, position } = req.body;
  
  const item = getItemById(itemId);
  if (!item) {
    return res.json({
      success: false,
      message: "Item not found"
    });
  }
  
  const container = getContainerById(containerId);
  if (!container) {
    return res.json({
      success: false,
      message: "Container not found"
    });
  }
  
  // Update item position
  item.position = {
    containerId,
    x: position.startCoordinates.width,
    y: position.startCoordinates.depth,
    z: position.startCoordinates.height
  };
  
  // Update container space utilization
  updateContainerSpaceUtilization(containerId);
  
  // Log placement
  addLog({
    timestamp: timestamp || new Date().toISOString(),
    userId,
    actionType: "placement",
    itemId: item.id,
    details: {
      toContainer: containerId,
      position: item.position
    }
  });
  
  res.json({ success: true });
});

// 3. Waste Management API
app.get('/api/waste/identify', (req, res) => {
  const wasteItems = items.filter(item => 
    item.isWaste || checkItemExpiry(item, currentDate) || checkUsageLimitExceeded(item)
  );
  
  // Mark items as waste if they weren't already
  wasteItems.forEach(item => {
    if (!item.isWaste) {
      const reason = checkItemExpiry(item, currentDate) ? "Expired" : "Out of Uses";
      markItemAsWaste(item, reason);
    }
  });
  
  // Format response
  const formattedWaste = wasteItems.map(item => {
    const reason = checkItemExpiry(item, currentDate) ? "Expired" : 
                   checkUsageLimitExceeded(item) ? "Out of Uses" : "Manually Marked";
    
    return {
      itemId: item.id,
      name: item.name,
      reason,
      containerId: item.position ? item.position.containerId : null,
      position: item.position ? {
        startCoordinates: {
          width: item.position.x,
          depth: item.position.y,
          height: item.position.z
        },
        endCoordinates: {
          width: item.position.x + item.width,
          depth: item.position.y + item.depth,
          height: item.position.z + item.height
        }
      } : null
    };
  });
  
  res.json({
    success: true,
    wasteItems: formattedWaste
  });
});

// Return plan for waste
app.post('/api/waste/return-plan', (req, res) => {
  const { undockingContainerId, undockingDate, maxWeight } = req.body;
  
  const container = getContainerById(undockingContainerId);
  if (!container) {
    return res.json({
      success: false,
      message: "Container not found"
    });
  }
  
  // Get waste items
  const wasteItems = items.filter(item => 
    item.isWaste || checkItemExpiry(item, undockingDate) || checkUsageLimitExceeded(item)
  );
  
  // Sort waste items by mass (lighter items first to maximize count)
  wasteItems.sort((a, b) => a.mass - b.mass);
  
  const selectedItems = [];
  let totalWeight = 0;
  
  // Select items to return within weight limit
  for (const item of wasteItems) {
    if (totalWeight + item.mass <= maxWeight) {
      selectedItems.push(item);
      totalWeight += item.mass;
    }
  }
  
  // Generate return plan
  const returnPlan = [];
  let step = 1;
  
  selectedItems.forEach(item => {
    if (item.position) {
      returnPlan.push({
        step: step++,
        itemId: item.id,
        itemName: item.name,
        fromContainer: item.position.containerId,
        toContainer: undockingContainerId
      });
    }
  });
  
  // Calculate retrieval steps for items that need to be moved
  const allRetrievalSteps = [];
  selectedItems.forEach(item => {
    if (item.position) {
      const container = getContainerById(item.position.containerId);
      if (container) {
        const { steps } = calculateRetrievalSteps(item, container);
        allRetrievalSteps.push(...steps);
      }
    }
  });
  
  // Prepare return manifest
  const returnManifest = {
    undockingContainerId,
    undockingDate,
    returnItems: selectedItems.map(item => ({
      itemId: item.id,
      name: item.name,
      reason: checkItemExpiry(item, undockingDate) ? "Expired" : 
              checkUsageLimitExceeded(item) ? "Out of Uses" : "Manually Marked"
    })),
    totalVolume: selectedItems.reduce((total, item) => total + calculateItemVolume(item), 0),
    totalWeight
  };
  
  res.json({
    success: true,
    returnPlan,
    retrievalSteps: allRetrievalSteps,
    returnManifest
  });
});

// Complete undocking
app.post('/api/waste/complete-undocking', (req, res) => {
  const { undockingContainerId, timestamp } = req.body;
  
  const container = getContainerById(undockingContainerId);
  if (!container) {
    return res.json({
      success: false,
      message: "Container not found"
    });
  }
  
  // Get items in undocking container
  const containerItems = items.filter(item => 
    item.position && item.position.containerId === undockingContainerId
  );
  
  // Remove these items
  items = items.filter(item => 
    !item.position || item.position.containerId !== undockingContainerId
  );
  
  // Log undocking
  addLog({
    timestamp: timestamp || new Date().toISOString(),
    userId: "system",
    actionType: "undocking",
    details: {
      containerId: undockingContainerId,
      itemsRemoved: containerItems.length
    }
  });
  
  // Update container space utilization
  updateContainerSpaceUtilization(undockingContainerId);
  
  res.json({
    success: true,
    itemsRemoved: containerItems.length
  });
});

// 4. Time Simulation API
app.post('/api/simulate/day', (req, res) => {
  const { numOfDays, toTimestamp, itemsToBeUsedPerDay } = req.body;
  
  // Calculate new date
  let newDate;
  if (toTimestamp) {
    newDate = new Date(toTimestamp);
  } else if (numOfDays) {
    newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + numOfDays);
  } else {
    newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
  }
  
  // Format as ISO string
  newDate = newDate.toISOString();
  
  // Simulate item usage
  const itemsUsed = [];
  const itemsExpired = [];
  const itemsDepletedToday = [];
  
  // Process items to be used
  if (itemsToBeUsedPerDay && numOfDays) {
    // Simulate usage for each day
    for (let day = 0; day < numOfDays; day++) {
      itemsToBeUsedPerDay.forEach(usageItem => {
        let item;
        if (usageItem.itemId) {
          item = getItemById(usageItem.itemId);
        } else if (usageItem.name) {
          item = items.find(i => i.name === usageItem.name);
        }
        
        if (item && !item.isWaste) {
          // Update usage count
          item.usageCount += 1;
          
          // Check if depleted
          if (checkUsageLimitExceeded(item)) {
            markItemAsWaste(item, "Out of Uses");
            itemsDepletedToday.push({
              itemId: item.id,
              name: item.name
            });
          }
          
          itemsUsed.push({
            itemId: item.id,
            name: item.name,
            remainingUses: item.usageLimit ? item.usageLimit - item.usageCount : null
          });
        }
      });
    }
  }
  
  // Check for expired items
  items.forEach(item => {
    if (!item.isWaste && checkItemExpiry(item, newDate)) {
      markItemAsWaste(item, "Expired");
      itemsExpired.push({
        itemId: item.id,
        name: item.name
      });
    }
  });
  
  // Update current date
  currentDate = newDate;
  
  res.json({
    success: true,
    newDate,
    changes: {
      itemsUsed,
      itemsExpired,
      itemsDepletedToday
    }
  });
});

// 5. Import/Export API
app.post('/api/import/items', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.json({
      success: false,
      message: "No file uploaded"
    });
  }
  
  const results = [];
  const errors = [];
  let rowCount = 0;
  
  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (data) => {
      rowCount++;
      try {
        const item = {
          id: data.ItemID || uuidv4(),
          name: data.Name,
          width: parseFloat(data.Width),
          depth: parseFloat(data.Depth),
          height: parseFloat(data.Height),
          mass: parseFloat(data.Mass),
          priority: parseInt(data.Priority),
          expiryDate: data.ExpiryDate === 'N/A' ? null : data.ExpiryDate,
          usageLimit: data.UsageLimit === 'N/A' ? null : parseInt(data.UsageLimit),
          usageCount: parseInt(data.UsageCount || 0),
          preferredZone: data.PreferredZone,
          isWaste: false
        };
        
        // Validate
        if (isNaN(item.width) || isNaN(item.depth) || isNaN(item.height) || 
            isNaN(item.mass) || isNaN(item.priority)) {
          throw new Error("Invalid numeric values");
        }
        
        results.push(item);
      } catch (err) {
        errors.push({
          row: rowCount,
          message: err.message
        });
      }
    })
    .on('end', () => {
      // Add valid items to database
      results.forEach(item => {
        // Check if item already exists
        const existingIndex = items.findIndex(i => i.id === item.id);
        if (existingIndex >= 0) {
          // Update existing item
          items[existingIndex] = { ...items[existingIndex], ...item };
        } else {
          // Add new item
          items.push(item);
        }
      });
      
      // Remove temporary file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error removing temporary file:", err);
      });
      
      res.json({
        success: true,
        itemsImported: results.length,
        errors
      });
    });
});

app.post('/api/import/containers', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.json({
      success: false,
      message: "No file uploaded"
    });
  }
  
  const results = [];
  const errors = [];
  let rowCount = 0;
  
  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (data) => {
      rowCount++;
      try {
        const container = {
          id: data.ContainerID || uuidv4(),
          zone: data.Zone,
          width: parseFloat(data.Width),
          depth: parseFloat(data.Depth),
          height: parseFloat(data.Height),
          spaceUtilization: 0,
          items: []
        };
        
        // Validate
        if (isNaN(container.width) || isNaN(container.depth) || isNaN(container.height)) {
          throw new Error("Invalid numeric values");
        }
        
        results.push(container);
      } catch (err) {
        errors.push({
          row: rowCount,
          message: err.message
        });
      }
    })
    .on('end', () => {
      // Add valid containers to database
      results.forEach(container => {
        // Check if container already exists
        const existingIndex = containers.findIndex(c => c.id === container.id);
        if (existingIndex >= 0) {
          // Update existing container
          containers[existingIndex] = { 
            ...containers[existingIndex], 
            ...container,
            spaceUtilization: containers[existingIndex].spaceUtilization 
          };
        } else {
          // Add new container
          containers.push(container);
        }
      });
      
      // Remove temporary file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error removing temporary file:", err);
      });
      
      res.json({
        success: true,
        containersImported: results.length,
        errors
      });
    });
});

app.get('/api/export/arrangement', (req, res) => {
  // Create CSV content
  let csvContent = "Item ID,Container ID,Coordinates (W1,D1,H1),(W2,D2,H2)\n";
  
  items.forEach(item => {
    if (item.position) {
      csvContent += `${item.id},${item.position.containerId},(${item.position.x},${item.position.y},${item.position.z}),(${item.position.x + item.width},${item.position.y + item.depth},${item.position.z + item.height})\n`;
    }
  });
  
  // Set headers for file download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=arrangement.csv');
  
  // Send CSV
  res.send(csvContent);
});

// 6. Logging API
app.get('/api/logs', (req, res) => {
  const { startDate, endDate, itemId, userId, actionType } = req.query;
  
  let filteredLogs = logs;
  
  // Apply filters
  if (startDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(startDate));
  }
  
  if (endDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(endDate));
  }
  
  if (itemId) {
    filteredLogs = filteredLogs.filter(log => log.itemId === itemId);
  }
  
  if (userId) {
    filteredLogs = filteredLogs.filter(log => log.userId === userId);
  }
  
  if (actionType) {
    filteredLogs = filteredLogs.filter(log => log.actionType === actionType);
  }
  
  res.json({ logs: filteredLogs });
});

// Initialize some data
function initSampleData() {
  // Sample zones
  const zones = ['Crew Quarters', 'Airlock', 'Laboratory', 'Storage Bay', 'Medical Bay', 'Command Center'];
  
  // Sample containers
  zones.forEach((zone, index) => {
    containers.push({
      id: `container${index + 1}`,
      zone,
      width: 100 + Math.random() * 100,
      depth: 80 + Math.random() * 40,
      height: 200,
      spaceUtilization: 0,
      items: []
    });
  });
  
  // Sample items
  const itemNames = [
    "Food Packet", "Oxygen Cylinder", "First Aid Kit", "Experiment Box", 
    "Tool Kit", "Water Bottle", "Medical Supplies", "Battery Pack",
    "Cleaning Supplies", "Scientific Instruments", "Spare Parts", "Clothing"
  ];
  
  for (let i = 0; i < 30; i++) {
    const itemIndex = i % itemNames.length;
    const item = {
      id: `item${i + 1}`,
      name: `${itemNames[itemIndex]} #${Math.floor(i / itemNames.length) + 1}`,
      width: 10 + Math.random() * 20,
      depth: 10 + Math.random() * 20,
      height: 10 + Math.random() * 40,
      mass: 1 + Math.random() * 30,
      priority: Math.floor(Math.random() * 100),
      expiryDate: Math.random() > 0.5 ? null : new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: Math.random() > 0.3 ? Math.floor(Math.random() * 100) : null,
      usageCount: 0,
      preferredZone: zones[Math.floor(Math.random() * zones.length)],
      isWaste: false
    };
    
    items.push(item);
  }
  
  // Place items in containers
  items.forEach(item => {
    // Find container in preferred zone if possible
    let container = containers.find(c => c.zone === item.preferredZone);
    
    // If no container in preferred zone, pick any
    if (!container) {
      container = containers[Math.floor(Math.random() * containers.length)];
    }
    
    // Find position
    const position = findOptimalPosition(item, container);
    
    // Update item with position
    item.position = {
      containerId: container.id,
      x: position.x,
      y: position.y,
      z: position.z
    };
  });
  
  // Update container space utilization
  containers.forEach(container => {
    updateContainerSpaceUtilization(container.id);
  });
}

// Initialize sample data
initSampleData();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// For Docker, make sure the server listens on 0.0.0.0
if (process.env.DOCKER_ENV) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Docker server running on port ${PORT}`);
  });
}

module.exports = app;
