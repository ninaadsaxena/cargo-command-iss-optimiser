
import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supplyLocations } from '@/data/supplyLocations';
import LocationDetails from '@/components/globe/LocationDetails';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

// Use React's lazy loading instead of Next.js dynamic imports
const World = lazy(() => import('@/components/ui/globe').then(m => ({ default: m.World })));

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
  
  // Generate arc data from supply locations
  const arcData = useMemo(() => {
    const colors = ["#06b6d4", "#3b82f6", "#6366f1"];
    
    return supplyLocations
      .filter(loc => loc.active)
      .flatMap((loc, index) => {
        // Create arcs between this location and the next 2 active locations
        const activeLocations = supplyLocations.filter(l => l.active && l.id !== loc.id);
        return activeLocations.slice(0, 2).map((targetLoc, i) => ({
          order: index + 1,
          startLat: loc.coordinates[0],
          startLng: loc.coordinates[1],
          endLat: targetLoc.coordinates[0],
          endLng: targetLoc.coordinates[1],
          arcAlt: 0.2 + (i * 0.1),
          color: colors[Math.floor(Math.random() * colors.length)],
        }));
      });
  }, []);
  
  // Configure the globe
  const globeConfig = {
    pointSize: 4,
    globeColor: "#062056",
    showAtmosphere: true,
    atmosphereColor: "#FFFFFF",
    atmosphereAltitude: 0.1,
    emissive: "#062056",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: "rgba(255,255,255,0.7)",
    ambientLight: "#38bdf8",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime: 1000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    autoRotate: !isDragging,
    autoRotateSpeed: 0.5,
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
        <div 
          className="relative w-full h-[300px] overflow-hidden rounded-md border border-slate-200 dark:border-slate-800"
          onMouseDown={handleStartDrag}
          onMouseMove={handleDrag}
          onMouseUp={handleEndDrag}
          onMouseLeave={handleLeaveDrag}
        >
          <div className="absolute w-full bottom-0 inset-x-0 h-20 bg-gradient-to-b pointer-events-none select-none from-transparent to-black/60 z-40" />
          <div className="absolute w-full -bottom-20 h-full z-10">
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
              <World data={arcData} globeConfig={globeConfig} />
            </Suspense>
          </div>
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
