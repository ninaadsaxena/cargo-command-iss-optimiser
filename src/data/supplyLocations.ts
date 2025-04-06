
import { SupplyLocation } from '@/types';

export const supplyLocations: SupplyLocation[] = [
  {
    id: 'ksc',
    name: 'Kennedy Space Center',
    country: 'USA',
    coordinates: [28.5728, -80.6490],
    active: true,
    lastLaunch: '2025-03-15',
    nextLaunch: '2025-04-20'
  },
  {
    id: 'baikonur',
    name: 'Baikonur Cosmodrome',
    country: 'Kazakhstan',
    coordinates: [45.9644, 63.3050],
    active: true,
    lastLaunch: '2025-03-02',
    nextLaunch: '2025-04-12'
  },
  {
    id: 'tanegashima',
    name: 'Tanegashima Space Center',
    country: 'Japan',
    coordinates: [30.3984, 130.9707],
    active: true,
    lastLaunch: '2025-02-28',
    nextLaunch: '2025-05-01'
  },
  {
    id: 'kourou',
    name: 'Guiana Space Centre',
    country: 'French Guiana',
    coordinates: [5.2320, -52.7693],
    active: true,
    lastLaunch: '2025-03-10',
    nextLaunch: '2025-04-18'
  },
  {
    id: 'vandenberg',
    name: 'Vandenberg Space Force Base',
    country: 'USA',
    coordinates: [34.7420, -120.5724],
    active: true,
    nextLaunch: '2025-05-05'
  },
  {
    id: 'jiuquan',
    name: 'Jiuquan Satellite Launch Center',
    country: 'China',
    coordinates: [40.9575, 100.2915],
    active: true,
    lastLaunch: '2025-03-20'
  },
  {
    id: 'satish',
    name: 'Satish Dhawan Space Centre',
    country: 'India',
    coordinates: [13.7330, 80.2048],
    active: true,
    nextLaunch: '2025-04-25'
  },
  {
    id: 'plesetsk',
    name: 'Plesetsk Cosmodrome',
    country: 'Russia',
    coordinates: [62.9271, 40.5777],
    active: false
  }
];
