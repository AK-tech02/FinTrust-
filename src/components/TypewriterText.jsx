import { useState, useEffect } from 'react';
import './TypewriterText.css';

/**
 * Typewriter text animation component
 * @param {Object} props
 * @param {string} props.text - Text to animate
 * @param {number} props.speed - Typing speed in ms
 * @param {boolean} props.showCursor - Show blinking cursor
 * @param {number} props.delay - Delay before starting
 */
const TypewriterText = ({
    text,
    speed = 50,
    showCursor = true,
    delay = 0
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
        const startTimer = setTimeout(() => {
            setIsStarted(true);
        }, delay);

        return () => clearTimeout(startTimer);
    }, [delay]);

    useEffect(() => {
        if (!isStarted) return;

        if (currentIndex < text.length) {
            const timer = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearTimeout(timer);
        }
    }, [currentIndex, text, speed, isStarted]);

    return (
        <span className="typewriter-text">
            {displayedText}
            {showCursor && <span className="typewriter-cursor">|</span>}
        </span>
    );
};

export default TypewriterText;
