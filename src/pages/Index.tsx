
import React, { useState } from 'react';
import { CargoProvider } from '@/contexts/CargoContext';
import { useCargoContext } from '@/contexts/CargoContext';
import Header from '@/components/Header';
import DashboardStats from '@/components/DashboardStats';
import ContainerVisualization from '@/components/ContainerVisualization';
import ItemDetails from '@/components/ItemDetails';
import ActionLog from '@/components/ActionLog';
import ItemSearch from '@/components/ItemSearch';
import RearrangementPlan from '@/components/RearrangementPlan';
import WasteDisposal from '@/components/WasteDisposalPlan';
import TimeControls from '@/components/TimeControls';
import SymbolLegend from '@/components/SymbolLegend';
import SupplyLocationsGlobe from '@/components/SupplyLocationsGlobe';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { CargoItem } from '@/types';

const DashboardContent = () => {
  const { simulationState, isLoading, retrieveItem, markAsWaste, getRearrangementPlan, getWasteDisposalPlan, simulateNextDay, simulateDays } = useCargoContext();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading cargo data...</p>
      </div>
    );
  }
  
  const selectedItem = selectedItemId 
    ? simulationState.items.find(item => item.id === selectedItemId) || null
    : null;
  
  // Get container by zone for visualization tabs
  const containersByZone = simulationState.containers.reduce((acc, container) => {
    if (!acc[container.zone]) {
      acc[container.zone] = [];
    }
    acc[container.zone].push(container);
    return acc;
  }, {} as { [key: string]: typeof simulationState.containers });
  
  const handleItemClick = (item: CargoItem) => {
    setSelectedItemId(item.id);
  };
  
  const handleItemFound = (itemId: string) => {
    setSelectedItemId(itemId);
  };
  
  const handleRetrieveItem = () => {
    if (selectedItem) {
      retrieveItem(selectedItem);
    }
  };
  
  const handleMarkAsWaste = () => {
    if (selectedItem) {
      markAsWaste(selectedItem);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <DashboardStats state={simulationState} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel">
            <Tabs defaultValue={Object.keys(containersByZone)[0] || 'default'}>
              <div className="flex items-center justify-between px-4 pt-4">
                <h2 className="text-lg font-semibold">Cargo Containers</h2>
                <TabsList>
                  {Object.keys(containersByZone).map(zone => (
                    <TabsTrigger key={zone} value={zone}>
                      {zone}
                      <Badge variant="outline" className="ml-2">{containersByZone[zone].length}</Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {Object.keys(containersByZone).map(zone => (
                <TabsContent key={zone} value={zone} className="mt-4">
                  <ScrollArea className="h-[350px]">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4">
                      {containersByZone[zone].map(container => (
                        <ContainerVisualization
                          key={container.id}
                          container={container}
                          selectedItemId={selectedItemId || undefined}
                          onItemClick={handleItemClick}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t">
                    <SymbolLegend />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimeControls
              onNextDay={simulateNextDay}
              onFastForward={simulateDays}
            />
            <ItemSearch onItemFound={handleItemFound} />
          </div>
          
          <div className="glass-panel p-4">
            <h2 className="text-lg font-semibold mb-4">Optimization Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RearrangementPlan plan={getRearrangementPlan()} />
              <WasteDisposal plan={getWasteDisposalPlan()} />
            </div>
          </div>
          
          <SupplyLocationsGlobe />
        </div>
        
        <div className="space-y-4">
          {selectedItem ? (
            <ItemDetails
              item={selectedItem}
              onRetrieve={handleRetrieveItem}
              onMarkAsWaste={handleMarkAsWaste}
            />
          ) : (
            <div className="glass-panel p-6 text-center">
              <p className="text-muted-foreground">Select an item to view details</p>
            </div>
          )}
          
          <ActionLog
            logs={simulationState.logs}
            astronauts={simulationState.astronauts}
            maxHeight="500px"
          />
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <CargoProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <DashboardContent />
        </main>
      </div>
    </CargoProvider>
  );
};

export default Index;
