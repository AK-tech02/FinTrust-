import { useInView } from 'react-intersection-observer';

/**
 * Custom hook for scroll-triggered animations
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Percentage of element visibility to trigger (0-1)
 * @param {boolean} options.triggerOnce - Only trigger animation once
 * @param {string} options.rootMargin - Margin around root
 * @returns {Object} { ref, inView, entry }
 */
export const useScrollAnimation = ({
    threshold = 0.1,
    triggerOnce = true,
    rootMargin = '0px 0px -100px 0px'
} = {}) => {
    const { ref, inView, entry } = useInView({
        threshold,
        triggerOnce,
        rootMargin
    });

    return { ref, inView, entry };
};

export default useScrollAnimation;
