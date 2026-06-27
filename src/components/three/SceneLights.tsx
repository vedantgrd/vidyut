import React from 'react';

export const SceneLights: React.FC = () => {
  return (
    <>
      {/* Ambient lighting to establish base visibility */}
      <ambientLight intensity={0.4} />
      
      {/* Main directional light for specular highlights on the glass */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        color="#ffffff" 
      />
      
      {/* Colored point lights to inject the "Aura" theme colors into the scene */}
      <pointLight position={[-10, -10, -10]} intensity={1} color="#6366f1" />
      <pointLight position={[10, -10, 10]} intensity={0.5} color="#c084fc" />
    </>
  );
};
