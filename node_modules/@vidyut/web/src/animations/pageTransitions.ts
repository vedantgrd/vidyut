import type { Variants } from 'framer-motion';
import { springTransition } from '@/constants/motion';

export const pageFadeUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, y: -20, transition: springTransition },
};

export const pageFadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: springTransition },
  exit: { opacity: 0, transition: springTransition },
};

export const slideInRightVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: springTransition },
  exit: { opacity: 0, x: -20, transition: springTransition },
};
