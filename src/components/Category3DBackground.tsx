import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';

function BookSpiral() {
  const groupRef = useRef<THREE.Group>(null);
  const books = useMemo(() => {
    const count = 45;
    return Array.from({ length: count }).map((_, i) => {
      const t = i / count;
      const angle = t * Math.PI * 10;
      const radius = 3 + t * 6;
      const y = (t - 0.5) * 25;
      return {
        id: i,
        position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
        rotation: [0, -angle, Math.random() * 0.5],
        color: '#1a1a1a',
        emissive: new THREE.Color().setHSL(t * 0.8 + 0.5, 0.8, 0.5).getHexString()
      };
    });
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {books.map(book => (
        <Float key={book.id} speed={2} rotationIntensity={1} floatIntensity={1}>
          <group position={book.position as any} rotation={book.rotation as any}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.5, 2.2, 0.25]} />
              <meshPhysicalMaterial color={book.color} metalness={0.9} roughness={0.1} clearcoat={1} />
            </mesh>
            <mesh position={[0.05, 0, 0]}>
              <boxGeometry args={[1.4, 2.1, 0.27]} />
              <meshStandardMaterial color="#ffffff" emissive={`#${book.emissive}`} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  );
}

export default function Category3DBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#020205]">
      <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
        <color attach="background" args={['#020205']} />
        <ambientLight intensity={0.2} />
        <Environment preset="night" />
        
        <BookSpiral />
        
        <Sparkles count={300} scale={25} size={2} speed={0.5} opacity={0.6} color="#aaaaff" />
        
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={2} />
          <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
