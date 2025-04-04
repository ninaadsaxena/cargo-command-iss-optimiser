
import React from 'react';
import { ActionLog as ActionLogType, Astronaut } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Package, ArrowDownCircle, Shuffle, Trash2, Ship } from 'lucide-react';

interface ActionLogProps {
  logs: ActionLogType[];
  astronauts: Astronaut[];
  className?: string;
  maxHeight?: string;
}

const ActionLog: React.FC<ActionLogProps> = ({
  logs,
  astronauts,
  className,
  maxHeight = '400px'
}) => {
  const getActionIcon = (action: ActionLogType['action']) => {
    switch (action) {
      case 'placement':
        return <Package size={16} className="text-status-success" />;
      case 'retrieval':
        return <ArrowDownCircle size={16} className="text-status-info" />;
      case 'rearrangement':
        return <Shuffle size={16} className="text-status-warning" />;
      case 'waste-marking':
        return <Trash2 size={16} className="text-status-danger" />;
      case 'undocking':
        return <Ship size={16} className="text-nasa-blue" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: ActionLogType['action']) => {
    switch (action) {
      case 'placement':
        return <Badge variant="outline" className="bg-status-success/10 text-status-success">Placement</Badge>;
      case 'retrieval':
        return <Badge variant="outline" className="bg-status-info/10 text-status-info">Retrieval</Badge>;
      case 'rearrangement':
        return <Badge variant="outline" className="bg-status-warning/10 text-status-warning">Rearrangement</Badge>;
      case 'waste-marking':
        return <Badge variant="outline" className="bg-status-danger/10 text-status-danger">Waste</Badge>;
      case 'undocking':
        return <Badge variant="outline" className="bg-nasa-blue/10 text-nasa-blue">Undocking</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getAstronautName = (id: string) => {
    const astronaut = astronauts.find(a => a.id === id);
    return astronaut ? astronaut.name : 'Unknown';
  };

  return (
    <div className={cn("glass-panel", className)}>
      <h3 className="text-lg font-semibold mb-4">Action Log</h3>
      
      <ScrollArea className={cn("pr-4", maxHeight && { maxHeight })}>
        <div className="space-y-3">
          {logs.map((log) => {
            const formattedDate = new Date(log.timestamp).toLocaleString();
            
            return (
              <div 
                key={log.id} 
                className="border-l-2 pl-4 py-2 relative hover:bg-secondary/50 rounded-r-md transition-colors"
                style={{
                  borderLeftColor: getBorderColor(log.action)
                }}
              >
                <div className="absolute -left-2 top-3 p-1 rounded-full bg-secondary">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex items-start justify-between mb-1">
                  <div className="text-sm font-medium">{getAstronautName(log.astronaut)}</div>
                  <div className="text-xs text-muted-foreground">{formattedDate}</div>
                </div>
                
                <p className="text-sm mb-2">{log.description}</p>
                
                <div className="flex gap-2 flex-wrap">
                  {getActionLabel(log.action)}
                  
                  {log.containerId && (
                    <Badge variant="outline" className="bg-secondary/50">
                      Container: {log.containerId}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
          
          {logs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No actions logged yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

function getBorderColor(action: ActionLogType['action']): string {
  switch (action) {
    case 'placement':
      return '#10B981'; // success
    case 'retrieval':
      return '#3B82F6'; // info
    case 'rearrangement':
      return '#F59E0B'; // warning
    case 'waste-marking':
      return '#EF4444'; // danger
    case 'undocking':
      return '#0B3D91'; // nasa blue
    default:
      return '#94A3B8'; // muted
  }
}

export default ActionLog;
