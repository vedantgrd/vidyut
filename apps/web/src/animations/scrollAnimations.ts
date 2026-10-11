import type { Variants } from 'framer-motion';
import { springStandard } from './springs';

/**
 * Reusable whileInView scroll animations
 */
export const scrollFadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: springStandard
  },
};

export const scrollScaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: springStandard
  },
};
