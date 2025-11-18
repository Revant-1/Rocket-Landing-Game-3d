export type GameState = 'menu' | 'playing' | 'landed' | 'crashed';

export interface World {
  id: string;
  name: string;
  gravity: number;
  groundColor: string;
  skyColor: string;
  atmosphereColor: string;
  padColor: string;
  description: string;
}

export interface Vehicle {
  id: string;
  name: string;
  thrustPower: number;
  fuelCapacity: number;
  fuelConsumption: number;
  color: string;
  accentColor: string;
  description: string;
  scale: [number, number, number];
  height: number; // Physical height for collision
}

export interface GameStats {
  velocity: number;
  fuel: number;
  altitude: number;
  score: number;
  time: number;
}
