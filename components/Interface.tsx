import React from 'react';
import { GameState, World, Vehicle } from '../types';
import { WORLDS, VEHICLES } from '../constants';
import { RefreshCw, Share2, Trophy, AlertTriangle, Wind, Gauge, Droplet, Settings } from 'lucide-react';

interface InterfaceProps {
  gameState: GameState;
  currentWorld: World;
  currentVehicle: Vehicle;
  fuelRef: React.RefObject<HTMLSpanElement>;
  velRef: React.RefObject<HTMLSpanElement>;
  altRef: React.RefObject<HTMLSpanElement>;
  scoreRef: React.RefObject<HTMLSpanElement>;
  timeRef: React.RefObject<HTMLSpanElement>;
  onRestart: () => void;
  onSelectWorld: (w: World) => void;
  onSelectVehicle: (v: Vehicle) => void;
}

export const Interface: React.FC<InterfaceProps> = ({
  gameState,
  currentWorld,
  currentVehicle,
  fuelRef,
  velRef,
  altRef,
  scoreRef,
  timeRef,
  onRestart,
  onSelectWorld,
  onSelectVehicle
}) => {
  
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-10 font-sans">
      {/* Top HUD */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2 bg-black/40 backdrop-blur-md p-4 rounded-lg border border-white/10 text-white shadow-lg">
          <div className="flex items-center gap-3 text-emerald-400 font-mono text-lg">
             <Droplet size={20} />
             <span ref={fuelRef}>100</span>%
          </div>
          <div className="flex items-center gap-3 text-cyan-400 font-mono text-lg">
             <Gauge size={20} />
             <span ref={velRef}>0.0</span> m/s
          </div>
          <div className="flex items-center gap-3 text-amber-400 font-mono text-lg">
             <Wind size={20} />
             <span ref={altRef}>500</span> m
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-white">
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
            <span className="text-white/60 text-sm uppercase tracking-wider">Time</span>
            <span ref={timeRef} className="font-mono text-xl font-bold">0.0</span>s
          </div>
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
            <span className="text-white/60 text-sm uppercase tracking-wider">Score</span>
            <span ref={scoreRef} className="font-mono text-xl font-bold text-purple-400">0</span>
          </div>
        </div>
      </div>

      {/* Game Over Screens */}
      {(gameState === 'landed' || gameState === 'crashed') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-sm transition-all duration-500">
          <div className="bg-gray-900 p-8 rounded-2xl border border-white/10 shadow-2xl max-w-md w-full text-center transform animate-in fade-in zoom-in duration-300">
            {gameState === 'landed' ? (
              <div className="flex justify-center mb-4">
                <div className="bg-green-500/20 p-4 rounded-full ring-2 ring-green-500">
                  <Trophy size={48} className="text-green-500" />
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="bg-red-500/20 p-4 rounded-full ring-2 ring-red-500">
                  <AlertTriangle size={48} className="text-red-500" />
                </div>
              </div>
            )}
            
            <h2 className={`text-3xl font-bold mb-2 ${gameState === 'landed' ? 'text-green-400' : 'text-red-500'}`}>
              {gameState === 'landed' ? 'SUCCESSFUL LANDING' : 'MISSION FAILED'}
            </h2>
            
            <p className="text-gray-400 mb-6">
              {gameState === 'landed' 
                ? "Touchdown confirmed. Systems operational." 
                : "Velocity exceeded safety limits. Vehicle destroyed."}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-gray-500 mb-1">Landing Speed</div>
                <div className="text-white font-mono text-lg" ref={(el) => { if(el && velRef.current) el.innerText = velRef.current.innerText }}>-</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-gray-500 mb-1">Fuel Left</div>
                <div className="text-white font-mono text-lg" ref={(el) => { if(el && fuelRef.current) el.innerText = fuelRef.current.innerText }}>-</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onRestart}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} /> Play Again
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Menu / Configuration (Always visible on left when playing, but collapsible on mobile if needed) */}
      <div className="pointer-events-auto self-start mt-auto hidden md:block bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden w-64 transition-all">
        <div className="p-4 border-b border-white/10 flex items-center gap-2 text-white font-semibold">
          <Settings size={16} /> Mission Config
        </div>
        
        <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select World</h3>
            <div className="space-y-2">
              {WORLDS.map(w => (
                <button
                  key={w.id}
                  onClick={() => onSelectWorld(w)}
                  className={`w-full text-left p-2 rounded-md text-sm transition-all flex items-center justify-between group ${
                    currentWorld.id === w.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span>{w.name}</span>
                  {currentWorld.id === w.id && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select Vehicle</h3>
            <div className="space-y-2">
              {VEHICLES.map(v => (
                <button
                  key={v.id}
                  onClick={() => onSelectVehicle(v)}
                  className={`w-full text-left p-2 rounded-md text-sm transition-all ${
                    currentVehicle.id === v.id 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{v.name}</span>
                  </div>
                  <div className="text-[10px] opacity-70 flex gap-2">
                    <span>T: {v.thrustPower}</span>
                    <span>F: {v.fuelCapacity}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Controls Hint */}
      <div className="md:hidden pointer-events-auto absolute bottom-6 left-6 right-6 flex justify-center gap-8">
        <div className="bg-white/10 backdrop-blur p-6 rounded-full active:bg-white/30 transition" id="mobile-left">←</div>
        <div className="bg-red-500/80 backdrop-blur p-6 rounded-full active:bg-red-500 transition shadow-lg shadow-red-900/50 border-2 border-red-400" id="mobile-thrust">🔥</div>
        <div className="bg-white/10 backdrop-blur p-6 rounded-full active:bg-white/30 transition" id="mobile-right">→</div>
      </div>

      <div className="absolute bottom-4 right-4 text-white/30 text-xs font-mono hidden md:block">
        Controls: [W/Up/Space] Thrust • [A/D/Left/Right] Rotate
      </div>
    </div>
  );
};
