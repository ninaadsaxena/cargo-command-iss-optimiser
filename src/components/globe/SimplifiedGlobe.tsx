
import React, { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { SupplyLocation } from '@/types';

interface SimplifiedGlobeProps {
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

const SimplifiedGlobe: React.FC<SimplifiedGlobeProps> = ({
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
  const rotationRef = useRef<number>(lngOffset);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    rotationRef.current = lngOffset;
  }, [lngOffset]);

  useEffect(() => {
    const animate = () => {
      if (rotating) {
        rotationRef.current = (rotationRef.current + 0.1) % 360;
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (rotating) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rotating]);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;
  
  // Convert lat/long to x,y coordinates on the globe
  const projectPoint = (lat: number, long: number): [number, number] | null => {
    // Adjust longitude based on current rotation
    const adjustedLong = (long + rotationRef.current) % 360;
    
    // Check if the point is visible (on the front half of the globe)
    if (adjustedLong > 90 && adjustedLong < 270) {
      return null; // Point is on the back side of the globe
    }
    
    // Simple spherical projection
    const x = centerX + radius * Math.cos((lat * Math.PI) / 180) * Math.sin((adjustedLong * Math.PI) / 180);
    const y = centerY - radius * Math.sin((lat * Math.PI) / 180);
    
    return [x, y];
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
      {/* Earth globe background */}
      <defs>
        <radialGradient id="oceanGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#082F49" stopOpacity="0.7" />
        </radialGradient>
      </defs>
      
      {/* Earth globe base */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="url(#oceanGradient)"
        stroke="#33C3F0"
        strokeWidth="0.5"
      />
      
      {/* Simple latitude/longitude grid */}
      <circle cx={centerX} cy={centerY} r={radius * 0.7} fill="none" stroke="#D3E4FD" strokeWidth="0.3" strokeOpacity="0.2" />
      <circle cx={centerX} cy={centerY} r={radius * 0.4} fill="none" stroke="#D3E4FD" strokeWidth="0.3" strokeOpacity="0.2" />
      
      {/* Simple continents representation as circles */}
      <circle cx={centerX - radius * 0.3} cy={centerY - radius * 0.2} r={radius * 0.2} fill="#ADBCC6" fillOpacity="0.4" />
      <circle cx={centerX + radius * 0.1} cy={centerY - radius * 0.3} r={radius * 0.15} fill="#ADBCC6" fillOpacity="0.4" />
      <circle cx={centerX - radius * 0.1} cy={centerY + radius * 0.3} r={radius * 0.1} fill="#ADBCC6" fillOpacity="0.4" />
      
      {/* Supply location markers */}
      {locations.map((location) => {
        const projectedPoint = projectPoint(location.coordinates[0], location.coordinates[1]);
        // Skip rendering points on the back side of the globe
        if (!projectedPoint) return null;
        
        const [x, y] = projectedPoint;
        const isActive = location.id === activeLocation;
        const pointRadius = 4;
        
        return (
          <g key={location.id} onClick={() => onLocationSelect(location.id)}>
            <circle
              cx={x}
              cy={y}
              r={isActive ? pointRadius + 2 : pointRadius}
              fill={location.active ? (isActive ? "#10B981" : "#3B82F6") : "#94A3B8"}
              stroke="#fff"
              strokeWidth="1"
              className="cursor-pointer hover:stroke-2"
            />
            {isActive && (
              <text
                x={x + 10}
                y={y}
                fontSize="10"
                fill="#fff"
                className="pointer-events-none"
              >
                {location.name.split(' ')[0]}
              </text>
            )}
          </g>
        );
      })}
      
      {/* Location Legend */}
      <g transform={`translate(${width - 100}, 20)`}>
        <rect width="80" height="50" fill="rgba(0,0,0,0.5)" rx="4" />
        <text x="5" y="15" fontSize="8" fill="#fff">Launch Sites</text>
        <circle cx="10" cy="30" r="4" fill="#3B82F6" />
        <text x="20" y="33" fontSize="8" fill="#fff">Active</text>
        <circle cx="10" cy="45" r="4" fill="#94A3B8" />
        <text x="20" y="48" fontSize="8" fill="#fff">Inactive</text>
      </g>
    </svg>
  );
};

export default SimplifiedGlobe;
