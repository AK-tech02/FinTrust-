import './SkeletonLoader.css';

/**
 * Skeleton loader component with shimmer effect
 * @param {Object} props
 * @param {string} props.variant - 'text' | 'card' | 'circle' | 'rect'
 * @param {number} props.width - Width in pixels or percentage
 * @param {number} props.height - Height in pixels
 * @param {number} props.count - Number of skeleton elements
 * @param {string} props.className - Additional CSS classes
 */
const SkeletonLoader = ({
    variant = 'text',
    width,
    height,
    count = 1,
    className = ''
}) => {
    const skeletonElements = Array.from({ length: count }, (_, i) => i);

    const getSkeletonStyle = () => {
        const style = {};
        if (width) style.width = typeof width === 'number' ? `${width}px` : width;
        if (height) style.height = `${height}px`;
        return style;
    };

    return (
        <div className={`skeleton-container ${className}`}>
            {skeletonElements.map((_, index) => (
                <div
                    key={index}
                    className={`skeleton skeleton-${variant}`}
                    style={getSkeletonStyle()}
                >
                    <div className="skeleton-shimmer"></div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonLoader;
