import { useState, useEffect } from 'react';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const [theme, setTheme] = useState('day');

    useEffect(() => {
        // Check for saved theme preference or default to 'day'
        const savedTheme = localStorage.getItem('theme') || 'day';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'day' ? 'night' : 'day';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <div className="theme-toggle">
            <button
                className="theme-toggle-button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'day' ? 'night' : 'day'} mode`}
                title={`Switch to ${theme === 'day' ? 'night' : 'day'} mode`}
            >
                <span className="theme-icon" key={theme}>
                    {theme === 'day' ? '🌙' : '☀️'}
                </span>
            </button>
        </div>
    );
};

export default ThemeToggle;
