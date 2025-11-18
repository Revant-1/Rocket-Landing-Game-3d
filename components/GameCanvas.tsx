import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { GameState, World, Vehicle } from '../types';
import { LANDING_PAD_WIDTH } from '../constants';

// --- 3D ASSETS & COMPONENTS ---

const LandingPad = ({ x, width, color }: { x: number, width: number, color: string }) => {
  return (
    <group position={[x, 0.1, 0]}>
      {/* Main Pad */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Lights */}
      <pointLight position={[0, 1, 0]} distance={10} intensity={2} color={color} />
      
      {/* Vertical Beacons (Laser Guides) */}
      <group position={[-width/2 + 0.5, 50, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 100, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
      <group position={[width/2 - 0.5, 50, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 100, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>

      {/* Markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[width * 0.3, width * 0.35, 32]} />
        <meshBasicMaterial color="#ffffff" opacity={0.5} transparent />
      </mesh>
      <Text 
        position={[0, 0.02, 0]} 
        rotation={[-Math.PI/2, 0, 0]} 
        fontSize={1.5} 
        color="white" 
        anchorX="center" 
        anchorY="middle"
        fontWeight="bold"
      >
        H
      </Text>
    </group>
  );
};

const Terrain = ({ color }: { color: string }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[1000, 100]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.9} 
        metalness={0.1}
        dithering
      />
    </mesh>
  );
};

const RocketModel = React.forwardRef<THREE.Group, { vehicle: Vehicle, thrusting: boolean }>(({ vehicle, thrusting }, ref) => {
  return (
    <group ref={ref}>
      <group scale={vehicle.scale}>
        {/* Body */}
        <mesh castShadow receiveShadow position={[0, 1, 0]}>
          <cylinderGeometry args={[0.4, 0.5, 1.5, 16]} />
          <meshStandardMaterial color={vehicle.color} metalness={0.6} roughness={0.2} />
        </mesh>
        
        {/* Nose Cone */}
        <mesh castShadow position={[0, 2.0, 0]}>
          <coneGeometry args={[0.4, 0.5, 32]} />
          <meshStandardMaterial color={vehicle.accentColor} metalness={0.4} roughness={0.2} />
        </mesh>

        {/* Fins */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`fin-${i}`} castShadow position={[0, 0.4, 0]} rotation={[0, (Math.PI / 2) * i, 0]}>
            <boxGeometry args={[0.1, 0.6, 1.4]} />
            <meshStandardMaterial color={vehicle.accentColor} />
          </mesh>
        ))}

        {/* Landing Legs */}
        {[0, 1, 2, 3].map((i) => (
          <group key={`leg-${i}`} rotation={[0, (Math.PI / 2) * i + Math.PI/4, 0]}>
             <mesh position={[0.5, 0.3, 0]} rotation={[0, 0, 0.4]}>
                <boxGeometry args={[0.1, 1.0, 0.1]} />
                <meshStandardMaterial color="#2d3436" metalness={0.8} />
             </mesh>
             <mesh position={[0.8, -0.1, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
                <meshStandardMaterial color="#2d3436" metalness={0.8} />
             </mesh>
          </group>
        ))}

        {/* Engine Nozzle */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.2, 0.3, 0.4, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>

        {/* Thruster Particle Effect */}
        {thrusting && (
          <mesh position={[0, -0.5, 0]}>
             <coneGeometry args={[0.2, 1.5, 8]} />
             <meshBasicMaterial color="#ff9f43" transparent opacity={0.8} />
          </mesh>
        )}
        {thrusting && (
           <pointLight position={[0, -1, 0]} distance={5} intensity={5} color="#ff7675" />
        )}
      </group>
    </group>
  );
});

const GuidanceArrow = ({ rocketRef, padX }: { rocketRef: React.RefObject<THREE.Group>, padX: number }) => {
  const arrowRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (!rocketRef.current || !arrowRef.current) return;
    
    const rocketPos = rocketRef.current.position;
    const dist = padX - rocketPos.x;
    
    // Only show if reasonable distance away or if very high up
    const shouldShow = Math.abs(dist) > 2 || rocketPos.y > 20;
    
    arrowRef.current.visible = shouldShow;
    
    if (shouldShow) {
      // Position: Floating above the rocket
      arrowRef.current.position.set(rocketPos.x, rocketPos.y + 4, 0);
      
      // Rotation: Point left or right
      // Pointing right is -PI/2 on Z (assuming arrow points UP by default)
      const targetRotation = dist > 0 ? -Math.PI / 2 : Math.PI / 2;
      
      // If we are very close horizontally but high up, point down
      if (Math.abs(dist) < 2 && rocketPos.y > 10) {
          arrowRef.current.rotation.z = Math.PI;
      } else {
          arrowRef.current.rotation.z = targetRotation;
      }
      
      // Bobbing effect
      const bob = Math.sin(clock.getElapsedTime() * 5) * 0.2;
      arrowRef.current.position.y += bob;
      
      // Color pulse
      const scale = 1 + Math.sin(clock.getElapsedTime() * 10) * 0.1;
      arrowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={arrowRef}>
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.4, 0.8, 4]} />
        <meshStandardMaterial color="#f1c40f" emissive="#f39c12" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 8]} />
        <meshStandardMaterial color="#f1c40f" />
      </mesh>
    </group>
  );
};


