
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle } from 'lucide-react';

const SymbolLegend = () => {
  return (
    <Card className="mt-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Item Legend</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-muted-foreground">
                <HelpCircle className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <p className="text-xs text-muted-foreground">
                This legend shows the meaning of colors and symbols used in the container visualization.
                Colors indicate priority levels, while symbols represent the item's preferred zone.
              </p>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold">Priority Colors</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[rgba(239,68,68,0.7)]" />
                <span className="text-xs">High Priority (90+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[rgba(245,158,11,0.7)]" />
                <span className="text-xs">Medium-High Priority (70-90)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[rgba(59,130,246,0.7)]" />
                <span className="text-xs">Medium Priority (50-70)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[rgba(16,185,129,0.7)]" />
                <span className="text-xs">Low Priority (&lt;50)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[rgba(239,68,68,0.3)]" />
                <span className="text-xs">Waste Items</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs font-semibold">Zone Symbols</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 text-center">🍲</div>
                <span className="text-xs">Crew Quarters</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 text-center">🧰</div>
                <span className="text-xs">Airlock</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 text-center">🔬</div>
                <span className="text-xs">Laboratory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 text-center">💊</div>
                <span className="text-xs">Medical Bay</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 text-center">📦</div>
                <span className="text-xs">Storage Bay</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 text-center">💻</div>
                <span className="text-xs">Command Center</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SymbolLegend;
