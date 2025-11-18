import { World, Vehicle } from './types';

export const WORLDS: World[] = [
  { 
    id: 'earth', 
    name: 'Earth', 
    gravity: 9.8, 
    groundColor: '#2d3436', 
    skyColor: '#0984e3',
    atmosphereColor: '#74b9ff',
    padColor: '#e17055', 
    description: 'Standard gravity. A good starting point.' 
  },
  { 
    id: 'moon', 
    name: 'Moon', 
    gravity: 1.6, 
    groundColor: '#636e72', 
    skyColor: '#000000',
    atmosphereColor: '#000000',
    padColor: '#fdcb6e', 
    description: 'Low gravity. Watch your inertia.' 
  },
  { 
    id: 'mars', 
    name: 'Mars', 
    gravity: 3.7, 
    groundColor: '#8d3224', 
    skyColor: '#d35400',
    atmosphereColor: '#e17055',
    padColor: '#ffeaa7', 
    description: 'Medium gravity with a dusty atmosphere.' 
  },
  { 
    id: 'titan', 
    name: 'Titan', 
    gravity: 1.35, 
    groundColor: '#5e5224', 
    skyColor: '#f1c40f',
    atmosphereColor: '#f39c12',
    padColor: '#fab1a0', 
    description: 'Thick atmosphere, low gravity.' 
  }
];

export const VEHICLES: Vehicle[] = [
  {
    id: 'rocket',
    name: 'Starhopper',
    thrustPower: 18,
    fuelCapacity: 100,
    fuelConsumption: 0.3,
    color: '#dfe6e9',
    accentColor: '#d63031',
    description: 'Balanced and reliable.',
    scale: [1, 1, 1],
    height: 2
  },
  {
    id: 'heavy',
    name: 'Heavy Lifter',
    thrustPower: 25,
    fuelCapacity: 150,
    fuelConsumption: 0.5,
    color: '#2d3436',
    accentColor: '#fdcb6e',
    description: 'Powerful but thirsty.',
    scale: [1.2, 1.2, 1.2],
    height: 2.4
  },
  {
    id: 'lander',
    name: 'Lunar Module',
    thrustPower: 12,
    fuelCapacity: 80,
    fuelConsumption: 0.2,
    color: '#f1c40f',
    accentColor: '#2d3436',
    description: 'Agile and efficient.',
    scale: [1.1, 0.8, 1.1],
    height: 1.6
  }
];

export const LANDING_PAD_WIDTH = 8;
export const GAME_SPEED_MULTIPLIER = 0.016; // Approx 60fps delta
