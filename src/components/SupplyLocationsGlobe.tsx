
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Globe, Rotate3D } from 'lucide-react';

interface SupplyLocation {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number]; // [latitude, longitude]
  active: boolean;
  lastLaunch?: string;
  nextLaunch?: string;
}

// Enhanced supply locations data with more launch sites
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
  {
    id: 'van',
    name: 'Vandenberg Space Force Base',
    country: 'USA',
    coordinates: [34.7420, -120.5724],
    active: true,
    lastLaunch: '2023-12-15',
    nextLaunch: '2024-08-05',
  },
  {
    id: 'sat',
    name: 'Satish Dhawan Space Centre',
    country: 'India',
    coordinates: [13.7199, 80.2304],
    active: true,
    lastLaunch: '2023-10-12',
    nextLaunch: '2024-06-15',
  },
  {
    id: 'ple',
    name: 'Plesetsk Cosmodrome',
    country: 'Russia',
    coordinates: [62.9271, 40.5777],
    active: true,
    lastLaunch: '2023-11-01',
    nextLaunch: '2024-05-28',
  },
  {
    id: 'jiu',
    name: 'Jiuquan Satellite Launch Center',
    country: 'China',
    coordinates: [40.9608, 100.2910],
    active: true,
    lastLaunch: '2023-09-25',
    nextLaunch: '2024-07-12',
  },
  {
    id: 'mah',
    name: 'Mahia Peninsula',
    country: 'New Zealand',
    coordinates: [-39.2599, 177.8645],
    active: true,
    lastLaunch: '2023-10-18',
    nextLaunch: '2024-06-02',
  },
];

// Continents boundaries data - simplified outlines for the SVG
const continents = [
  // North America - simplified path
  "M 110 70 L 160 50 L 190 90 L 180 120 L 150 150 L 130 140 L 100 130 L 90 90 Z",
  // South America
  "M 150 160 L 170 180 L 160 220 L 140 230 L 120 200 L 130 170 Z",
  // Europe
  "M 230 70 L 260 60 L 280 80 L 250 100 L 240 90 Z",
  // Africa
  "M 230 110 L 270 110 L 280 170 L 240 200 L 210 180 L 220 140 Z",
  // Asia
  "M 270 60 L 340 60 L 350 120 L 330 150 L 290 160 L 280 130 L 260 100 Z",
  // Australia
  "M 330 190 L 350 180 L 360 200 L 330 210 Z",
  // Antarctica (simplified)
  "M 130 270 L 230 270 L 280 260 L 200 260 Z",
];

