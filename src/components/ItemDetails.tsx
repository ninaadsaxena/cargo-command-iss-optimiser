import React from 'react';
import { CargoItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { PackageCheck, PackageX, Trash2, MoveRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ItemDetailsProps {
  item: CargoItem;
  onRetrieve?: () => void;
  onMarkAsWaste?: () => void;
  onFindPlacement?: (item: CargoItem) => void;
  onMoveToDisposal?: (item: CargoItem) => void;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({
  item,
  onRetrieve,
  onMarkAsWaste,
  onFindPlacement,
  onMoveToDisposal,
}) => {
  const isExpired = item.expiryDate && new Date(item.expiryDate) <= new Date();
  const isExhausted = item.usageLimit !== null && item.usageCount >= item.usageLimit;
  
  const handleFindPlacement = () => {
    if (onFindPlacement) {
      onFindPlacement(item);
    } else {
      toast({
        title: "Finding placement...",
        description: `Searching for optimal placement for ${item.name}`,
      });
    }
  };

  const handleMoveToDisposal = () => {
    if (onMoveToDisposal) {
      onMoveToDisposal(item);
    } else {
      toast({
        title: "Moving to disposal...",
        description: `Preparing ${item.name} for disposal`,
      });
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{item.name}</CardTitle>
          <div className="flex gap-2">
            {item.isWaste ? (
              <Badge variant="destructive">Waste</Badge>
            ) : (
              <>
                {isExpired && <Badge variant="destructive">Expired</Badge>}
                {isExhausted && <Badge variant="destructive">Exhausted</Badge>}
                <Badge 
                  variant={item.priority > 80 ? "default" : "outline"}
                  className={
                    item.priority > 80 
                      ? "bg-status-danger" 
                      : item.priority > 60 
                        ? "bg-status-warning text-foreground" 
                        : "bg-status-info text-foreground"
                  }
                >
                  Priority: {item.priority}
                </Badge>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Dimensions</span>
            <span className="font-mono">{item.width}×{item.depth}×{item.height} cm</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Mass</span>
            <span className="font-mono">{item.mass} kg</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Preferred Zone</span>
            <span>{item.preferredZone}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Current Location</span>
            <span>
              {item.position 
                ? `Container ${item.position.containerId}` 
                : 'Not stored'}
            </span>
          </div>
          
          {item.expiryDate && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Expiry Date</span>
              <span className={isExpired ? "text-status-danger" : ""}>
                {new Date(item.expiryDate).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {item.usageLimit !== null && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Usage</span>
              <span className={isExhausted ? "text-status-danger" : ""}>
                {item.usageCount} / {item.usageLimit}
              </span>
            </div>
          )}
        </div>
        
        <Separator />
        
        <div className="flex justify-between">
          {!item.isWaste && item.position && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={onRetrieve}
              className="gap-2"
            >
              <PackageCheck size={16} />
              Retrieve Item
            </Button>
          )}
          
          {!item.isWaste && (isExpired || isExhausted) && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onMarkAsWaste}
              className="gap-2"
            >
              <Trash2 size={16} />
              Mark as Waste
            </Button>
          )}
          
          {item.isWaste && (
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={handleMoveToDisposal}
            >
              <MoveRight size={16} />
              Move to Disposal
            </Button>
          )}
          
          {!item.position && !item.isWaste && (
            <Button 
              variant="default" 
              size="sm"
              className="gap-2"
              onClick={handleFindPlacement}
            >
              <PackageX size={16} />
              Find Placement
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemDetails;
