import React, { useState, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { Interface } from './components/Interface';
import { WORLDS, VEHICLES } from './constants';
import { GameState, World, Vehicle } from './types';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('playing');
  const [currentWorld, setCurrentWorld] = useState<World>(WORLDS[0]);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle>(VEHICLES[0]);
  const [restartTrigger, setRestartTrigger] = useState(0);

  // Refs for direct DOM manipulation from game loop (performance)
  const fuelRef = useRef<HTMLSpanElement>(null);
  const velRef = useRef<HTMLSpanElement>(null);
  const altRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  const handleRestart = useCallback(() => {
    setRestartTrigger(prev => prev + 1);
    setGameState('playing');
  }, []);

  return (
    <div className="w-full h-screen bg-gray-900 overflow-hidden relative select-none">
      <Interface
        gameState={gameState}
        currentWorld={currentWorld}
        currentVehicle={currentVehicle}
        fuelRef={fuelRef}
        velRef={velRef}
        altRef={altRef}
        scoreRef={scoreRef}
        timeRef={timeRef}
        onRestart={handleRestart}
        onSelectWorld={(w) => { setCurrentWorld(w); handleRestart(); }}
        onSelectVehicle={(v) => { setCurrentVehicle(v); handleRestart(); }}
      />
      
      <div className="absolute inset-0 z-0">
        <GameCanvas
          gameState={gameState}
          setGameState={setGameState}
          world={currentWorld}
          vehicle={currentVehicle}
          refs={{ fuel: fuelRef, vel: velRef, alt: altRef, score: scoreRef, time: timeRef }}
          restartTrigger={restartTrigger}
        />
      </div>
    </div>
  );
}
