
import { CargoItem, Container, ActionLog, PlacementRecommendation, RetrievalInstruction, RearrangementPlan, WasteDisposalPlan, SimulationState, Astronaut } from '@/types';

const API_URL = 'http://localhost:8000/api';

class CargoService {
  async getSimulationState(): Promise<SimulationState> {
    try {
      // For development, we'll use mock data from the context
      // In production, this would fetch from the API
      return mockData;
    } catch (error) {
      console.error('Error fetching simulation state:', error);
      throw error;
    }
  }

  async searchItem(query: string): Promise<{ item: CargoItem; containerId: string } | null> {
    try {
      const response = await fetch(`${API_URL}/search?itemName=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.found && data.item) {
        // Convert API response to our internal format
        const item = mockData.items.find(i => i.id === data.item.itemId);
        
        if (item) {
          return {
            item,
            containerId: data.item.containerId
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error searching for item:', error);
      return null;
    }
  }

  async retrieveItem(item: CargoItem): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/retrieve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemId: item.id,
          userId: mockData.astronauts[0].id, // Default to first astronaut
          timestamp: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error retrieving item:', error);
      return false;
    }
  }

  async markAsWaste(item: CargoItem): Promise<boolean> {
    // For simplicity, we'll just mark it in our local mock data
    const itemIndex = mockData.items.findIndex(i => i.id === item.id);
    if (itemIndex >= 0) {
      mockData.items[itemIndex].isWaste = true;
      
      // Add a log entry
      mockData.logs.push({
        id: `log-${mockData.logs.length + 1}`,
        timestamp: new Date().toISOString(),
        astronaut: mockData.astronauts[0].id,
        action: 'waste-marking',
        description: `Marked ${item.name} as waste`,
        itemId: item.id
      });
      
      return true;
    }
    
    return false;
  }

  async simulateNextDay(): Promise<SimulationState> {
    try {
      const response = await fetch(`${API_URL}/simulate/day`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numOfDays: 1,
          itemsToBeUsedPerDay: []
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update our mock data based on changes
        mockData.currentDate = data.newDate;
        
        // For simplicity, we'll just increment the current date by 1 day
        const currentDate = new Date(mockData.currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
        mockData.currentDate = currentDate.toISOString();
        
        return mockData;
      }
      
      throw new Error('Simulation failed');
    } catch (error) {
      console.error('Error simulating next day:', error);
      
      // For development, we'll just increment the date in our mock data
      const currentDate = new Date(mockData.currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
      mockData.currentDate = currentDate.toISOString();
      
      return mockData;
    }
  }

  async simulateDays(days: number): Promise<SimulationState> {
    try {
      const response = await fetch(`${API_URL}/simulate/day`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numOfDays: days,
          itemsToBeUsedPerDay: []
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        mockData.currentDate = data.newDate;
        return mockData;
      }
      
      throw new Error('Simulation failed');
    } catch (error) {
      console.error(`Error simulating ${days} days:`, error);
      
      // For development, we'll just increment the date in our mock data
      const currentDate = new Date(mockData.currentDate);
      currentDate.setDate(currentDate.getDate() + days);
      mockData.currentDate = currentDate.toISOString();
      
      return mockData;
    }
  }

  getRearrangementPlan(): RearrangementPlan {
    // For development, we'll return a mock plan
    return {
      steps: [
        {
          item: mockData.items[2],
          fromContainer: 'container1',
          toContainer: 'container3',
          reason: 'Optimize space utilization'
        },
        {
          item: mockData.items[5],
          fromContainer: 'container1',
          toContainer: 'container2',
          reason: 'Align with preferred zone'
        }
      ],
      spaceGained: 15,
      timeEstimate: 45
    };
  }

  getWasteDisposalPlan(): WasteDisposalPlan {
    // Find waste items
    const wasteItems = mockData.items.filter(item => item.isWaste);
    
    return {
      wasteItems,
      containerForDisposal: 'container2',
      totalMass: wasteItems.reduce((sum, item) => sum + item.mass, 0)
    };
  }

  async addLog(log: Partial<ActionLog>): Promise<void> {
    // Create a new log entry
    const newLog: ActionLog = {
      id: `log-${mockData.logs.length + 1}`,
      timestamp: new Date().toISOString(),
      astronaut: log.astronaut || mockData.astronauts[0].id,
      action: log.action || 'placement',
      description: log.description || '',
      itemId: log.itemId,
      containerId: log.containerId
    };
    
    // Add to mock data
    mockData.logs.push(newLog);
  }
}

// Mock data for development
const mockData: SimulationState = {
  currentDate: new Date().toISOString(),
  containers: [
    {
      id: 'container1',
      zone: 'Crew Quarters',
      width: 200,
      depth: 85,
      height: 200,
      items: [],
      spaceUtilization: 65
    },
    {
      id: 'container2',
      zone: 'Airlock',
      width: 150,
      depth: 85,
      height: 200,
      items: [],
      spaceUtilization: 42
    },
    {
      id: 'container3',
      zone: 'Laboratory',
      width: 250,
      depth: 85,
      height: 200,
      items: [],
      spaceUtilization: 78
    },
    {
      id: 'container4',
      zone: 'Storage Bay',
      width: 180,
      depth: 85,
      height: 200,
      items: [],
      spaceUtilization: 52
    },
    {
      id: 'container5',
      zone: 'Medical Bay',
      width: 120,
      depth: 85,
      height: 200,
      items: [],
      spaceUtilization: 35
    },
    {
      id: 'container6',
      zone: 'Command Center',
      width: 100,
      depth: 85,
      height: 200,
      items: [],
      spaceUtilization: 60
    }
  ],
  items: [
    {
      id: 'item1',
      name: 'Food Package',
      width: 10,
      depth: 10,
      height: 20,
      mass: 5,
      priority: 80,
      expiryDate: '2025-05-20',
      usageLimit: 30,
      usageCount: 5,
      preferredZone: 'Crew Quarters',
      isWaste: false,
      position: {
        containerId: 'container1',
        x: 0,
        y: 0,
        z: 0
      }
    },
    {
      id: 'item2',
      name: 'Oxygen Cylinder',
      width: 15,
      depth: 15,
      height: 50,
      mass: 30,
      priority: 95,
      expiryDate: null,
      usageLimit: 100,
      usageCount: 23,
      preferredZone: 'Airlock',
      isWaste: false,
      position: {
        containerId: 'container2',
        x: 10,
        y: 5,
        z: 0
      }
    },
    {
      id: 'item3',
      name: 'First Aid Kit',
      width: 20,
      depth: 20,
      height: 10,
      mass: 2,
      priority: 100,
      expiryDate: '2025-07-10',
      usageLimit: 5,
      usageCount: 0,
      preferredZone: 'Medical Bay',
      isWaste: false,
      position: {
        containerId: 'container5',
        x: 5,
        y: 10,
        z: 0
      }
    },
    {
      id: 'item4',
      name: 'Scientific Equipment',
      width: 30,
      depth: 20,
      height: 30,
      mass: 15,
      priority: 85,
      expiryDate: null,
      usageLimit: null,
      usageCount: 0,
      preferredZone: 'Laboratory',
      isWaste: false,
      position: {
        containerId: 'container3',
        x: 0,
        y: 0,
        z: 0
      }
    },
    {
      id: 'item5',
      name: 'Experiment Materials',
      width: 25,
      depth: 15,
      height: 20,
      mass: 8,
      priority: 90,
      expiryDate: '2025-06-05',
      usageLimit: null,
      usageCount: 0,
      preferredZone: 'Laboratory',
      isWaste: false,
      position: {
        containerId: 'container3',
        x: 30,
        y: 0,
        z: 0
      }
    },
    {
      id: 'item6',
      name: 'Clothing Pack',
      width: 20,
      depth: 25,
      height: 10,
      mass: 3,
      priority: 60,
      expiryDate: null,
      usageLimit: 50,
      usageCount: 48,
      preferredZone: 'Crew Quarters',
      isWaste: false,
      position: {
        containerId: 'container1',
        x: 20,
        y: 0,
        z: 0
      }
    },
    {
      id: 'item7',
      name: 'Water Container',
      width: 15,
      depth: 15,
      height: 30,
      mass: 10,
      priority: 85,
      expiryDate: '2025-04-15',
      usageLimit: 20,
      usageCount: 15,
      preferredZone: 'Crew Quarters',
      isWaste: false,
      position: {
        containerId: 'container1',
        x: 40,
        y: 0,
        z: 0
      }
    },
    {
      id: 'item8',
      name: 'Air Filter',
      width: 40,
      depth: 30,
      height: 10,
      mass: 5,
      priority: 90,
      expiryDate: null,
      usageLimit: 10,
      usageCount: 10,
      preferredZone: 'Command Center',
      isWaste: true,
      position: {
        containerId: 'container6',
        x: 0,
        y: 0,
        z: 0
      }
    },
    {
      id: 'item9',
      name: 'Spare Electronics',
      width: 20,
      depth: 15,
      height: 10,
      mass: 3,
      priority: 75,
      expiryDate: null,
      usageLimit: null,
      usageCount: 0,
      preferredZone: 'Command Center',
      isWaste: false,
      position: {
        containerId: 'container6',
        x: 40,
        y: 0,
        z: 0
      }
    },
    {
      id: 'item10',
      name: 'Medical Supplies',
      width: 25,
      depth: 20,
      height: 15,
      mass: 4,
      priority: 95,
      expiryDate: '2025-09-01',
      usageLimit: 30,
      usageCount: 5,
      preferredZone: 'Medical Bay',
      isWaste: false,
      position: {
        containerId: 'container5',
        x: 30,
        y: 10,
        z: 0
      }
    },
    {
      id: 'item11',
      name: 'Experiment Waste',
      width: 15,
      depth: 15,
      height: 25,
      mass: 7,
      priority: 40,
      expiryDate: null,
      usageLimit: null,
      usageCount: 0,
      preferredZone: 'Storage Bay',
      isWaste: true,
      position: {
        containerId: 'container4',
        x: 0,
        y: 0,
        z: 0
      }
    },
    {
      id: 'item12',
      name: 'Tool Kit',
      width: 35,
      depth: 25,
      height: 15,
      mass: 12,
      priority: 80,
      expiryDate: null,
      usageLimit: null,
      usageCount: 0,
      preferredZone: 'Storage Bay',
      isWaste: false,
      position: {
        containerId: 'container4',
        x: 20,
        y: 0,
        z: 0
      }
    }
  ],
  logs: [
    {
      id: 'log1',
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      astronaut: 'astronaut1',
      action: 'placement',
      description: 'Initial placement of Food Package',
      itemId: 'item1',
      containerId: 'container1'
    },
    {
      id: 'log2',
      timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
      astronaut: 'astronaut2',
      action: 'retrieval',
      description: 'Retrieved Oxygen Cylinder for EVA',
      itemId: 'item2',
      containerId: 'container2'
    },
    {
      id: 'log3',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
      astronaut: 'astronaut3',
      action: 'waste-marking',
      description: 'Marked Air Filter as waste',
      itemId: 'item8',
      containerId: 'container6'
    },
    {
      id: 'log4',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      astronaut: 'astronaut1',
      action: 'placement',
      description: 'Stored Experiment Materials',
      itemId: 'item5',
      containerId: 'container3'
    },
    {
      id: 'log5',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      astronaut: 'astronaut2',
      action: 'retrieval',
      description: 'Retrieved Medical Supplies for routine checkup',
      itemId: 'item10',
      containerId: 'container5'
    }
  ],
  astronauts: [
    {
      id: 'astronaut1',
      name: 'Sarah Chen',
      role: 'Commander',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    {
      id: 'astronaut2',
      name: 'James Wilson',
      role: 'Flight Engineer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'
    },
    {
      id: 'astronaut3',
      name: 'Elena Petrov',
      role: 'Science Officer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena'
    },
    {
      id: 'astronaut4',
      name: 'Miguel Santos',
      role: 'Medical Officer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel'
    }
  ]
};

export default new CargoService();
