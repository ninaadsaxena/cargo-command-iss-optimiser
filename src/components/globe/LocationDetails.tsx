
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SupplyLocation } from '@/types';

interface LocationDetailsProps {
  location: SupplyLocation | undefined;
}

const LocationDetails: React.FC<LocationDetailsProps> = ({ location }) => {
  if (!location) return null;
  
  return (
    <div className="flex flex-col space-y-1">
      <h4 className="font-semibold">
        {location.name}
        {' '}
        <span className="text-muted-foreground font-normal">
          ({location.country})
        </span>
      </h4>
      
      <div className="flex gap-2">
        {location.active ? (
          <Badge className="bg-status-success">Active</Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
        )}
        
        {location.nextLaunch && (
          <Badge variant="outline" className="bg-status-info/10 text-status-info">
            Next Launch: {new Date(location.nextLaunch).toLocaleDateString()}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default LocationDetails;