const SupplyLocationsGlobe = () => {
  const [activeLocation, setActiveLocation] = useState<string>('ksc');
  const [rotating, setRotating] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [rotationOffset, setRotationOffset] = useState<number>(0);
  const [lngOffset, setLngOffset] = useState<number>(0);
  const dragStartRef = useRef<{ x: number, startLngOffset: number } | null>(null);
  
  // SVG view parameters
  const width = 400;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2.5;
  
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
  
  // Convert lat/long to x,y coordinates on the globe, taking into account the rotation
  const projectPoint = (lat: number, long: number): [number, number] | null => {
    // Adjust longitude based on current rotation
    const adjustedLong = (long + lngOffset) % 360;
    
    // Check if the point is visible (on the front half of the globe)
    if (adjustedLong > 90 && adjustedLong < 270) {
      return null; // Point is on the back side of the globe
    }
    
    // Scale longitude's visibility to make points fade as they approach the edges
    const visibilityFactor = Math.cos((adjustedLong - 180) * Math.PI / 180);
    
    // Simple spherical projection
    const x = centerX + radius * Math.cos(lat * Math.PI / 180) * Math.sin(adjustedLong * Math.PI / 180);
    const y = centerY - radius * Math.sin(lat * Math.PI / 180);
    
    return [x, y];
  };
  
  // Determine point size based on visibility
  const getPointRadius = (long: number): number => {
    const adjustedLong = (long + lngOffset) % 360;
    const distFromCenter = Math.abs(((adjustedLong + 180) % 360) - 180);
    const visibilityFactor = Math.cos(distFromCenter * Math.PI / 180);
    return 3 + 3 * visibilityFactor;
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Supply Launch Locations</CardTitle>
          <div className="flex gap-2">
            <Badge variant={rotating ? "default" : "outline"} className="cursor-pointer" onClick={() => setRotating(!rotating)}>
              <Rotate3D className="h-3 w-3 mr-1" />
              {rotating ? "Auto-Rotating" : "Static"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="relative flex justify-center">
          <svg
            width={width}
            height={height}
            className="cursor-grab"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={isDragging ? { cursor: 'grabbing' } : {}}
          >
            {/* Earth globe background with realistic gradients */}
            <defs>
              <radialGradient id="oceanGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.9" />
                <stop offset="85%" stopColor="#0C4A6E" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#082F49" stopOpacity="0.7" />
              </radialGradient>
              <radialGradient id="atmosphereGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="80%" stopColor="#D3E4FD" stopOpacity="0" />
                <stop offset="95%" stopColor="#D3E4FD" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#D3E4FD" stopOpacity="0.25" />
              </radialGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            {/* Atmosphere glow effect */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius + 10}
              fill="url(#atmosphereGlow)"
              filter="url(#glow)"
            />
            
            {/* Earth globe base */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="url(#oceanGradient)"
              stroke="#33C3F0"
              strokeWidth="0.5"
              strokeOpacity="0.6"
            />
            
            {/* Continents (simplified shapes) with realistic colors */}
            {continents.map((path, index) => (
              <path
                key={index}
                d={path}
                fill="#8E9196"
                fillOpacity="0.8"
                stroke="#F2FCE2"
                strokeWidth="0.3"
                strokeOpacity="0.4"
                transform={`rotate(${lngOffset}, ${centerX}, ${centerY})`}
              />
            ))}
            
            {/* Graticules (latitude/longitude lines) */}
            <circle cx={centerX} cy={centerY} r={radius * 0.75} fill="none" stroke="#D3E4FD" strokeWidth="0.3" strokeOpacity="0.2" strokeDasharray="1 3" />
            <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="none" stroke="#D3E4FD" strokeWidth="0.3" strokeOpacity="0.2" strokeDasharray="1 3" />
            <circle cx={centerX} cy={centerY} r={radius * 0.25} fill="none" stroke="#D3E4FD" strokeWidth="0.3" strokeOpacity="0.2" strokeDasharray="1 3" />
            
            {/* Longitude lines */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
              <line 
                key={`long-${idx}`}
                x1={centerX}
                y1={centerY - radius}
                x2={centerX} 
                y2={centerY + radius}
                stroke="#D3E4FD"
                strokeWidth="0.3"
                strokeOpacity="0.2"
                strokeDasharray="1 3"
                transform={`rotate(${angle + lngOffset}, ${centerX}, ${centerY})`}
              />
            ))}
            
            {/* ISS orbit path (simplified) */}
            <ellipse
              cx={centerX}
              cy={centerY}
              rx={radius * 0.8}
              ry={radius * 0.3}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="0.8"
              strokeDasharray="2 2"
              className="opacity-60"
              transform={`rotate(${lngOffset / 2}, ${centerX}, ${centerY})`}
            />
            
            {/* ISS position (simplified) */}
            <circle
              cx={centerX + radius * 0.8 * Math.cos(Date.now() / 10000)}
              cy={centerY + radius * 0.3 * Math.sin(Date.now() / 10000)}
              r={3}
              fill="#F59E0B"
              className="animate-pulse-slow"
              transform={`rotate(${lngOffset / 2}, ${centerX}, ${centerY})`}
            />
            
            {/* Supply location markers */}
            <TooltipProvider>
              {supplyLocations.map((location) => {
                const projectedPoint = projectPoint(location.coordinates[0], location.coordinates[1]);
                // Skip rendering points on the back side of the globe
                if (!projectedPoint) return null;
                
                const [x, y] = projectedPoint;
                const isActive = location.id === activeLocation;
                const pointRadius = getPointRadius(location.coordinates[1]);
                
                return (
                  <g key={location.id} onClick={() => setActiveLocation(location.id)}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? pointRadius + 2 : pointRadius}
                          fill={location.active ? (isActive ? "#10B981" : "#3B82F6") : "#94A3B8"}
                          stroke="#fff"
                          strokeWidth="1"
                          className="cursor-pointer hover:stroke-2"
                          style={{ filter: isActive ? 'drop-shadow(0 0 3px #10B981)' : undefined }}
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
            
            {/* Clouds layer overlay (simplified) */}
            <g transform={`rotate(${lngOffset * 0.7}, ${centerX}, ${centerY})`} opacity="0.15">
              <path 
                d="M 120 80 Q 140 70 160 85 Q 175 75 190 90 Q 180 100 190 110 Q 175 115 160 105 Q 145 120 130 110 Q 115 115 120 95 Q 110 85 120 80 Z" 
                fill="#fff" 
                opacity="0.5" 
              />
              <path 
                d="M 260 150 Q 280 140 300 155 Q 315 145 330 160 Q 320 170 330 180 Q 315 185 300 175 Q 285 190 270 180 Q 255 185 260 165 Q 250 155 260 150 Z" 
                fill="#fff" 
                opacity="0.5" 
              />
              <path 
                d="M 180 220 Q 200 210 220 225 Q 235 215 250 230 Q 240 240 250 250 Q 235 255 220 245 Q 205 260 190 250 Q 175 255 180 235 Q 170 225 180 220 Z" 
                fill="#fff" 
                opacity="0.5" 
              />
            </g>
            
            {/* Earth glare effect */}
            <circle
              cx={centerX - radius * 0.4}
              cy={centerY - radius * 0.4}
              r={radius * 0.15}
              fill="white"
              opacity="0.05"
            />
          </svg>
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
