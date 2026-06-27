import React from 'react';
import { HeroSection } from '@/components/sections/HeroSection';
import { TrustedBySection } from '@/components/sections/TrustedBySection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { AIShowcaseSection } from '@/components/sections/AIShowcaseSection';
import { FeaturedScholarshipsSection } from '@/components/sections/FeaturedScholarshipsSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { CTASection } from '@/components/sections/CTASection';
import { FooterSection } from '@/components/sections/FooterSection';
import { HeroCanvas } from '@/components/three/HeroCanvas';
import styles from './LandingPage.module.css';

const LandingPage: React.FC = () => {
  return (
    <div className={styles.landingPage}>
      {/* 
        HeroCanvas runs full viewport height behind the HeroSection. 
        It is rendered outside the sections flow to act as a background.
      */}
      <HeroCanvas />

      {/* Foreground scrollable content */}
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <AIShowcaseSection />
      <FeaturedScholarshipsSection />
      <TestimonialsSection />
      <CTASection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
