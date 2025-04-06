
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CargoItem, Container, ActionLog, PlacementRecommendation, RetrievalInstruction, RearrangementPlan, WasteDisposalPlan, SimulationState, Astronaut } from '@/types';
import CargoService from '@/services/CargoService';
import { toast } from '@/hooks/use-toast';

interface CargoContextType {
  simulationState: SimulationState;
  isLoading: boolean;
  searchItem: (query: string) => { item: CargoItem; containerId: string } | null;
  retrieveItem: (item: CargoItem) => Promise<void>;
  markAsWaste: (item: CargoItem) => Promise<void>;
  getRearrangementPlan: () => RearrangementPlan;
  getWasteDisposalPlan: () => WasteDisposalPlan;
  simulateNextDay: () => Promise<void>;
  simulateDays: (days: number) => Promise<void>;
  addLog: (log: Partial<ActionLog>) => Promise<void>;
}

const CargoContext = createContext<CargoContextType | undefined>(undefined);

export const CargoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    currentDate: new Date().toISOString(),
    containers: [],
    items: [],
    logs: [],
    astronauts: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await CargoService.getSimulationState();
        setSimulationState(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading cargo data:', error);
        setIsLoading(false);
        toast({
          title: 'Error',
          description: 'Failed to load cargo data. Please try again.',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, []);

  const searchItem = (query: string) => {
    // First check local data for exact match
    const exactMatch = simulationState.items.find(
      item => item.name.toLowerCase() === query.toLowerCase() || item.id === query
    );
    
    if (exactMatch && exactMatch.position) {
      const containerId = exactMatch.position.containerId;
      return { item: exactMatch, containerId };
    }
    
    // Then check for partial matches
    const partialMatches = simulationState.items.filter(
      item => item.name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (partialMatches.length > 0) {
      // Sort matches by priority and retrieval difficulty
      const sortedMatches = partialMatches.sort((a, b) => {
        // Prioritize items with positions
        if (a.position && !b.position) return -1;
        if (!a.position && b.position) return 1;
        
        // Then prioritize by expiry date if both have it
        if (a.expiryDate && b.expiryDate) {
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        }
        
        // Then prioritize by priority
        return b.priority - a.priority;
      });
      
      const bestMatch = sortedMatches[0];
      if (bestMatch.position) {
        return { item: bestMatch, containerId: bestMatch.position.containerId };
      }
    }
    
    return null;
  };

  const retrieveItem = async (item: CargoItem) => {
    try {
      const success = await CargoService.retrieveItem(item);
      
      if (success) {
        // Update local state
        const updatedItems = simulationState.items.map(i => {
          if (i.id === item.id) {
            return {
              ...i,
              usageCount: i.usageCount + 1,
              position: null, // Item is now retrieved
              isWaste: i.usageLimit !== null && i.usageCount + 1 >= i.usageLimit
            };
          }
          return i;
        });
        
        // Update containers space utilization
        const updatedContainers = simulationState.containers.map(container => {
          if (item.position && container.id === item.position.containerId) {
            // This is a simplified calculation - in a real app we'd recalculate based on all items
            const itemVolume = item.width * item.depth * item.height;
            const containerVolume = container.width * container.depth * container.height;
            const spaceReduction = (itemVolume / containerVolume) * 100;
            
            return {
              ...container,
              spaceUtilization: Math.max(0, container.spaceUtilization - spaceReduction)
            };
          }
          return container;
        });
        
        // Add log
        const newLog: ActionLog = {
          id: `log-${simulationState.logs.length + 1}`,
          timestamp: new Date().toISOString(),
          astronaut: simulationState.astronauts[0].id,
          action: 'retrieval',
          description: `Retrieved ${item.name}`,
          itemId: item.id,
          containerId: item.position ? item.position.containerId : undefined
        };
        
        setSimulationState({
          ...simulationState,
          items: updatedItems,
          containers: updatedContainers,
          logs: [...simulationState.logs, newLog]
        });
        
        toast({
          title: 'Item Retrieved',
          description: `${item.name} has been retrieved`,
        });
      }
    } catch (error) {
      console.error('Error retrieving item:', error);
      toast({
        title: 'Error',
        description: 'Failed to retrieve item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const markAsWaste = async (item: CargoItem) => {
    try {
      const success = await CargoService.markAsWaste(item);
      
      if (success) {
        // Update local state
        const updatedItems = simulationState.items.map(i => {
          if (i.id === item.id) {
            return {
              ...i,
              isWaste: true
            };
          }
          return i;
        });
        
        // Add log
        const newLog: ActionLog = {
          id: `log-${simulationState.logs.length + 1}`,
          timestamp: new Date().toISOString(),
          astronaut: simulationState.astronauts[0].id,
          action: 'waste-marking',
          description: `Marked ${item.name} as waste`,
          itemId: item.id
        };
        
        setSimulationState({
          ...simulationState,
          items: updatedItems,
          logs: [...simulationState.logs, newLog]
        });
        
        toast({
          title: 'Item Marked as Waste',
          description: `${item.name} has been marked as waste`,
        });
      }
    } catch (error) {
      console.error('Error marking item as waste:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark item as waste. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getRearrangementPlan = (): RearrangementPlan => {
    return CargoService.getRearrangementPlan();
  };

  const getWasteDisposalPlan = (): WasteDisposalPlan => {
    return CargoService.getWasteDisposalPlan();
  };

  const simulateNextDay = async () => {
    try {
      setIsLoading(true);
      const updatedState = await CargoService.simulateNextDay();
      setSimulationState(updatedState);
      
      toast({
        title: 'Simulation Advanced',
        description: `Advanced to ${new Date(updatedState.currentDate).toLocaleDateString()}`,
      });
    } catch (error) {
      console.error('Error simulating next day:', error);
      toast({
        title: 'Error',
        description: 'Failed to simulate next day. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateDays = async (days: number) => {
    try {
      setIsLoading(true);
      const updatedState = await CargoService.simulateDays(days);
      setSimulationState(updatedState);
      
      toast({
        title: 'Simulation Advanced',
        description: `Advanced ${days} days to ${new Date(updatedState.currentDate).toLocaleDateString()}`,
      });
    } catch (error) {
      console.error(`Error simulating ${days} days:`, error);
      toast({
        title: 'Error',
        description: `Failed to simulate ${days} days. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLog = async (log: Partial<ActionLog>) => {
    await CargoService.addLog(log);
    
    // Update local state with new log
    const newLog: ActionLog = {
      id: `log-${simulationState.logs.length + 1}`,
      timestamp: new Date().toISOString(),
      astronaut: log.astronaut || simulationState.astronauts[0].id,
      action: log.action || 'placement',
      description: log.description || '',
      itemId: log.itemId,
      containerId: log.containerId
    };
    
    setSimulationState({
      ...simulationState,
      logs: [...simulationState.logs, newLog]
    });
  };

  return (
    <CargoContext.Provider
      value={{
        simulationState,
        isLoading,
        searchItem,
        retrieveItem,
        markAsWaste,
        getRearrangementPlan,
        getWasteDisposalPlan,
        simulateNextDay,
        simulateDays,
        addLog
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
