import type { Transition } from 'framer-motion';

export const SPRING_STIFFNESS = 300;
export const SPRING_DAMPING = 30;

export const springTransition: Transition = {
  type: 'spring',
  stiffness: SPRING_STIFFNESS,
  damping: SPRING_DAMPING,
};