// --- LOGIC & SCENE ---

interface GameSceneProps {
  gameState: GameState;
  setGameState: (s: GameState) => void;
  world: World;
  vehicle: Vehicle;
  refs: {
    fuel: React.RefObject<HTMLSpanElement>;
    vel: React.RefObject<HTMLSpanElement>;
    alt: React.RefObject<HTMLSpanElement>;
    score: React.RefObject<HTMLSpanElement>;
    time: React.RefObject<HTMLSpanElement>;
  };
  restartTrigger: number;
}

const GameScene: React.FC<GameSceneProps> = ({ gameState, setGameState, world, vehicle, refs, restartTrigger }) => {
  const rocketRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  // Physics state refs (mutable for performance)
  const physics = useRef({
    pos: new THREE.Vector3(0, 30, 0),
    vel: new THREE.Vector3(0, 0, 0),
    rot: 0,
    fuel: vehicle.fuelCapacity,
    thrusting: false,
    startTime: 0
  });

  // Input state
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    
    // Mobile controls bindings
    const bindMobileBtn = (id: string, code: string) => {
      const el = document.getElementById(id);
      if (el) {
        const start = (e: Event) => { e.preventDefault(); keys.current[code] = true; };
        const end = (e: Event) => { e.preventDefault(); keys.current[code] = false; };
        el.addEventListener('touchstart', start, { passive: false });
        el.addEventListener('touchend', end);
        el.addEventListener('mousedown', start);
        el.addEventListener('mouseup', end);
        el.addEventListener('mouseleave', end);
      }
    };
    
    bindMobileBtn('mobile-left', 'ArrowLeft');
    bindMobileBtn('mobile-right', 'ArrowRight');
    bindMobileBtn('mobile-thrust', 'Space');

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Reset logic
  useEffect(() => {
    physics.current = {
      pos: new THREE.Vector3(0, 40, 0),
      vel: new THREE.Vector3((Math.random() - 0.5) * 10, 0, 0), // Random initial drift
      rot: (Math.random() - 0.5) * 0.5, // Random initial tilt
      fuel: vehicle.fuelCapacity,
      thrusting: false,
      startTime: Date.now()
    };
    setGameState('playing');
    if (rocketRef.current) {
        rocketRef.current.rotation.z = physics.current.rot;
        rocketRef.current.position.copy(physics.current.pos);
    }
  }, [world, vehicle, restartTrigger, setGameState]);

  // Pad position is randomized based on world ID for pseudo-consistency or just random per session
  // For now, let's fix it or randomize it.
  const padX = useMemo(() => (Math.random() * 60) - 30, [restartTrigger]); 

  const [isThrusting, setIsThrusting] = useState(false);

  useFrame((state, delta) => {
    if (gameState !== 'playing') return;

    const { pos, vel, rot, fuel } = physics.current;
    const k = keys.current;
    
    // Time
    const elapsed = (Date.now() - physics.current.startTime) / 1000;
    if (refs.time.current) refs.time.current.innerText = elapsed.toFixed(1);

    // Input Handling
    const thrustInput = k['ArrowUp'] || k['KeyW'] || k['Space'];
    const leftInput = k['ArrowLeft'] || k['KeyA'];
    const rightInput = k['ArrowRight'] || k['KeyD'];

    // Rotation
    if (leftInput) physics.current.rot += 2.5 * delta;
    if (rightInput) physics.current.rot -= 2.5 * delta;

    // Thrust
    let thrust = 0;
    if (thrustInput && fuel > 0) {
      thrust = vehicle.thrustPower;
      physics.current.fuel -= vehicle.fuelConsumption;
      setIsThrusting(true);
    } else {
      setIsThrusting(false);
    }

    // Physics Integration (Euler)
    // Gravity
    vel.y -= world.gravity * delta;
    
    // Thrust forces
    vel.x += -Math.sin(rot) * thrust * delta;
    vel.y += Math.cos(rot) * thrust * delta;

    // Apply Velocity
    pos.add(vel.clone().multiplyScalar(delta));

    // Update Visuals
    if (rocketRef.current) {
      rocketRef.current.position.copy(pos);
      rocketRef.current.rotation.z = rot;
      rocketRef.current.rotation.y = Math.sin(elapsed) * 0.1; // Slight idle spin
    }

    // Camera Follow (Smooth damp)
    if (cameraRef.current) {
       const targetX = pos.x;
       const targetY = Math.max(pos.y, 10) + 5;
       const targetZ = 30 + Math.max(0, pos.y * 0.8); // Zoom out as we go higher
       
       cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 2 * delta;
       cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 2 * delta;
       cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 2 * delta;
       cameraRef.current.lookAt(pos.x, pos.y, 0);
    }

    // Update UI
    if (refs.fuel.current) refs.fuel.current.innerText = Math.max(0, physics.current.fuel).toFixed(0);
    if (refs.vel.current) refs.vel.current.innerText = Math.sqrt(vel.x**2 + vel.y**2).toFixed(1);
    if (refs.alt.current) refs.alt.current.innerText = Math.max(0, pos.y).toFixed(0);
    if (refs.score.current) refs.score.current.innerText = Math.floor(elapsed * 10).toString(); // temp score

    // Collision Detection
    if (pos.y <= 0) {
        // Check Landing
        const hitPad = Math.abs(pos.x - padX) < (LANDING_PAD_WIDTH / 2 + 1);
        const safeSpeed = Math.abs(vel.y) < 4 && Math.abs(vel.x) < 2;
        const upright = Math.abs(rot % (Math.PI * 2)) < 0.3;

        if (hitPad && safeSpeed && upright) {
            setGameState('landed');
            if (refs.score.current) {
               const fuelBonus = physics.current.fuel * 10;
               const speedBonus = (5 - Math.abs(vel.y)) * 100;
               const finalScore = Math.floor(1000 + fuelBonus + speedBonus);
               refs.score.current.innerText = finalScore.toString();
            }
        } else {
            setGameState('crashed');
        }
        // Stick to ground
        pos.y = 0;
        setIsThrusting(false);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} position={[0, 20, 40]} fov={45} />
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[50, 100, 20]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* World Environment */}
      <color attach="background" args={[world.skyColor]} />
      <fog attach="fog" args={[world.atmosphereColor, 10, 150]} />
      
      <group>
         <LandingPad x={padX} width={LANDING_PAD_WIDTH} color={world.padColor} />
         <Terrain color={world.groundColor} />
         
         <RocketModel 
            ref={rocketRef} 
            vehicle={vehicle} 
            thrusting={isThrusting} 
         />
         
         <GuidanceArrow rocketRef={rocketRef} padX={padX} />
      </group>
    </>
  );
};

export const GameCanvas = (props: GameSceneProps) => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <GameScene {...props} />
    </Canvas>
  );
};