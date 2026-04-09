import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Text, ContactShadows, Float, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

function Page({ index, total }: { index: number, total: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Smooth, magical page turning animation
    const speed = 0.8;
    const offset = index * 0.2;
    const time = state.clock.elapsedTime * speed - offset;
    
    // Use sine wave to make pages flip back and forth smoothly
    let rawFlip = Math.sin(time);
    // Clamp to create a pause when the page is fully turned left or right
    let flip = THREE.MathUtils.clamp(rawFlip * 1.5, -1, 1); 
    // Map from [-1, 1] to [0, -PI]
    let angle = (flip + 1) / 2 * -Math.PI; 
    
    groupRef.current.rotation.z = angle;
    
    // Add a realistic bend to the page while it's turning
    const bend = Math.sin(angle) * 0.3;
    groupRef.current.rotation.y = bend;
    groupRef.current.rotation.x = bend * 0.1;
  });

  return (
    <group ref={groupRef} position={[0, 0.1 + index * 0.005, 0]}>
      <mesh position={[1.5, 0, 0]}>
        <boxGeometry args={[3, 0.005, 4]} />
        <meshStandardMaterial color="#fdf6e3" roughness={0.8} />
      </mesh>
      {/* Front Text */}
      <Text 
        position={[1.5, 0.006, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.25}
        color="#4a3b32"
        font="https://fonts.gstatic.com/s/playfairdisplay/v21/nuFiD-vYSZviVYUb_rj3ij__anPX3TzOA-O6Nq2I.woff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
        textAlign="center"
      >
        Book Candel BD
      </Text>
      {/* Back Text */}
      <Text 
        position={[1.5, -0.006, 0]} 
        rotation={[Math.PI / 2, 0, Math.PI]}
        fontSize={0.25}
        color="#4a3b32"
        font="https://fonts.gstatic.com/s/playfairdisplay/v21/nuFiD-vYSZviVYUb_rj3ij__anPX3TzOA-O6Nq2I.woff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
        textAlign="center"
      >
        Book Candel BD
      </Text>
    </group>
  );
}

function RealisticBook() {
  return (
    <group position={[0, -0.5, 0]} rotation={[0.1, -0.5, 0]}>
      {/* Left static pages stack */}
      <mesh position={[-1.5, 0.05, 0]}>
        <boxGeometry args={[3, 0.1, 4]} />
        <meshStandardMaterial color="#fdf6e3" roughness={0.9} />
        <Text 
          position={[0, 0.051, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.25}
          color="#4a3b32"
          font="https://fonts.gstatic.com/s/playfairdisplay/v21/nuFiD-vYSZviVYUb_rj3ij__anPX3TzOA-O6Nq2I.woff"
        >
          Book Candel BD
        </Text>
      </mesh>
      
      {/* Right static pages stack */}
      <mesh position={[1.5, 0.05, 0]}>
        <boxGeometry args={[3, 0.1, 4]} />
        <meshStandardMaterial color="#fdf6e3" roughness={0.9} />
        <Text 
          position={[0, 0.051, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.25}
          color="#4a3b32"
          font="https://fonts.gstatic.com/s/playfairdisplay/v21/nuFiD-vYSZviVYUb_rj3ij__anPX3TzOA-O6Nq2I.woff"
        >
          Book Candel BD
        </Text>
      </mesh>
      
      {/* Book Cover (Leather/Dark) */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[6.2, 0.05, 4.2]} />
        <meshPhysicalMaterial color="#1a0f0a" roughness={0.4} metalness={0.2} clearcoat={0.5} />
      </mesh>

      {/* Turning Pages */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Page key={i} index={i} total={12} />
      ))}
    </group>
  );
}

export default function Home3DBackground() {
  return (
    <div className="absolute inset-0 z-0 bg-[#020202]">
      <Canvas camera={{ position: [0, 4, 8], fov: 45 }}>
        <color attach="background" args={['#020202']} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.1} />
        <spotLight position={[5, 10, 5]} intensity={2.5} penumbra={1} angle={0.6} castShadow color="#ffedd5" />
        <spotLight position={[-5, 5, -5]} intensity={1.5} penumbra={1} angle={0.6} color="#bae6fd" />
        <pointLight position={[0, 2, 0]} intensity={1} color="#f59e0b" distance={10} />
        
        <Environment preset="studio" />
        
        <Float speed={2} rotationIntensity={0.05} floatIntensity={0.1}>
          <RealisticBook />
        </Float>

        {/* Ultra-Realistic Polished Table Surface */}
        <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshPhysicalMaterial 
            color="#0a0a0a" 
            roughness={0.1} 
            metalness={0.8} 
            clearcoat={1} 
            clearcoatRoughness={0.1} 
          />
        </mesh>
        
        {/* Realistic Shadows on the table */}
        <ContactShadows position={[0, -1.49, 0]} opacity={0.8} scale={15} blur={2.5} far={4} color="#000000" />

        {/* Subtle Magical Dust */}
        <Sparkles count={200} scale={12} size={2} speed={0.2} opacity={0.3} color="#fcd34d" />

        {/* Cinematic Post-Processing */}
        <EffectComposer disableNormalPass>
          <DepthOfField focusDistance={0.015} focalLength={0.04} bokehScale={4} height={480} />
          <Bloom luminanceThreshold={0.4} mipmapBlur intensity={1.5} />
          <Vignette eskil={false} offset={0.1} darkness={1.2} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
