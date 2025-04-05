
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import { supplyLocations } from '@/data/supplyLocations';
import LocationDetails from '@/components/globe/LocationDetails';
import GlobeVisualization from '@/components/globe/GlobeVisualization';
import RotationControl from '@/components/globe/RotationControl';
import { SupplyLocation } from '@/types';

const SupplyLocationsGlobe = () => {
  const [activeLocation, setActiveLocation] = useState<string>('ksc');
  const [rotating, setRotating] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lngOffset, setLngOffset] = useState<number>(0);
  const dragStartRef = useRef<{ x: number, startLngOffset: number } | null>(null);
  
  // SVG view parameters
  const width = 400;
  const height = 300;
  
  // Auto rotation effect
  useEffect(() => {
    if (!rotating || isDragging) return;
    
    const interval = setInterval(() => {
      setLngOffset((prev) => (prev + 1) % 360);
    }, 200);
    
    return () => clearInterval(interval);
  }, [rotating, isDragging]);
  
  // Mouse event handlers for interactive rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDragging) return;
    setIsDragging(true);
    dragStartRef.current = { 
      x: e.clientX, 
      startLngOffset: lngOffset 
    };
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const newOffset = (dragStartRef.current.startLngOffset - deltaX / 2) % 360;
    setLngOffset(newOffset);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };
  
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };
  
  const toggleRotation = () => {
    setRotating(!rotating);
  };
  
  const activeLocationData = supplyLocations.find(loc => loc.id === activeLocation);
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Supply Launch Locations</CardTitle>
          <div className="flex gap-2">
            <RotationControl 
              rotating={rotating} 
              onToggleRotation={toggleRotation}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="relative flex justify-center">
          <GlobeVisualization 
            width={width}
            height={height}
            lngOffset={lngOffset}
            activeLocation={activeLocation}
            locations={supplyLocations}
            rotating={rotating}
            isDragging={isDragging}
            onLocationSelect={setActiveLocation}
            onStartDrag={handleMouseDown}
            onDrag={handleMouseMove}
            onEndDrag={handleMouseUp}
            onLeaveDrag={handleMouseLeave}
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
