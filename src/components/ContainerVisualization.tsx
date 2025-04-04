
import React from 'react';
import { cn } from '@/lib/utils';
import { Container, CargoItem } from '@/types';
import { ArrowUpCircle } from 'lucide-react';

interface ContainerVisualizationProps {
  container: Container;
  selectedItemId?: string;
  onItemClick?: (item: CargoItem) => void;
  className?: string;
}

const ContainerVisualization: React.FC<ContainerVisualizationProps> = ({
  container,
  selectedItemId,
  onItemClick,
  className
}) => {
  // This is a simplified 2D visualization
  // In a real application, we'd use a 3D library like Three.js
  
  // Calculate the scale to fit the container in the viewport
  const maxSize = Math.max(container.width, container.depth, container.height);
  const scale = 300 / maxSize; // Assume max visualization size is 300px
  
  return (
    <div className={cn("glass-panel p-4", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{container.id}</h3>
        <span className="text-sm text-muted-foreground">{container.zone}</span>
      </div>
      
      <div 
        className="relative border border-muted rounded-lg overflow-hidden grid-pattern bg-secondary/30"
        style={{
          width: container.width * scale,
          height: container.height * scale,
        }}
      >
        {/* Container dimensions */}
        <div className="absolute top-2 left-2 flex items-center gap-1 text-xs bg-background/50 p-1 rounded">
          <span>W: {container.width}cm</span>
          <span>×</span>
          <span>D: {container.depth}cm</span>
          <span>×</span>
          <span>H: {container.height}cm</span>
        </div>
        
        {/* Open face indicator */}
        <div className="absolute top-1/2 right-2 transform -translate-y-1/2 text-accent">
          <ArrowUpCircle className="rotate-90" size={16} />
          <span className="text-xs">Open face</span>
        </div>
        
        {/* Items */}
        {container.items.map((item) => {
          if (!item.position) return null;
          
          // Calculate item position in the container
          const itemStyle = {
            width: item.width * scale,
            height: item.height * scale,
            left: item.position.x * scale,
            top: item.position.z * scale, // In 2D view, we map Z (height) to Y
            backgroundColor: getItemColor(item),
            opacity: item.isWaste ? 0.5 : 1,
          };
          
          return (
            <div
              key={item.id}
              className={cn(
                "absolute rounded border cursor-pointer transition-transform hover:translate-y-[-2px]",
                selectedItemId === item.id ? "ring-2 ring-accent shadow-lg" : "border-muted/50"
              )}
              style={itemStyle}
              onClick={() => onItemClick && onItemClick(item)}
              title={`${item.name} (Priority: ${item.priority})`}
            >
              <div className="absolute inset-0 flex items-center justify-center text-xs p-1 truncate">
                {item.name}
              </div>
              
              {item.isWaste && (
                <div className="absolute top-0 right-0 bg-status-danger w-2 h-2 rounded-full"></div>
              )}
              
              {item.priority > 80 && (
                <div className="absolute top-0 left-0 bg-status-info w-2 h-2 rounded-full"></div>
              )}
            </div>
          );
        })}
        
        {/* Utilization indicator */}
        <div className="absolute bottom-2 left-2 w-24 h-2 bg-black/20 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full"
            style={{ 
              width: `${container.spaceUtilization}%`,
              backgroundColor: getUtilizationColor(container.spaceUtilization)
            }}
          />
        </div>
        <div className="absolute bottom-2 left-28 text-xs">
          {container.spaceUtilization}% full
        </div>
      </div>
    </div>
  );
};

// Helper function to get color based on item priority
function getItemColor(item: CargoItem): string {
  if (item.isWaste) {
    return 'rgba(239, 68, 68, 0.3)'; // Red with transparency
  }
  
  // Priority-based coloring
  if (item.priority > 90) {
    return 'rgba(239, 68, 68, 0.7)'; // High priority - Red
  } else if (item.priority > 70) {
    return 'rgba(245, 158, 11, 0.7)'; // Medium-high priority - Amber
  } else if (item.priority > 50) {
    return 'rgba(59, 130, 246, 0.7)'; // Medium priority - Blue
  } else {
    return 'rgba(16, 185, 129, 0.7)'; // Low priority - Green
  }
}

// Helper function to get color based on container utilization
function getUtilizationColor(utilization: number): string {
  if (utilization > 90) {
    return '#EF4444'; // Red for high utilization
  } else if (utilization > 70) {
    return '#F59E0B'; // Amber for medium-high utilization
  } else if (utilization > 50) {
    return '#3B82F6'; // Blue for medium utilization
  } else {
    return '#10B981'; // Green for low utilization
  }
}

export default ContainerVisualization;
