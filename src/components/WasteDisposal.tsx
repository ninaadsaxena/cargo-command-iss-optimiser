
import React from 'react';
import { WasteDisposalPlan as WasteDisposalPlanType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Weight, Ship } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface WasteDisposalProps {
  plan: WasteDisposalPlanType;
  onDispose?: () => void;
}

const WasteDisposal: React.FC<WasteDisposalProps> = ({ plan, onDispose }) => {
  const handleDispose = () => {
    if (onDispose) {
      onDispose();
    } else {
      toast({
        title: "Preparing for undocking",
        description: `${plan.wasteItems.length} waste items prepared for disposal`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="text-status-danger" size={20} />
            <span>Waste Disposal Plan</span>
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Weight size={14} />
            <span>{plan.totalMass} kg</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {plan.wasteItems.length > 0 ? (
          <>
            <div className="p-3 bg-secondary/30 rounded-lg">
              <div className="font-medium flex items-center gap-2 mb-2">
                <Ship size={16} className="text-nasa-blue" />
                <span>Disposal Container: {plan.containerForDisposal}</span>
              </div>
              
              <div className="text-sm text-muted-foreground mb-3">
                {plan.wasteItems.length} items ready for disposal
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {plan.wasteItems.slice(0, 6).map((item) => (
                  <Badge key={item.id} variant="outline" className="justify-start">
                    {item.name}
                  </Badge>
                ))}
                
                {plan.wasteItems.length > 6 && (
                  <Badge variant="outline" className="justify-start">
                    +{plan.wasteItems.length - 6} more items
                  </Badge>
                )}
              </div>
            </div>
            
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleDispose}
            >
              Prepare for Undocking
            </Button>
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No waste items to dispose of at this time
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WasteDisposal;
