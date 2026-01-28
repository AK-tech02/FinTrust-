import './GradientText.css';

/**
 * Animated gradient text component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Text content
 * @param {string} props.className - Additional CSS classes
 */
const GradientText = ({ children, className = '' }) => {
    return (
        <span className={`gradient-text ${className}`}>
            {children}
        </span>
    );
};

export default GradientText;
