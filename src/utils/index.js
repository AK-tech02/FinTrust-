// Central export file for all utility functions

// Import from existing files
export { validateLoanData, validatePayment, getDaysUntilDue, getStatusColor } from './loanValidation';
export { badges, levels, pointsConfig } from './gamification';

// Import from new utility files
export {
    sendEmailNotification,
    sendWhatsAppNotification,
    updateNotificationPreferences,
    getNotificationPreferences,
    sendLoanNotification
} from './notifications';

export {
    authorizeUser,
    authorizeLoanAccess,
    validateUserSession,
    createUserSession,
    destroyUserSession,
    isAuthenticated,
    getCurrentSession
} from './security';

export {
    formatCurrency,
    formatDate,
    handleError,
    healthCheck,
    clearErrorLogs,
    getErrorLogs
} from './systemUtils';

// Re-export commonly used functions with aliases for convenience
export { formatCurrency as currency } from './systemUtils';
export { formatDate as date } from './systemUtils';
