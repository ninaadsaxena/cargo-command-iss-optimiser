
import React from 'react';
import { RearrangementPlan as RearrangementPlanType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Clock, ArrowRight } from 'lucide-react';

interface RearrangementPlanProps {
  plan: RearrangementPlanType;
  onExecute?: () => void;
}

const RearrangementPlan: React.FC<RearrangementPlanProps> = ({ plan, onExecute }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="text-status-warning" size={20} />
            <span>Rearrangement Plan</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock size={14} />
              <span>{plan.timeEstimate} mins</span>
            </Badge>
            <Badge variant="outline" className="bg-status-success/10 text-status-success">
              +{plan.spaceGained}% space
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {plan.steps.length > 0 ? (
          <>
            <div className="space-y-3">
              {plan.steps.map((step, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{step.item.name}</div>
                    <div className="text-sm text-muted-foreground">{step.reason}</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{step.fromContainer}</Badge>
                    <ArrowRight size={16} className="text-muted-foreground" />
                    <Badge variant="outline" className="bg-status-info/10 text-status-info">
                      {step.toContainer}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              className="w-full" 
              onClick={onExecute}
            >
              Execute Rearrangement
            </Button>
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No rearrangement needed at this time
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RearrangementPlan;
