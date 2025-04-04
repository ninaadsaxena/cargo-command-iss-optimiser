
import React from 'react';
import { SimulationState } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Boxes, Calendar, GaugeCircle, BadgeAlert, ScissorsSquare } from 'lucide-react';

interface DashboardStatsProps {
  state: SimulationState;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ state }) => {
  const totalItems = state.items.length;
  const wasteItems = state.items.filter(item => item.isWaste).length;
  const criticalItems = state.items.filter(item => item.priority > 90).length;
  const nearExpiryItems = state.items.filter(item => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    const currentDate = new Date(state.currentDate);
    const diffTime = expiryDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0; // Within 7 days of expiry
  }).length;
  
  // Calculate average space utilization
  const avgUtilization = state.containers.length > 0
    ? Math.round(state.containers.reduce((sum, container) => sum + container.spaceUtilization, 0) / state.containers.length)
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Current Date</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Date(state.currentDate).toLocaleDateString()}
          </div>
          <p className="text-xs text-muted-foreground">Mission time</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Cargo Items</CardTitle>
          <Boxes className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground">Total managed items</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Space Utilization</CardTitle>
          <GaugeCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgUtilization}%</div>
          <div className="h-1.5 bg-secondary rounded-full w-full mt-1">
            <div 
              className="h-full rounded-full" 
              style={{ 
                width: `${avgUtilization}%`,
                backgroundColor: avgUtilization > 80 
                  ? '#EF4444' 
                  : avgUtilization > 60 
                    ? '#F59E0B' 
                    : '#10B981'
              }} 
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Average across containers</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
          <BadgeAlert className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{criticalItems}</div>
          <p className="text-xs text-muted-foreground">
            High priority (90+)
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Waste Management</CardTitle>
          <ScissorsSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{wasteItems}</div>
          <p className="text-xs text-muted-foreground">
            Waste items requiring disposal
          </p>
          {nearExpiryItems > 0 && (
            <Badge variant="outline" className="mt-1 bg-status-warning/10 text-status-warning text-xs">
              {nearExpiryItems} items near expiry
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
