import { motion } from 'framer-motion';
import { fadeInUp, cardAnimation } from '../utils/AnimationUtils';
import { useScrollAnimation } from '../utils/useScrollAnimation';
import './AnimatedCard.css';

/**
 * Animated card with scroll triggers and hover effects
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {number} props.delay - Animation delay for staggering
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 */
const AnimatedCard = ({
    children,
    delay = 0,
    className = '',
    onClick
}) => {
    const { ref, inView } = useScrollAnimation({ threshold: 0.1 });

    return (
        <motion.div
            ref={ref}
            className={`animated-card ${className}`}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ delay }}
            whileHover="hover"
            whileTap="tap"
            onClick={onClick}
        >
            <motion.div
                className="animated-card-inner"
                variants={cardAnimation}
                initial="rest"
                whileHover="hover"
            >
                {children}
            </motion.div>
        </motion.div>
    );
};

export default AnimatedCard;
