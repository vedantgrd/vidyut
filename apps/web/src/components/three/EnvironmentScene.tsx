import React from 'react';
import { Environment } from '@react-three/drei';

export const EnvironmentScene: React.FC = () => {
  return (
    // Provides image-based lighting and reflections for the glass materials
    <Environment preset="city" />
  );
};
