import type { Transition } from 'framer-motion';

/**
 * Global Spring Configuration
 * Used across the Aura Design System to maintain physical consistency.
 */
export const SPRING_CONFIG = {
  STIFFNESS_GENTLE: 200,
  DAMPING_GENTLE: 40,
  
  STIFFNESS_STANDARD: 300,
  DAMPING_STANDARD: 30,
  
  STIFFNESS_SNAPPY: 400,
  DAMPING_SNAPPY: 20,
};

export const springGentle: Transition = {
  type: 'spring',
  stiffness: SPRING_CONFIG.STIFFNESS_GENTLE,
  damping: SPRING_CONFIG.DAMPING_GENTLE,
};

export const springStandard: Transition = {
  type: 'spring',
  stiffness: SPRING_CONFIG.STIFFNESS_STANDARD,
  damping: SPRING_CONFIG.DAMPING_STANDARD,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: SPRING_CONFIG.STIFFNESS_SNAPPY,
  damping: SPRING_CONFIG.DAMPING_SNAPPY,
};
