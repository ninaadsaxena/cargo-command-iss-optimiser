
import React from 'react';
import { SupplyLocation } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Calendar, MapPin } from 'lucide-react';

interface LocationDetailsProps {
  location?: SupplyLocation | null;
}

const LocationDetails: React.FC<LocationDetailsProps> = ({ location }) => {
  if (!location) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Select a location to view details
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-medium text-base">{location.name}</h3>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <MapPin size={12} />
              <span>{location.country}</span>
            </div>
          </div>
          
          <Badge variant={location.active ? "success" : "secondary"}>
            {location.active ? "Active" : "Inactive"}
          </Badge>
        </div>
        
        {location.lastLaunch && (
          <div className="flex items-center justify-between text-xs mt-2">
            <div className="flex items-center gap-1">
              <Calendar size={12} className="text-muted-foreground" />
              <span>Last Launch:</span>
            </div>
            <span>{new Date(location.lastLaunch).toLocaleDateString()}</span>
          </div>
        )}
        
        {location.nextLaunch && (
          <div className="flex items-center justify-between text-xs mt-1">
            <div className="flex items-center gap-1">
              <Package size={12} className="text-muted-foreground" />
              <span>Next Launch:</span>
            </div>
            <span>{new Date(location.nextLaunch).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationDetails;
