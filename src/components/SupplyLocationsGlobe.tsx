
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supplyLocations } from '@/data/supplyLocations';
import LocationDetails from '@/components/globe/LocationDetails';
import { SupplyLocation } from '@/types';
import { Badge } from '@/components/ui/badge';
import GlobeVisualization from '@/components/globe/SimplifiedGlobe';

const SupplyLocationsGlobe = () => {
  const [activeLocation, setActiveLocation] = useState<string>('ksc');
  const [lngOffset, setLngOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMouseX, setLastMouseX] = useState<number>(0);
  
  const activeLocationData = supplyLocations.find(loc => loc.id === activeLocation);
  
  const handleLocationSelect = (id: string) => {
    setActiveLocation(id);
  };
  
  const handleStartDrag = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouseX(e.clientX);
  };
  
  const handleDrag = (e: React.MouseEvent) => {
    if (isDragging) {
      const delta = e.clientX - lastMouseX;
      setLngOffset((prev) => (prev + delta * 0.5) % 360);
      setLastMouseX(e.clientX);
    }
  };
  
  const handleEndDrag = () => {
    setIsDragging(false);
  };
  
  const handleLeaveDrag = () => {
    setIsDragging(false);
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Supply Launch Locations</CardTitle>
          
          <div className="flex gap-1">
            {supplyLocations.filter(loc => loc.active).slice(0, 3).map(loc => (
              <Badge 
                key={loc.id}
                variant={loc.id === activeLocation ? "success" : "outline"}
                className="cursor-pointer hover:bg-secondary"
                onClick={() => setActiveLocation(loc.id)}
              >
                {loc.name.split(' ')[0]}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="relative w-full h-[300px] overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
          <GlobeVisualization 
            width={800}
            height={300}
            lngOffset={lngOffset}
            activeLocation={activeLocation}
            locations={supplyLocations}
            rotating={!isDragging}
            isDragging={isDragging}
            onLocationSelect={handleLocationSelect}
            onStartDrag={handleStartDrag}
            onDrag={handleDrag}
            onEndDrag={handleEndDrag}
            onLeaveDrag={handleLeaveDrag}
          />
        </div>
        
        {/* Location details for the currently active supply location */}
        <div className="mt-4 text-sm">
          <LocationDetails location={activeLocationData} />
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplyLocationsGlobe;
