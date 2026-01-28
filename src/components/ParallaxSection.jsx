import { useEffect, useRef, useState } from 'react';
import './ParallaxSection.css';

/**
 * Parallax scrolling section
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content
 * @param {number} props.speed - Parallax speed (0-1, lower = slower)
 * @param {string} props.className - Additional CSS classes
 */
const ParallaxSection = ({
    children,
    speed = 0.5,
    className = ''
}) => {
    const sectionRef = useRef(null);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;

            const rect = sectionRef.current.getBoundingClientRect();
            const scrolled = window.pageYOffset || document.documentElement.scrollTop;
            const rate = scrolled * speed;

            setOffset(rate);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return (
        <div ref={sectionRef} className={`parallax-section ${className}`}>
            <div
                className="parallax-content"
                style={{
                    transform: `translate3d(0, ${offset}px, 0)`
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default ParallaxSection;
