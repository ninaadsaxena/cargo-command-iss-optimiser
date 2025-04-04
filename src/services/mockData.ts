import { CargoItem, Container, Zone, ActionLog, Astronaut, SimulationState, PlacementRecommendation, RetrievalInstruction, RearrangementPlan, WasteDisposalPlan } from '@/types';

// Helper to generate random IDs
const generateId = () => Math.random().toString(36).substring(2, 10);

// Helper to generate random dates within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper to format dates to ISO string (YYYY-MM-DD)
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Sample astronauts
const astronauts: Astronaut[] = [
  { id: 'ast1', name: 'Alex Morrison', role: 'Commander', avatar: '/placeholder.svg' },
  { id: 'ast2', name: 'Sarah Chen', role: 'Flight Engineer', avatar: '/placeholder.svg' },
  { id: 'ast3', name: 'Dmitri Petrov', role: 'Science Officer', avatar: '/placeholder.svg' },
  { id: 'ast4', name: 'Jessica Webb', role: 'Medical Officer', avatar: '/placeholder.svg' },
];

// Sample zones
const zones: Zone[] = [
  'Crew Quarters',
  'Airlock',
  'Laboratory',
  'Storage Bay',
  'Medical Bay',
  'Command Center',
];

// Generate containers for each zone
const generateContainers = (): Container[] => {
  const containers: Container[] = [];
  
  zones.forEach((zone) => {
    // Each zone gets 2-3 containers
    const numContainers = 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < numContainers; i++) {
      const containerId = `cont${zone.charAt(0)}${i}`;
      
      // Different sizes based on zone
      let width, depth, height;
      
      switch (zone) {
        case 'Crew Quarters':
          width = 80 + Math.random() * 40;
          depth = 50 + Math.random() * 30;
          height = 100 + Math.random() * 50;
          break;
        case 'Airlock':
          width = 100 + Math.random() * 50;
          depth = 80 + Math.random() * 40;
          height = 100 + Math.random() * 50;
          break;
        case 'Laboratory':
          width = 120 + Math.random() * 80;
          depth = 80 + Math.random() * 40;
          height = 150 + Math.random() * 50;
          break;
        case 'Storage Bay':
          width = 200 + Math.random() * 100;
          depth = 150 + Math.random() * 50;
          height = 200 + Math.random() * 100;
          break;
        case 'Medical Bay':
          width = 100 + Math.random() * 30;
          depth = 80 + Math.random() * 20;
          height = 120 + Math.random() * 30;
          break;
        case 'Command Center':
          width = 80 + Math.random() * 40;
          depth = 60 + Math.random() * 30;
          height = 90 + Math.random() * 40;
          break;
        default:
          width = 100;
          depth = 80;
          height = 120;
      }
      
      containers.push({
        id: containerId,
        zone,
        width: Math.round(width),
        depth: Math.round(depth),
        height: Math.round(height),
        items: [],
        spaceUtilization: 0,
      });
    }
  });
  
  return containers;
};

