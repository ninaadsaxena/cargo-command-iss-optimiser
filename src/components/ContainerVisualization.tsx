
import React from 'react';
import { cn } from '@/lib/utils';
import { Container, CargoItem } from '@/types';
import { ArrowUpCircle, Box } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

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
  // Calculate the scale to fit the container in the viewport
  const maxSize = Math.max(container.width, container.depth, container.height);
  const scale = 300 / maxSize; // Assume max visualization size is 300px
  
  // Get container color based on zone
  const containerColor = getContainerColor(container.zone);
  
  return (
    <div className={cn("glass-panel p-4", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Box className="mr-2 text-muted-foreground" size={16} />
          <h3 className="text-lg font-semibold">{container.id}</h3>
        </div>
        <span className="text-sm text-muted-foreground">{container.zone}</span>
      </div>
      
      <div 
        className="relative border border-muted rounded-lg overflow-hidden grid-pattern bg-secondary/30"
        style={{
          width: container.width * scale,
          height: container.height * scale,
          backgroundImage: `linear-gradient(45deg, ${containerColor}10 25%, transparent 25%, transparent 75%, ${containerColor}10 75%, ${containerColor}10), 
                            linear-gradient(45deg, ${containerColor}10 25%, transparent 25%, transparent 75%, ${containerColor}10 75%, ${containerColor}10)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
          boxShadow: `inset 0 0 30px ${containerColor}40`,
        }}
      >
        {/* Container dimensions */}
        <div className="absolute top-2 left-2 flex items-center gap-1 text-xs bg-background/70 p-1 rounded">
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
          };
          
          // Determine appropriate symbol/icon for the item type
          const symbol = getItemSymbol(item);
          const bgColor = getItemColor(item);
          
          return (
            <HoverCard key={item.id}>
              <HoverCardTrigger asChild>
                <div
                  className={cn(
                    "absolute rounded border cursor-pointer transition-transform hover:translate-y-[-2px] flex items-center justify-center",
                    selectedItemId === item.id ? "ring-2 ring-accent shadow-lg" : "border-muted/50"
                  )}
                  style={{
                    ...itemStyle,
                    backgroundColor: bgColor,
                    opacity: item.isWaste ? 0.5 : 1,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                  onClick={() => onItemClick && onItemClick(item)}
                >
                  <div className="text-xs font-bold text-foreground mix-blend-difference">
                    {symbol}
                  </div>
                  
                  {/* Status indicators as small dots */}
                  <div className="absolute inset-0 pointer-events-none">
                    {item.isWaste && (
                      <div className="absolute top-0 right-0 bg-status-danger w-2 h-2 rounded-full"></div>
                    )}
                    
                    {item.priority > 80 && (
                      <div className="absolute top-0 left-0 bg-status-info w-2 h-2 rounded-full"></div>
                    )}
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 p-3">
                <div className="space-y-2">
                  <h4 className="font-semibold">{item.name}</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div>Priority: <span className="font-semibold">{item.priority}</span></div>
                    <div>Mass: <span className="font-semibold">{item.mass} kg</span></div>
                    <div>Dimensions: <span className="font-semibold">{item.width}×{item.depth}×{item.height} cm</span></div>
                    {item.expiryDate && (
                      <div>Expires: <span className="font-semibold">{new Date(item.expiryDate).toLocaleDateString()}</span></div>
                    )}
                    {item.usageLimit !== null && (
                      <div>Usage: <span className="font-semibold">{item.usageCount}/{item.usageLimit}</span></div>
                    )}
                    <div className="col-span-2">Zone: <span className="font-semibold">{item.preferredZone}</span></div>
                  </div>
                  {item.isWaste && (
                    <div className="bg-status-danger/10 text-status-danger text-xs p-1 rounded">
                      Marked as waste
                    </div>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
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

// Helper function to get container color based on zone
function getContainerColor(zone: string): string {
  switch (zone) {
    case 'Crew Quarters':
      return '#4B9CD3'; // Blue
    case 'Airlock':
      return '#F59E0B'; // Amber
    case 'Laboratory':
      return '#10B981'; // Green
    case 'Storage Bay':
      return '#8B5CF6'; // Purple
    case 'Medical Bay':
      return '#EF4444'; // Red
    case 'Command Center':
      return '#6366F1'; // Indigo
    default:
      return '#6B7280'; // Gray
  }
}

// Helper function to get a symbol based on item characteristics
function getItemSymbol(item: CargoItem): string {
  if (item.isWaste) {
    return '♻️';
  }
  
  // Based on item preferred zone
  switch (item.preferredZone) {
    case 'Crew Quarters':
      return '🍲';
    case 'Airlock':
      return '🧰';
    case 'Laboratory':
      return '🔬';
    case 'Medical Bay':
      return '💊';
    case 'Storage Bay':
      return '📦';
    case 'Command Center':
      return '💻';
    default:
      return '●';
  }
}

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
