import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const CameraRig: React.FC = () => {
  const vec = new THREE.Vector3();

  useFrame((state) => {
    // Smoothly lerp camera position based on mouse position
    // This creates a subtle parallax effect that makes the scene feel alive
    const targetX = (state.pointer.x * state.viewport.width) / 20;
    const targetY = (state.pointer.y * state.viewport.height) / 20;
    
    state.camera.position.lerp(vec.set(targetX, targetY, 8), 0.05);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
};
