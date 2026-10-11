import type { Variants } from 'framer-motion';
import { springGentle, springStandard } from './springs';

export const heroTextRevealVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: springGentle 
  },
};

export const heroCtaVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { ...springStandard, delay: 0.4 } 
  },
};
