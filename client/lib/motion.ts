'use client';

import { useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';

/**
 * Shared animation variants. Import these instead of redefining
 * fade/stagger variants per page.
 */

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Returns static (no-animation) variants when the user prefers reduced
 * motion. Usage:
 *
 *   const container = useAccessibleVariants(staggerContainer);
 *   <motion.div variants={container} ... />
 */
export function useAccessibleVariants(variants: Variants): Variants {
  const prefersReducedMotion = useReducedMotion();
  if (!prefersReducedMotion) return variants;

  return Object.keys(variants).reduce<Variants>((acc, key) => {
    acc[key] = { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } };
    return acc;
  }, {});
}