// Generate cargo items
const generateItems = (containers: Container[]): CargoItem[] => {
  const items: CargoItem[] = [];
  const itemTypes = [
    { name: 'Food Packet', w: 10, d: 10, h: 20, m: 5, prio: 80, zone: 'Crew Quarters', exp: true, uses: 30 },
    { name: 'Water Container', w: 20, d: 20, h: 30, m: 10, prio: 90, zone: 'Crew Quarters', exp: true, uses: 50 },
    { name: 'Oxygen Cylinder', w: 15, d: 15, h: 50, m: 30, prio: 95, zone: 'Airlock', exp: false, uses: 100 },
    { name: 'First Aid Kit', w: 20, d: 20, h: 10, m: 2, prio: 100, zone: 'Medical Bay', exp: true, uses: 5 },
    { name: 'Tool Box', w: 25, d: 20, h: 15, m: 8, prio: 70, zone: 'Storage Bay', exp: false, uses: 200 },
    { name: 'Experiment Sample', w: 15, d: 15, h: 10, m: 1, prio: 85, zone: 'Laboratory', exp: true, uses: 1 },
    { name: 'Laptop', w: 35, d: 25, h: 3, m: 2, prio: 75, zone: 'Command Center', exp: false, uses: 1000 },
    { name: 'Camera', w: 10, d: 8, h: 5, m: 1, prio: 60, zone: 'Laboratory', exp: false, uses: 500 },
    { name: 'Clothing Pack', w: 30, d: 25, h: 15, m: 3, prio: 65, zone: 'Crew Quarters', exp: false, uses: 30 },
    { name: 'Medical Supplies', w: 25, d: 20, h: 20, m: 4, prio: 90, zone: 'Medical Bay', exp: true, uses: 10 },
    { name: 'Communication Device', w: 15, d: 10, h: 5, m: 1, prio: 85, zone: 'Command Center', exp: false, uses: 1000 },
    { name: 'Scientific Instrument', w: 40, d: 30, h: 25, m: 15, prio: 80, zone: 'Laboratory', exp: false, uses: 200 },
    { name: 'Emergency Beacon', w: 10, d: 10, h: 20, m: 2, prio: 100, zone: 'Airlock', exp: false, uses: 10 },
    { name: 'Repair Kit', w: 30, d: 25, h: 15, m: 7, prio: 75, zone: 'Storage Bay', exp: false, uses: 20 },
    { name: 'Exercise Equipment', w: 50, d: 40, h: 20, m: 10, prio: 60, zone: 'Crew Quarters', exp: false, uses: 1000 },
    { name: 'Air Filter', w: 30, d: 30, h: 10, m: 3, prio: 90, zone: 'Airlock', exp: true, uses: 30 },
    { name: 'Battery Pack', w: 20, d: 15, h: 10, m: 5, prio: 85, zone: 'Storage Bay', exp: false, uses: 100 },
    { name: 'Solar Panel Component', w: 60, d: 40, h: 5, m: 8, prio: 70, zone: 'Storage Bay', exp: false, uses: 1 },
    { name: 'Personal Hygiene Kit', w: 20, d: 15, h: 10, m: 1, prio: 75, zone: 'Crew Quarters', exp: false, uses: 50 },
    { name: 'Radiation Detector', w: 15, d: 10, h: 8, m: 1, prio: 80, zone: 'Command Center', exp: false, uses: 500 },
  ];

  // Generate 100 items based on the types
  for (let i = 0; i < 100; i++) {
    const typeIndex = Math.floor(Math.random() * itemTypes.length);
    const type = itemTypes[typeIndex];
    
    // Generate an expiry date if applicable (between 1 month and 2 years from now)
    const today = new Date();
    const farFuture = new Date();
    farFuture.setFullYear(today.getFullYear() + 2);
    
    const expiryDate = type.exp ? formatDate(randomDate(
      new Date(today.setMonth(today.getMonth() + 1)), 
      farFuture
    )) : null;
    
    // Create the item
    const item: CargoItem = {
      id: `item${i.toString().padStart(3, '0')}`,
      name: `${type.name} #${i.toString().padStart(3, '0')}`,
      width: type.w,
      depth: type.d,
      height: type.h,
      mass: type.m,
      priority: type.prio,
      expiryDate,
      usageLimit: type.uses,
      usageCount: 0,
      preferredZone: type.zone as Zone,
      isWaste: false,
    };
    
    items.push(item);
  }
  
  // Place some items in containers (about 70% of items)
  const itemsToPlace = [...items];
  const placedItems: CargoItem[] = [];
  
  while (itemsToPlace.length > 0 && placedItems.length < items.length * 0.7) {
    const item = itemsToPlace.shift();
    if (!item) break;
    
    // Find containers in the preferred zone
    const preferredContainers = containers.filter(c => c.zone === item.preferredZone);
    
    if (preferredContainers.length > 0) {
      const container = preferredContainers[Math.floor(Math.random() * preferredContainers.length)];
      
      // Simple placement logic - just put it in with random coordinates that fit
      const x = Math.floor(Math.random() * (container.width - item.width));
      const y = Math.floor(Math.random() * (container.depth - item.depth));
      const z = Math.floor(Math.random() * (container.height - item.height));
      
      item.position = {
        containerId: container.id,
        x,
        y,
        z
      };
      
      container.items.push(item);
      container.spaceUtilization = Math.min(100, container.spaceUtilization + 5);
      placedItems.push(item);
    } else {
      // If no preferred container, try any container
      const randomContainer = containers[Math.floor(Math.random() * containers.length)];
      
      const x = Math.floor(Math.random() * (randomContainer.width - item.width));
      const y = Math.floor(Math.random() * (randomContainer.depth - item.depth));
      const z = Math.floor(Math.random() * (randomContainer.height - item.height));
      
      item.position = {
        containerId: randomContainer.id,
        x,
        y,
        z
      };
      
      randomContainer.items.push(item);
      randomContainer.spaceUtilization = Math.min(100, randomContainer.spaceUtilization + 5);
      placedItems.push(item);
    }
  }
  
  return items;
};

