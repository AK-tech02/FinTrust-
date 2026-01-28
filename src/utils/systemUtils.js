// System Utility Functions

/**
 * Enhanced format currency function
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @param {string} locale - Locale for formatting (default: en-IN)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
    try {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return currency === 'INR' ? '₹0' : '0';
        }

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (error) {
        console.error('Currency formatting error:', error);
        return `${currency} ${amount}`;
    }
};

/**
 * Enhanced format date function
 * @param {string|Date} dateString - Date to format
 * @param {string} format - Format type (short, long, relative, full)
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, format = 'short', locale = 'en-US') => {
    try {
        if (!dateString) return '';

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        switch (format) {
            case 'short':
                return new Intl.DateTimeFormat(locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }).format(date);

            case 'long':
                return new Intl.DateTimeFormat(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                }).format(date);

            case 'relative':
                return getRelativeTime(date);

            case 'full':
                return new Intl.DateTimeFormat(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }).format(date);

            case 'time':
                return new Intl.DateTimeFormat(locale, {
                    hour: '2-digit',
                    minute: '2-digit'
                }).format(date);

            default:
                return date.toLocaleDateString(locale);
        }
    } catch (error) {
        console.error('Date formatting error:', error);
        return String(dateString);
    }
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 * @param {Date} date - Date to compare
 * @returns {string} Relative time string
 */
