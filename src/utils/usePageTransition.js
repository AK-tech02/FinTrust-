import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook for managing page transition state
 * @returns {Object} { isTransitioning, transitionStage }
 */
export const usePageTransition = () => {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionStage, setTransitionStage] = useState('idle');
    const location = useLocation();

    useEffect(() => {
        // Start transition
        setIsTransitioning(true);
        setTransitionStage('exiting');

        // Transition to entering
        const enterTimer = setTimeout(() => {
            setTransitionStage('entering');
        }, 300);

        // Complete transition
        const completeTimer = setTimeout(() => {
            setIsTransitioning(false);
            setTransitionStage('idle');
        }, 600);

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(completeTimer);
        };
    }, [location.pathname]);

    return { isTransitioning, transitionStage };
};

export default usePageTransition;
