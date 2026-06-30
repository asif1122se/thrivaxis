/**
 * Central motion presets — every animation in the app pulls from here.
 * Easing names mirror the Tailwind tokens in globals.css so CSS and JS stay aligned.
 */

export const duration = {
  instant: 0,
  fast: 0.15,
  normal: 0.28,
  slow: 0.48,
  slower: 0.72,
  cinema: 1.1,
} as const;

export const ease = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOutExpo: [0.87, 0, 0.13, 1] as const,
  outQuart: [0.25, 1, 0.5, 1] as const,
  inOutQuart: [0.76, 0, 0.24, 1] as const,
  springSoft: [0.34, 1.32, 0.64, 1] as const,
  springSnap: [0.5, 1.6, 0.5, 1] as const,
} as const;

export const stagger = {
  tight: 0.04,
  default: 0.07,
  loose: 0.12,
} as const;

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: duration.normal, ease: ease.outExpo },
};

export const riseIn = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.slow, ease: ease.outExpo },
};

export const riseInScroll = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -10% 0px' },
  transition: { duration: duration.slow, ease: ease.outExpo },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: duration.normal, ease: ease.outExpo },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -32 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: duration.slow, ease: ease.outExpo },
};

export const slideInRight = {
  initial: { opacity: 0, x: 32 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: duration.slow, ease: ease.outExpo },
};

export const blurFadeIn = {
  initial: { opacity: 0, filter: 'blur(12px)', y: 12 },
  animate: { opacity: 1, filter: 'blur(0px)', y: 0 },
  transition: { duration: duration.slow, ease: ease.outExpo },
};

export const staggerContainer = (gap: number = stagger.default) => ({
  initial: {},
  animate: {
    transition: { staggerChildren: gap, delayChildren: 0.05 },
  },
});

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.slow, ease: ease.outExpo },
};
