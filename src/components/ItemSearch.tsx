
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Package } from 'lucide-react';
import { useCargoContext } from '@/contexts/CargoContext';
import { toast } from '@/hooks/use-toast';

interface ItemSearchProps {
  onItemFound?: (itemId: string) => void;
}

const ItemSearch: React.FC<ItemSearchProps> = ({ onItemFound }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { searchItem, addLog, simulationState } = useCargoContext();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Search Error',
        description: 'Please enter a search term',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate a search delay
    setTimeout(() => {
      const result = searchItem(searchQuery);
      
      if (result) {
        toast({
          title: 'Item Found',
          description: `Found ${result.item.name} in container ${result.containerId}`,
        });
        
        // Log the search
        addLog({
          astronaut: simulationState.astronauts[0].id, // Default to first astronaut
          action: 'retrieval',
          description: `Searched for and found ${result.item.name}`,
          itemId: result.item.id,
          containerId: result.containerId,
        });
        
        // Notify parent component
        if (onItemFound) {
          onItemFound(result.item.id);
        }
      } else {
        toast({
          title: 'No Results',
          description: `No items match "${searchQuery}"`,
          variant: 'destructive',
        });
      }
      
      setIsSearching(false);
    }, 600);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package size={18} />
          <span>Item Search</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-8"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        Search will find the most optimal item based on priority and expiry date
      </CardFooter>
    </Card>
  );
};

export default ItemSearch;
