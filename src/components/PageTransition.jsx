import { motion } from 'framer-motion';
import { pageTransition } from '../utils/AnimationUtils';
import './PageTransition.css';

/**
 * Page transition wrapper with blur and slide effects
 * Wrap route components with this for smooth transitions
 */
const PageTransition = ({ children }) => {
    return (
        <motion.div
            className="page-transition"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
