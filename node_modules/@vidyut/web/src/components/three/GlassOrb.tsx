import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import type { Mesh } from 'three';

export const GlassOrb: React.FC = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation for the orb
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={1.5}>
        <sphereGeometry args={[1, 64, 64]} />
        {/* Abstract AI Spark material */}
        <MeshDistortMaterial
          color="#1e1b4b"
          emissive="#4338ca"
          emissiveIntensity={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          roughness={0.2}
          metalness={0.8}
          distort={0.4}
          speed={2}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
};
