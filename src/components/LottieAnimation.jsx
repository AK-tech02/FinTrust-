import Lottie from 'lottie-react';
import './LottieAnimation.css';

/**
 * Lottie animation wrapper component
 * @param {Object} props
 * @param {Object} props.animationData - Lottie JSON data
 * @param {boolean} props.loop - Loop animation
 * @param {boolean} props.autoplay - Auto play on mount
 * @param {number} props.width - Width in pixels
 * @param {number} props.height - Height in pixels
 * @param {string} props.className - Additional CSS classes
 */
const LottieAnimation = ({
    animationData,
    loop = true,
    autoplay = true,
    width = 200,
    height = 200,
    className = ''
}) => {
    return (
        <div
            className={`lottie-animation ${className}`}
            style={{ width: `${width}px`, height: `${height}px` }}
        >
            <Lottie
                animationData={animationData}
                loop={loop}
                autoplay={autoplay}
            />
        </div>
    );
};

export default LottieAnimation;
