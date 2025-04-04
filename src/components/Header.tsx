
import React from 'react';
import { useCargoContext } from '@/contexts/CargoContext';
import { Button } from '@/components/ui/button';
import { HelpCircle, AlertCircle } from 'lucide-react';

const Header: React.FC = () => {
  const { simulationState } = useCargoContext();
  const currentDate = new Date(simulationState.currentDate);
  
  return (
    <header className="py-3 px-4 glass-panel flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-nasa-red">ISS</span> Cargo Command Optimizer
          </h1>
          <p className="text-sm text-muted-foreground">
            Optimizing stowage operations for the International Space Station
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Current Mission Date</div>
          <div className="font-mono font-bold">
            {currentDate.toLocaleDateString()} - {currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="icon">
            <HelpCircle size={18} />
          </Button>
          <Button variant="outline" size="icon">
            <AlertCircle size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
