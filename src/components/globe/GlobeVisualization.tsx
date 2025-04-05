
import React, { useState, useRef } from 'react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SupplyLocation } from '@/types';
import { continents } from '@/data/continentsData';

interface GlobeVisualizationProps {
  width: number;
  height: number;
  lngOffset: number;
  activeLocation: string;
  locations: SupplyLocation[];
  rotating: boolean;
  isDragging: boolean;
  onLocationSelect: (id: string) => void;
  onStartDrag: (e: React.MouseEvent) => void;
  onDrag: (e: React.MouseEvent) => void;
  onEndDrag: () => void;
  onLeaveDrag: () => void;
}

const GlobeVisualization: React.FC<GlobeVisualizationProps> = ({
  width,
  height,
  lngOffset,
  activeLocation,
  locations,
  rotating,
  isDragging,
  onLocationSelect,
  onStartDrag,
  onDrag,
  onEndDrag,
  onLeaveDrag
}) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2.5;
  
  // Convert lat/long to x,y coordinates on the globe, taking into account the rotation
  const projectPoint = (lat: number, long: number): [number, number] | null => {
    // Adjust longitude based on current rotation
    const adjustedLong = (long + lngOffset) % 360;
    
    // Check if the point is visible (on the front half of the globe)
    if (adjustedLong > 90 && adjustedLong < 270) {
      return null; // Point is on the back side of the globe
    }
    
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
    <svg
      width={width}
      height={height}
      className="cursor-grab"
      onMouseDown={onStartDrag}
      onMouseMove={onDrag}
      onMouseUp={onEndDrag}
      onMouseLeave={onLeaveDrag}
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
        {locations.map((location) => {
          const projectedPoint = projectPoint(location.coordinates[0], location.coordinates[1]);
          // Skip rendering points on the back side of the globe
          if (!projectedPoint) return null;
          
          const [x, y] = projectedPoint;
          const isActive = location.id === activeLocation;
          const pointRadius = getPointRadius(location.coordinates[1]);
          
          return (
            <g key={location.id} onClick={() => onLocationSelect(location.id)}>
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
  );
};

export default GlobeVisualization;
