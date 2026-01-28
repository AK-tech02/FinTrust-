// Animation variants for Framer Motion
export const fadeInUp = {
    hidden: {
        opacity: 0,
        y: 30
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

export const fadeInDown = {
    hidden: {
        opacity: 0,
        y: -30
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.6 }
    }
};

export const slideInLeft = {
    hidden: {
        opacity: 0,
        x: -30
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

export const slideInRight = {
    hidden: {
        opacity: 0,
        x: 30
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

export const scaleIn = {
    hidden: {
        opacity: 0,
        scale: 0.8
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

// Page transition variants
export const pageTransition = {
    initial: {
        opacity: 0,
        x: -20,
        filter: 'blur(10px)'
    },
    animate: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
        }
    },
    exit: {
        opacity: 0,
        x: 20,
        filter: 'blur(10px)',
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

// Stagger container for children animations
export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

// Stagger item
export const staggerItem = {
    hidden: {
        opacity: 0,
        y: 20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

// Hover effects
export const hoverLift = {
    rest: {
        scale: 1,
        y: 0
    },
    hover: {
        scale: 1.03,
        y: -4,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

export const hoverGlow = {
    rest: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    hover: {
        boxShadow: '0 0 20px rgba(0, 217, 255, 0.4), 0 0 40px rgba(0, 217, 255, 0.2), 0 8px 24px rgba(0, 0, 0, 0.15)',
        transition: {
            duration: 0.3
        }
    }
};

// Card animation with combined effects
export const cardAnimation = {
    rest: {
        scale: 1,
        y: 0,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    hover: {
        scale: 1.03,
        y: -6,
        boxShadow: '0 0 20px rgba(0, 217, 255, 0.4), 0 0 40px rgba(0, 217, 255, 0.2), 0 12px 30px rgba(0, 0, 0, 0.2)',
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

// Button press animation
export const buttonPress = {
    rest: { scale: 1 },
    tap: {
        scale: 0.97,
        transition: {
            duration: 0.1
        }
    }
};

// Timing configurations
export const timing = {
    fast: 0.2,
    normal: 0.4,
    slow: 0.6,
    verySlow: 1.0
};

// Easing functions
export const easing = {
    easeOut: [0.4, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
    easeInOut: [0.4, 0, 0.6, 1],
    spring: { type: 'spring', damping: 20, stiffness: 300 }
};
