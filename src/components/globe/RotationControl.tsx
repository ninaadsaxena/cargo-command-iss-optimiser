
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Rotate3D } from 'lucide-react';

interface RotationControlProps {
  rotating: boolean;
  onToggleRotation: () => void;
}

const RotationControl: React.FC<RotationControlProps> = ({ rotating, onToggleRotation }) => {
  return (
    <Badge 
      variant={rotating ? "default" : "outline"} 
      className="cursor-pointer" 
      onClick={onToggleRotation}
    >
      <Rotate3D className="h-3 w-3 mr-1" />
      {rotating ? "Auto-Rotating" : "Static"}
    </Badge>
  );
};

export default RotationControl;