const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = date - now;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (Math.abs(diffSec) < 60) {
        return diffSec >= 0 ? 'in a few seconds' : 'a few seconds ago';
    } else if (Math.abs(diffMin) < 60) {
        const mins = Math.abs(diffMin);
        return diffMin >= 0 ? `in ${mins} minute${mins !== 1 ? 's' : ''}` : `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    } else if (Math.abs(diffHour) < 24) {
        const hours = Math.abs(diffHour);
        return diffHour >= 0 ? `in ${hours} hour${hours !== 1 ? 's' : ''}` : `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (Math.abs(diffDay) < 30) {
        const days = Math.abs(diffDay);
        return diffDay >= 0 ? `in ${days} day${days !== 1 ? 's' : ''}` : `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
        return formatDate(date, 'short');
    }
};

/**
 * Global error handler
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @param {boolean} showToUser - Whether to show error to user
 * @returns {Object} Processed error object
 */
export const handleError = (error, context = 'Application', showToUser = true) => {
    // Create error object
    const errorObj = {
        message: error.message || 'An unknown error occurred',
        context,
        timestamp: new Date().toISOString(),
        stack: error.stack,
        type: error.name || 'Error'
    };

    // Log to console
    console.error(`❌ Error in ${context}:`, {
        message: errorObj.message,
        type: errorObj.type,
        timestamp: errorObj.timestamp
    });

    // Log full error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Full error details:', error);
    }

    // Save error to localStorage for debugging
    try {
        const errors = JSON.parse(localStorage.getItem('fintrust_errors') || '[]');
        errors.unshift(errorObj);
        localStorage.setItem('fintrust_errors', JSON.stringify(errors.slice(0, 20))); // Keep last 20 errors
    } catch (e) {
        console.error('Failed to save error to localStorage:', e);
    }

    // Show user-friendly message if needed
    if (showToUser) {
        const userMessage = getUserFriendlyErrorMessage(error);
        console.log('User message:', userMessage);
        // In a real app, this would trigger a toast notification or modal
    }

    return errorObj;
};

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @returns {string} User-friendly message
 */
const getUserFriendlyErrorMessage = (error) => {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
        return 'Network error. Please check your internet connection.';
    } else if (message.includes('unauthorized') || message.includes('auth')) {
        return 'Authentication failed. Please log in again.';
    } else if (message.includes('not found')) {
        return 'The requested resource was not found.';
    } else if (message.includes('validation')) {
        return 'Please check your input and try again.';
    } else if (message.includes('timeout')) {
        return 'Request timed out. Please try again.';
    } else {
        return 'Something went wrong. Please try again.';
    }
};

/**
 * System health check
 * @returns {Object} Health check results
 */
export const healthCheck = () => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {}
    };

    try {
        // Check localStorage availability
        health.checks.localStorage = checkLocalStorage();

        // Check session validity
        health.checks.session = checkSession();

        // Check browser compatibility
        health.checks.browser = checkBrowserCompatibility();

        // Check network status
        health.checks.network = checkNetworkStatus();

        // Check performance
        health.checks.performance = checkPerformance();

        // Determine overall status
        const failedChecks = Object.values(health.checks).filter(check => check.status === 'error');
        const degradedChecks = Object.values(health.checks).filter(check => check.status === 'warning');

        if (failedChecks.length > 0) {
            health.status = 'unhealthy';
        } else if (degradedChecks.length > 0) {
            health.status = 'degraded';
        }

        console.log('🏥 Health Check:', health.status.toUpperCase());
        return health;

    } catch (error) {
        console.error('Health check failed:', error);
        return {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        };
    }
};

/**
 * Check localStorage availability and health
 */
const checkLocalStorage = () => {
    try {
        const testKey = '__test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);

        // Check storage usage
        const usage = new Blob(Object.values(localStorage)).size;
        const limit = 5 * 1024 * 1024; // 5MB typical limit

        return {
            status: usage > limit * 0.9 ? 'warning' : 'ok',
            available: true,
            usage: `${(usage / 1024).toFixed(2)} KB`,
            message: usage > limit * 0.9 ? 'localStorage nearly full' : 'localStorage healthy'
        };
    } catch (error) {
        return {
            status: 'error',
            available: false,
            message: error.message
        };
    }
};

/**
 * Check session status
 */
const checkSession = () => {
    try {
        const sessionData = localStorage.getItem('fintrust_session');
        if (!sessionData) {
            return { status: 'warning', message: 'No active session' };
        }

        const session = JSON.parse(sessionData);
        const age = Date.now() - new Date(session.createdAt).getTime();
        const ageHours = age / (1000 * 60 * 60);

        return {
            status: ageHours > 23 ? 'warning' : 'ok',
            sessionAge: `${ageHours.toFixed(1)} hours`,
            message: ageHours > 23 ? 'Session expiring soon' : 'Session healthy'
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Session check failed'
        };
    }
};

/**
 * Check browser compatibility
 */
const checkBrowserCompatibility = () => {
    const checks = {
        localStorage: typeof Storage !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        promises: typeof Promise !== 'undefined',
        intl: typeof Intl !== 'undefined'
    };

    const unsupported = Object.entries(checks)
        .filter(([, supported]) => !supported)
        .map(([feature]) => feature);

    return {
        status: unsupported.length === 0 ? 'ok' : 'warning',
        supported: checks,
        message: unsupported.length === 0
            ? 'Browser fully compatible'
            : `Missing features: ${unsupported.join(', ')}`
    };
};

/**
 * Check network status
 */
const checkNetworkStatus = () => {
    return {
        status: navigator.onLine ? 'ok' : 'error',
        online: navigator.onLine,
        message: navigator.onLine ? 'Network connected' : 'Network offline'
    };
};

/**
 * Check performance metrics
 */
const checkPerformance = () => {
    if (typeof performance !== 'undefined' && performance.memory) {
        const memory = performance.memory;
        const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        const limitMB = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
        const usagePercent = ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1);

        return {
            status: usagePercent > 90 ? 'warning' : 'ok',
            memoryUsage: `${usedMB} MB / ${limitMB} MB (${usagePercent}%)`,
            message: usagePercent > 90 ? 'High memory usage' : 'Performance normal'
        };
    }

    return {
        status: 'ok',
        message: 'Performance metrics unavailable'
    };
};

/**
 * Clear all error logs
 */
export const clearErrorLogs = () => {
    try {
        localStorage.removeItem('fintrust_errors');
        console.log('✅ Error logs cleared');
        return true;
    } catch (error) {
        console.error('Failed to clear error logs:', error);
        return false;
    }
};

/**
 * Get error logs
 * @returns {Array} Array of error objects
 */
export const getErrorLogs = () => {
    try {
        return JSON.parse(localStorage.getItem('fintrust_errors') || '[]');
    } catch (error) {
        console.error('Failed to get error logs:', error);
        return [];
    }
};
