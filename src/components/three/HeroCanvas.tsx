import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EnvironmentScene } from './EnvironmentScene';
import { GlassOrb } from './GlassOrb';
import { FloatingParticles } from './FloatingParticles';
import { CameraRig } from './CameraRig';
import { SceneLights } from './SceneLights';
import styles from './HeroCanvas.module.css';

/**
 * HeroCanvas
 * Renders the interactive 3D WebGL scene for the landing page hero.
 * Uses demand rendering (`frameloop="demand"`) where possible or limits DPR for performance.
 */
export const HeroCanvas: React.FC = React.memo(() => {
  return (
    <div className={styles.canvasContainer} aria-hidden="true">
      <Canvas
        dpr={[1, 2]} // Clamp max device pixel ratio for performance
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        // Interaction is mostly scroll/parallax driven, so pointer events are passive
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <SceneLights />
          <EnvironmentScene />
          
          {/* Main Objects */}
          <GlassOrb />
          <FloatingParticles count={150} />
          
          {/* Rig drives camera parallax based on mouse/scroll */}
          <CameraRig />
        </Suspense>
      </Canvas>
    </div>
  );
});

HeroCanvas.displayName = 'HeroCanvas';
