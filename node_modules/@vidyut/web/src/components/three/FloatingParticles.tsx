import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { InstancedMesh } from 'three';
import * as THREE from 'three';

interface FloatingParticlesProps {
  count?: number;
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({ count = 100 }) => {
  const meshRef = useRef<InstancedMesh>(null);
  
  // Memoize positions and random phases for performance
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      const factor = Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xAmp = Math.random();
      const yAmp = Math.random();
      const zAmp = Math.random();
      temp.push({ x, y, z, factor, speed, xAmp, yAmp, zAmp });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Update instances
    particles.forEach((particle, i) => {
      let { x, y, z, factor, speed, xAmp, yAmp, zAmp } = particle;
      
      const t = factor + state.clock.elapsedTime * (speed * 0.5);
      
      // Calculate floating positions using trig functions for smooth organic movement
      dummy.position.set(
        x + Math.cos(t) * xAmp,
        y + Math.sin(t) * yAmp,
        z + Math.cos(t) * zAmp
      );
      
      // Optionally rotate the particles
      dummy.rotation.set(
        Math.sin(t) * Math.PI,
        Math.cos(t) * Math.PI,
        0
      );
      
      // Update dummy matrix and apply to instanced mesh
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    // Flag mesh for update
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[0.05, 0]} />
      <meshStandardMaterial 
        color="#818cf8" 
        emissive="#6366f1"
        emissiveIntensity={0.5}
        transparent
        opacity={0.6}
      />
    </instancedMesh>
  );
};