// Generate action logs
const generateLogs = (items: CargoItem[], containers: Container[]): ActionLog[] => {
  const logs: ActionLog[] = [];
  const actionTypes: ('placement' | 'retrieval' | 'rearrangement' | 'waste-marking' | 'undocking')[] = [
    'placement', 'retrieval', 'rearrangement', 'waste-marking', 'undocking'
  ];
  
  // Generate 50 random logs over the past month
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  
  for (let i = 0; i < 50; i++) {
    const timestamp = randomDate(oneMonthAgo, now).toISOString();
    const astronaut = astronauts[Math.floor(Math.random() * astronauts.length)];
    const action = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    
    let itemId: string | undefined;
    let containerId: string | undefined;
    let description: string;
    
    if (action === 'placement' || action === 'retrieval' || action === 'waste-marking') {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      itemId = randomItem.id;
      
      if (randomItem.position) {
        containerId = randomItem.position.containerId;
      }
    }
    
    if (action === 'undocking') {
      containerId = containers[Math.floor(Math.random() * containers.length)].id;
    }
    
    switch (action) {
      case 'placement':
        description = `${astronaut.name} placed ${itemId ? items.find(i => i.id === itemId)?.name : 'an item'} in container ${containerId}`;
        break;
      case 'retrieval':
        description = `${astronaut.name} retrieved ${itemId ? items.find(i => i.id === itemId)?.name : 'an item'} from container ${containerId}`;
        break;
      case 'rearrangement':
        description = `${astronaut.name} rearranged items in container ${containerId} for optimization`;
        break;
      case 'waste-marking':
        description = `${astronaut.name} marked ${itemId ? items.find(i => i.id === itemId)?.name : 'an item'} as waste`;
        break;
      case 'undocking':
        description = `${astronaut.name} prepared container ${containerId} for undocking with waste disposal`;
        break;
      default:
        description = `${astronaut.name} performed an action`;
    }
    
    logs.push({
      id: `log${i}`,
      timestamp,
      astronaut: astronaut.id,
      action,
      description,
      itemId,
      containerId,
    });
  }
  
  // Sort logs by timestamp (newest first)
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return logs;
};

// Create the initial simulation state
export const createInitialState = (): SimulationState => {
  const containers = generateContainers();
  const items = generateItems(containers);
  const logs = generateLogs(items, containers);
  
  return {
    currentDate: new Date().toISOString().split('T')[0],
    containers,
    items,
    logs,
    astronauts,
  };
};

// Helper functions for various cargo operations
export const getRecommendedPlacement = (item: CargoItem, containers: Container[]): PlacementRecommendation | null => {
  // First try to find a container in the preferred zone
  let targetContainers = containers.filter(c => c.zone === item.preferredZone);
  
  // If no containers in preferred zone, use any container
  if (targetContainers.length === 0) {
    targetContainers = containers;
  }
  
  // Sort containers by space utilization (less utilized first)
  targetContainers.sort((a, b) => a.spaceUtilization - b.spaceUtilization);
  
  // Check if the item fits in any container
  for (const container of targetContainers) {
    if (
      item.width <= container.width &&
      item.depth <= container.depth &&
      item.height <= container.height
    ) {
      // Simple placement algorithm - just put it in the front at position 0,0,0
      // A real algorithm would be more sophisticated!
      return {
        item,
        containerId: container.id,
        position: { x: 0, y: 0, z: 0 },
        steps: 0,
        reason: container.zone === item.preferredZone 
          ? 'Placed in preferred zone with optimal accessibility'
          : 'Placed in alternative zone due to space constraints',
      };
    }
  }
  
  return null;
};

export const findItemForRetrieval = (itemName: string, containers: Container[]): RetrievalInstruction | null => {
  // Flatten all items from all containers
  const allItems = containers.flatMap(container => 
    container.items.map(item => ({ item, containerId: container.id }))
  );
  
  // Find items matching the name (case insensitive)
  const matchingItems = allItems.filter(
    ({ item }) => item.name.toLowerCase().includes(itemName.toLowerCase())
  );
  
  if (matchingItems.length === 0) {
    return null;
  }
  
  // Sort by priority and expiry date
  matchingItems.sort((a, b) => {
    // First by priority (higher first)
    if (b.item.priority !== a.item.priority) {
      return b.item.priority - a.item.priority;
    }
    
    // Then by expiry date (sooner first, nulls last)
    if (a.item.expiryDate && b.item.expiryDate) {
      return new Date(a.item.expiryDate).getTime() - new Date(b.item.expiryDate).getTime();
    }
    return a.item.expiryDate ? -1 : (b.item.expiryDate ? 1 : 0);
  });
  
  // Return the best match
  const bestMatch = matchingItems[0];
  const { item, containerId } = bestMatch;
  
  if (!item.position) {
    return null;
  }
  
  // In a real application, calculate the number of items that need to be moved
  // For this mock, we'll randomly assign 0-3 steps
  const steps = Math.floor(Math.random() * 4);
  
  // Get some random items that would need to be moved (if steps > 0)
  const container = containers.find(c => c.id === containerId);
  const itemsToMove = container && steps > 0 
    ? container.items
        .filter(i => i.id !== item.id)
        .slice(0, steps)
    : [];
  
  return {
    item,
    containerId,
    position: item.position,
    steps,
    itemsToMove,
  };
};

