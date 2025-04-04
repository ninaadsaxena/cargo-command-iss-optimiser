
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FastForward, Calendar, SkipForward } from 'lucide-react';

interface TimeControlsProps {
  onNextDay: () => void;
  onFastForward: (days: number) => void;
}

const TimeControls: React.FC<TimeControlsProps> = ({
  onNextDay,
  onFastForward,
}) => {
  const [daysToForward, setDaysToForward] = useState(7);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar size={18} />
          <span>Time Simulation</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={onNextDay}
            className="flex-1 gap-2"
          >
            <SkipForward size={16} />
            Next Day
          </Button>
          
          <div className="flex items-center space-x-2 flex-1">
            <Input
              type="number"
              min="1"
              max="365"
              value={daysToForward}
              onChange={(e) => setDaysToForward(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
              className="w-20"
            />
            <Button 
              onClick={() => onFastForward(daysToForward)}
              className="flex-1 gap-2"
            >
              <FastForward size={16} />
              Fast Forward
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeControls;
