
export type Zone = 'Crew Quarters' | 'Airlock' | 'Laboratory' | 'Storage Bay' | 'Medical Bay' | 'Command Center';

export interface CargoItem {
  id: string;
  name: string;
  width: number;
  depth: number;
  height: number;
  mass: number;
  priority: number;
  expiryDate: string | null; // ISO date string or null if no expiry
  usageLimit: number | null; // null if unlimited
  usageCount: number;
  preferredZone: Zone;
  isWaste: boolean;
  position?: {
    containerId: string;
    x: number;
    y: number;
    z: number;
  };
}

export interface Container {
  id: string;
  zone: Zone;
  width: number;
  depth: number;
  height: number;
  items: CargoItem[];
  spaceUtilization: number; // percentage of space used
}

export interface ActionLog {
  id: string;
  timestamp: string;
  astronaut: string;
  action: 'placement' | 'retrieval' | 'rearrangement' | 'waste-marking' | 'undocking';
  description: string;
  itemId?: string;
  containerId?: string;
}

export interface Astronaut {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface PlacementRecommendation {
  item: CargoItem;
  containerId: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  steps: number;
  reason: string;
}

export interface RetrievalInstruction {
  item: CargoItem;
  containerId: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  steps: number;
  itemsToMove: CargoItem[];
}

export interface RearrangementPlan {
  steps: {
    item: CargoItem;
    fromContainer: string;
    toContainer: string;
    reason: string;
  }[];
  spaceGained: number;
  timeEstimate: number; // in minutes
}

export interface WasteDisposalPlan {
  wasteItems: CargoItem[];
  containerForDisposal: string;
  totalMass: number;
}

export interface SimulationState {
  currentDate: string; // ISO date string
  containers: Container[];
  items: CargoItem[];
  logs: ActionLog[];
  astronauts: Astronaut[];
}
