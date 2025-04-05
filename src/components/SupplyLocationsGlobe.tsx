
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supplyLocations } from '@/data/supplyLocations';
import LocationDetails from '@/components/globe/LocationDetails';
import { SupplyLocation } from '@/types';
import { World } from '@/components/ui/globe';

const SupplyLocationsGlobe = () => {
  const [activeLocation, setActiveLocation] = useState<string>('ksc');
  
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
    initialPosition: { lat: 22.3193, lng: 114.1694 },
    autoRotate: true,
    autoRotateSpeed: 0.5,
  };
  
  // Generate arcs based on supply locations
  const arcs = generateArcsFromLocations(supplyLocations);
  
  const activeLocationData = supplyLocations.find(loc => loc.id === activeLocation);
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Supply Launch Locations</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="relative w-full h-[300px] overflow-hidden">
          <World data={arcs} globeConfig={globeConfig} />
        </div>
        
        {/* Location details for the currently active supply location */}
        <div className="mt-4 text-sm">
          <LocationDetails location={activeLocationData} />
        </div>
      </CardContent>
    </Card>
  );
};

// Function to generate arcs between supply locations
function generateArcsFromLocations(locations: SupplyLocation[]) {
  const colors = ["#06b6d4", "#3b82f6", "#6366f1"];
  const arcs = [];
  
  // Generate connections between active locations
  const activeLocations = locations.filter(loc => loc.active);
  
  for (let i = 0; i < activeLocations.length; i++) {
    for (let j = i + 1; j < activeLocations.length; j++) {
      if (Math.random() > 0.3) { // Only create some connections, not all
        arcs.push({
          order: Math.floor(Math.random() * 5) + 1,
          startLat: activeLocations[i].coordinates[0],
          startLng: activeLocations[i].coordinates[1],
          endLat: activeLocations[j].coordinates[0],
          endLng: activeLocations[j].coordinates[1],
          arcAlt: Math.random() * 0.3 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }
  }
  
  return arcs;
}

export default SupplyLocationsGlobe;
