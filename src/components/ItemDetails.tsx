
import React, { useState } from 'react';
import { CargoItem, Container, PlacementRecommendation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { PackageCheck, PackageX, Trash2, MoveRight, PackagePlus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getRecommendedPlacement } from '@/services/mockData';

interface ItemDetailsProps {
  item: CargoItem;
  containers: Container[];
  onRetrieve?: () => void;
  onMarkAsWaste?: () => void;
  onFindPlacement?: (item: CargoItem) => void;
  onMoveToDisposal?: (item: CargoItem) => void;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({
  item,
  containers = [],
  onRetrieve,
  onMarkAsWaste,
  onFindPlacement,
  onMoveToDisposal,
}) => {
  const isExpired = item.expiryDate && new Date(item.expiryDate) <= new Date();
  const isExhausted = item.usageLimit !== null && item.usageCount >= item.usageLimit;
  
  const [placementRecommendation, setPlacementRecommendation] = useState<PlacementRecommendation | null>(null);
  const [showPlacementDialog, setShowPlacementDialog] = useState(false);
  const [showDisposalDialog, setShowDisposalDialog] = useState(false);
  
  const handleFindPlacement = () => {
    if (onFindPlacement) {
      onFindPlacement(item);
      return;
    }
    
    // Use mock service to get a recommendation
    const recommendation = getRecommendedPlacement(item, containers);
    setPlacementRecommendation(recommendation);
    
    if (recommendation) {
      setShowPlacementDialog(true);
    } else {
      toast({
        title: "No suitable container found",
        description: "Could not find a suitable container for this item",
        variant: "destructive",
      });
    }
  };

  const handleMoveToDisposal = () => {
    if (onMoveToDisposal) {
      onMoveToDisposal(item);
      return;
    }
    
    setShowDisposalDialog(true);
  };

  const confirmPlacement = () => {
    setShowPlacementDialog(false);
    
    if (placementRecommendation) {
      const containerName = containers.find(c => c.id === placementRecommendation.containerId)?.id || 'unknown';
      
      toast({
        title: "Item placed successfully",
        description: `${item.name} placed in container ${containerName}`,
      });
    }
  };

  const confirmMoveToDisposal = () => {
    setShowDisposalDialog(false);
    
    toast({
      title: "Item moved to disposal",
      description: `${item.name} has been moved to the waste disposal area`,
    });
  };
  
  return (
    <>
      <Card className="w-full bg-card border-border">
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
                <PackagePlus size={16} />
                Find Placement
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Placement Recommendation Dialog */}
      <Dialog open={showPlacementDialog} onOpenChange={setShowPlacementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recommended Placement</DialogTitle>
            <DialogDescription>
              We've found an optimal placement for {item.name}
            </DialogDescription>
          </DialogHeader>
          {placementRecommendation && (
            <div className="space-y-4">
              <div className="p-3 bg-secondary/30 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Container</span>
                    <span className="font-medium">{placementRecommendation.containerId}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Zone</span>
                    <span className="font-medium">
                      {containers.find(c => c.id === placementRecommendation.containerId)?.zone}
                    </span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">Reason</span>
                  <p className="text-sm">{placementRecommendation.reason}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlacementDialog(false)}>Cancel</Button>
            <Button onClick={confirmPlacement}>Confirm Placement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Disposal Dialog */}
      <Dialog open={showDisposalDialog} onOpenChange={setShowDisposalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Waste Disposal</DialogTitle>
            <DialogDescription>
              You're about to move {item.name} to the waste disposal area.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisposalDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmMoveToDisposal}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ItemDetails;
