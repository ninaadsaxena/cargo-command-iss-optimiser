
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

interface SupplyLocation {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number]; // [latitude, longitude]
  active: boolean;
  lastLaunch?: string;
  nextLaunch?: string;
}

// Sample supply locations data
const supplyLocations: SupplyLocation[] = [
  {
    id: 'ksc',
    name: 'Kennedy Space Center',
    country: 'USA',
    coordinates: [28.5729, -80.6490],
    active: true,
    lastLaunch: '2023-11-09',
    nextLaunch: '2024-05-15',
  },
  {
    id: 'bai',
    name: 'Baikonur Cosmodrome',
    country: 'Kazakhstan',
    coordinates: [45.9646, 63.3052],
    active: true,
    lastLaunch: '2023-09-14',
    nextLaunch: '2024-06-22',
  },
  {
    id: 'tan',
    name: 'Tanegashima Space Center',
    country: 'Japan',
    coordinates: [30.3813, 130.9687],
    active: false,
    lastLaunch: '2023-02-18',
  },
  {
    id: 'gui',
    name: 'Guiana Space Centre',
    country: 'French Guiana',
    coordinates: [5.1679, -52.6832],
    active: true,
    lastLaunch: '2023-10-30',
    nextLaunch: '2024-07-08',
  },
  {
    id: 'wen',
    name: 'Wenchang Space Launch Site',
    country: 'China',
    coordinates: [19.6145, 110.9510],
    active: false,
    lastLaunch: '2023-05-10',
  },
];

// We're using a simplified SVG globe for this component
// In a real application, you could use a 3D library like Three.js or Cesium for better visualization
const SupplyLocationsGlobe = () => {
  const [activeLocation, setActiveLocation] = useState<string>('ksc');
  const [rotating, setRotating] = useState<boolean>(true);
  
  // SVG view parameters
  const width = 400;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2.5;
  
  // Convert lat/long to x,y coordinates on the 2D globe projection
  const projectPoint = (lat: number, long: number): [number, number] => {
    // Simple equirectangular projection
    const x = centerX + radius * Math.cos(lat * Math.PI / 180) * Math.sin(long * Math.PI / 180);
    const y = centerY - radius * Math.sin(lat * Math.PI / 180);
    return [x, y];
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Supply Launch Locations</CardTitle>
          <Badge variant={rotating ? "default" : "outline"} className="cursor-pointer" onClick={() => setRotating(!rotating)}>
            {rotating ? "Auto-Rotating" : "Static"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="relative flex justify-center">
          <svg
            width={width}
            height={height}
            className={rotating ? "animate-rotate-slow" : ""}
          >
            {/* Globe background */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3B82F6"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            
            {/* Graticules (latitude/longitude lines) */}
            <circle cx={centerX} cy={centerY} r={radius * 0.75} fill="none" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2 4" />
            <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="none" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2 4" />
            <circle cx={centerX} cy={centerY} r={radius * 0.25} fill="none" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2 4" />
            
            {/* Vertical lines */}
            <line x1={centerX} y1={centerY - radius} x2={centerX} y2={centerY + radius} stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2 4" />
            <line x1={centerX - radius} y1={centerY} x2={centerX + radius} y2={centerY} stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2 4" />
            
            {/* Supply location markers */}
            <TooltipProvider>
              {supplyLocations.map((location) => {
                const [x, y] = projectPoint(location.coordinates[0], location.coordinates[1]);
                const isActive = location.id === activeLocation;
                
                return (
                  <g key={location.id} onClick={() => setActiveLocation(location.id)}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? 6 : 4}
                          fill={location.active ? (isActive ? "#10B981" : "#3B82F6") : "#94A3B8"}
                          stroke="#fff"
                          strokeWidth="1"
                          className="cursor-pointer hover:stroke-2"
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="space-y-1">
                          <p className="font-semibold">{location.name}</p>
                          <p className="text-xs">{location.country}</p>
                          {location.active && location.nextLaunch && (
                            <p className="text-xs">Next launch: {new Date(location.nextLaunch).toLocaleDateString()}</p>
                          )}
                          {!location.active && (
                            <Badge variant="outline" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </g>
                );
              })}
            </TooltipProvider>
            
            {/* ISS orbit path (simplified) */}
            <ellipse
              cx={centerX}
              cy={centerY}
              rx={radius * 0.8}
              ry={radius * 0.3}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1"
              strokeDasharray="3 3"
              className="opacity-50"
            />
            
            {/* ISS position (simplified) */}
            <circle
              cx={centerX + radius * 0.8 * Math.cos(Date.now() / 10000)}
              cy={centerY + radius * 0.3 * Math.sin(Date.now() / 10000)}
              r={3}
              fill="#F59E0B"
              className="animate-pulse-slow"
            />
          </svg>
          
          {/* Earth icon overlay */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
            <Globe size={radius * 1.5} />
          </div>
        </div>
        
        {/* Location details for the currently active supply location */}
        <div className="mt-4 text-sm">
          {supplyLocations.find(loc => loc.id === activeLocation) && (
            <div className="flex flex-col space-y-1">
              <h4 className="font-semibold">
                {supplyLocations.find(loc => loc.id === activeLocation)?.name}
                {' '}
                <span className="text-muted-foreground font-normal">
                  ({supplyLocations.find(loc => loc.id === activeLocation)?.country})
                </span>
              </h4>
              
              <div className="flex gap-2">
                {supplyLocations.find(loc => loc.id === activeLocation)?.active ? (
                  <Badge className="bg-status-success">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                )}
                
                {supplyLocations.find(loc => loc.id === activeLocation)?.nextLaunch && (
                  <Badge variant="outline" className="bg-status-info/10 text-status-info">
                    Next Launch: {new Date(supplyLocations.find(loc => loc.id === activeLocation)?.nextLaunch || '').toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplyLocationsGlobe;