export const simulateDay = (state: SimulationState, itemsUsed: string[] = []): SimulationState => {
  // Clone the state to avoid mutations
  const newState = JSON.parse(JSON.stringify(state)) as SimulationState;
  
  // Advance the date by one day
  const currentDate = new Date(state.currentDate);
  currentDate.setDate(currentDate.getDate() + 1);
  newState.currentDate = formatDate(currentDate);
  
  // Process used items
  for (const itemId of itemsUsed) {
    const item = newState.items.find(i => i.id === itemId);
    if (item) {
      // Increment usage count
      item.usageCount++;
      
      // Check if item has reached usage limit
      if (item.usageLimit !== null && item.usageCount >= item.usageLimit) {
        item.isWaste = true;
      }
      
      // Log the usage
      const astronaut = newState.astronauts[Math.floor(Math.random() * newState.astronauts.length)];
      newState.logs.unshift({
        id: generateId(),
        timestamp: new Date().toISOString(),
        astronaut: astronaut.id,
        action: 'retrieval',
        description: `${astronaut.name} used ${item.name}`,
        itemId: item.id,
        containerId: item.position?.containerId,
      });
    }
  }
  
  // Check for expired items
  for (const item of newState.items) {
    if (item.expiryDate && new Date(item.expiryDate) <= currentDate && !item.isWaste) {
      item.isWaste = true;
      
      // Log the expiry
      const astronaut = newState.astronauts[Math.floor(Math.random() * newState.astronauts.length)];
      newState.logs.unshift({
        id: generateId(),
        timestamp: new Date().toISOString(),
        astronaut: astronaut.id,
        action: 'waste-marking',
        description: `${item.name} expired and was marked as waste`,
        itemId: item.id,
        containerId: item.position?.containerId,
      });
    }
  }
  
  return newState;
};

export const generateRearrangementPlan = (containers: Container[]): RearrangementPlan => {
  // For the mock, we'll create a simple rearrangement plan
  const steps = [];
  
  // Find containers with high utilization
  const highUtilizationContainers = containers
    .filter(c => c.spaceUtilization > 70)
    .sort((a, b) => b.spaceUtilization - a.spaceUtilization);
  
  // Find containers with low utilization
  const lowUtilizationContainers = containers
    .filter(c => c.spaceUtilization < 40)
    .sort((a, b) => a.spaceUtilization - b.spaceUtilization);
  
  if (highUtilizationContainers.length > 0 && lowUtilizationContainers.length > 0) {
    // Get items from high utilization container (prioritize low priority items)
    const sourceContainer = highUtilizationContainers[0];
    const targetContainer = lowUtilizationContainers[0];
    
    // Sort items by priority (lower first)
    const itemsToMove = [...sourceContainer.items]
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3); // Move up to 3 items
    
    for (const item of itemsToMove) {
      steps.push({
        item,
        fromContainer: sourceContainer.id,
        toContainer: targetContainer.id,
        reason: `Redistribute from high-utilization container (${sourceContainer.spaceUtilization}%) to low-utilization container (${targetContainer.spaceUtilization}%)`,
      });
    }
  }
  
  return {
    steps,
    spaceGained: steps.length * 10, // Mock value - would calculate actual volume in real app
    timeEstimate: steps.length * 5, // 5 minutes per step
  };
};

export const generateWasteDisposalPlan = (state: SimulationState): WasteDisposalPlan => {
  // Identify waste items
  const wasteItems = state.items.filter(item => item.isWaste);
  
  // Calculate total mass
  const totalMass = wasteItems.reduce((sum, item) => sum + item.mass, 0);
  
  // Find a suitable container for disposal (mock logic)
  // In a real application, this would involve more complex algorithms
  const container = state.containers.find(c => c.zone === 'Airlock') || state.containers[0];
  
  return {
    wasteItems,
    containerForDisposal: container.id,
    totalMass,
  };
};
