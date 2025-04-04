
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CargoItem, Container, ActionLog, SimulationState, PlacementRecommendation, RetrievalInstruction, RearrangementPlan, WasteDisposalPlan } from '@/types';
import { createInitialState, getRecommendedPlacement, findItemForRetrieval, simulateDay, generateRearrangementPlan, generateWasteDisposalPlan } from '@/services/mockData';
import { useToast } from '@/hooks/use-toast';

interface CargoContextType {
  simulationState: SimulationState;
  isLoading: boolean;
  searchItem: (name: string) => RetrievalInstruction | null;
  placeItem: (item: CargoItem) => PlacementRecommendation | null;
  retrieveItem: (item: CargoItem) => void;
  markAsWaste: (item: CargoItem) => void;
  simulateNextDay: () => void;
  simulateDays: (days: number) => void;
  getRearrangementPlan: () => RearrangementPlan;
  getWasteDisposalPlan: () => WasteDisposalPlan;
  addLog: (log: Omit<ActionLog, 'id' | 'timestamp'>) => void;
}

const CargoContext = createContext<CargoContextType | undefined>(undefined);

export const CargoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    currentDate: "",
    containers: [],
    items: [],
    logs: [],
    astronauts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call to get initial data
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real application, this would be an API call
        const initialState = createInitialState();
        setSimulationState(initialState);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load cargo data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const searchItem = (name: string): RetrievalInstruction | null => {
    return findItemForRetrieval(name, simulationState.containers);
  };

  const placeItem = (item: CargoItem): PlacementRecommendation | null => {
    return getRecommendedPlacement(item, simulationState.containers);
  };

  const retrieveItem = (item: CargoItem) => {
    // Clone the state to avoid mutations
    const newState = { ...simulationState };
    
    // Find the item in the containers
    const container = newState.containers.find(c => 
      c.items.some(i => i.id === item.id)
    );

    if (container) {
      // Remove the item from the container
      container.items = container.items.filter(i => i.id !== item.id);
      
      // Update the item's position
      const updatedItems = newState.items.map(i => {
        if (i.id === item.id) {
          // Increment usage count
          i.usageCount++;
          
          // Check if item has reached usage limit
          if (i.usageLimit !== null && i.usageCount >= i.usageLimit) {
            i.isWaste = true;
          }
          
          // Remove position
          delete i.position;
          return i;
        }
        return i;
      });
      
      newState.items = updatedItems;
      
      // Update the container's space utilization (simplified)
      container.spaceUtilization = Math.max(0, container.spaceUtilization - 5);
      
      setSimulationState(newState);
      
      toast({
        title: 'Item Retrieved',
        description: `${item.name} has been successfully retrieved.`,
      });
    }
  };

  const markAsWaste = (item: CargoItem) => {
    // Clone the state to avoid mutations
    const newState = { ...simulationState };
    
    // Mark the item as waste
    const updatedItems = newState.items.map(i => {
      if (i.id === item.id) {
        i.isWaste = true;
        return i;
      }
      return i;
    });
    
    newState.items = updatedItems;
    setSimulationState(newState);
    
    toast({
      title: 'Item Marked as Waste',
      description: `${item.name} has been marked for disposal.`,
    });
  };

  const simulateNextDay = () => {
    const newState = simulateDay(simulationState);
    setSimulationState(newState);
    
    toast({
      title: 'Day Simulated',
      description: `Advanced to ${newState.currentDate}`,
    });
  };

  const simulateDays = (days: number) => {
    let currentState = { ...simulationState };
    
    for (let i = 0; i < days; i++) {
      currentState = simulateDay(currentState);
    }
    
    setSimulationState(currentState);
    
    toast({
      title: 'Days Simulated',
      description: `Advanced ${days} days to ${currentState.currentDate}`,
    });
  };

  const getRearrangementPlan = (): RearrangementPlan => {
    return generateRearrangementPlan(simulationState.containers);
  };

  const getWasteDisposalPlan = (): WasteDisposalPlan => {
    return generateWasteDisposalPlan(simulationState);
  };

  const addLog = (log: Omit<ActionLog, 'id' | 'timestamp'>) => {
    const newLog: ActionLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 10),
      timestamp: new Date().toISOString(),
    };
    
    setSimulationState(prevState => ({
      ...prevState,
      logs: [newLog, ...prevState.logs],
    }));
  };

  return (
    <CargoContext.Provider
      value={{
        simulationState,
        isLoading,
        searchItem,
        placeItem,
        retrieveItem,
        markAsWaste,
        simulateNextDay,
        simulateDays,
        getRearrangementPlan,
        getWasteDisposalPlan,
        addLog,
      }}
    >
      {children}
    </CargoContext.Provider>
  );
};

export const useCargoContext = () => {
  const context = useContext(CargoContext);
  if (context === undefined) {
    throw new Error('useCargoContext must be used within a CargoProvider');
  }
  return context;
};
