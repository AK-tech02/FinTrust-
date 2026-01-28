// Security and Access Control Utilities

/**
 * Authorize user - Check if user has permission for certain actions
 * @param {Object} user - Current user object
 * @param {string} action - Action to authorize (view, create, edit, delete)
 * @param {string} resource - Resource type (loan, payment, user, etc.)
 * @returns {Object} Authorization result
 */
export const authorizeUser = (user, action, resource) => {
    try {
        // Check if user exists
        if (!user || !user.id) {
            return {
                authorized: false,
                reason: 'User not authenticated'
            };
        }

        // Check if user session is valid
        const sessionValid = validateUserSession(user);
        if (!sessionValid.valid) {
            return {
                authorized: false,
                reason: 'Session expired or invalid'
            };
        }

        // Role-based access control (RBAC)
        const userRole = user.role || 'user';

        // Define permissions matrix
        const permissions = {
            admin: ['view', 'create', 'edit', 'delete'],
            user: ['view', 'create', 'edit'],
            guest: ['view']
        };

        const allowedActions = permissions[userRole] || permissions.guest;

        if (!allowedActions.includes(action)) {
            return {
                authorized: false,
                reason: `User role '${userRole}' does not have permission to ${action} ${resource}`
            };
        }

        // Log authorization
        console.log(`✅ Authorization granted: ${user.name} can ${action} ${resource}`);

        return {
            authorized: true,
            user: user.name,
            action,
            resource
        };
    } catch (error) {
        console.error('Authorization error:', error);
        return {
            authorized: false,
            reason: 'Authorization check failed',
            error: error.message
        };
    }
};

/**
 * Authorize loan access - Check if user can access specific loan
 * @param {Object} user - Current user object
 * @param {Object} loan - Loan object to check access for
 * @param {string} action - Action to perform (view, edit, delete)
 * @returns {Object} Authorization result
 */
export const authorizeLoanAccess = (user, loan, action = 'view') => {
    try {
        // Check basic authorization first
        const basicAuth = authorizeUser(user, action, 'loan');
        if (!basicAuth.authorized) {
            return basicAuth;
        }

        // Check if user owns this loan (either lender or borrower)
        const isLender = loan.type === 'lent' && loan.userId === user.id;
        const isBorrower = loan.type === 'borrowed' && loan.userId === user.id;
        const isAdmin = user.role === 'admin';

        if (!isLender && !isBorrower && !isAdmin) {
            return {
                authorized: false,
                reason: 'User does not have access to this loan'
            };
        }

        // Additional checks for destructive actions
        if (action === 'delete') {
            // Only allow deletion if no payments made
            if (loan.amountPaid > 0) {
                return {
                    authorized: false,
                    reason: 'Cannot delete loan with payments'
                };
            }
        }

        if (action === 'edit') {
            // Only allow editing if loan is not completed
            if (loan.status === 'completed') {
                return {
                    authorized: false,
                    reason: 'Cannot edit completed loan'
                };
            }
        }

        console.log(`✅ Loan access granted: ${user.name} can ${action} loan ${loan.id}`);

        return {
            authorized: true,
            loanId: loan.id,
            action
        };
    } catch (error) {
        console.error('Loan authorization error:', error);
        return {
            authorized: false,
            reason: 'Loan access check failed',
            error: error.message
        };
    }
};

/**
 * Validate user session
 * @param {Object} user - User object with session info
 * @returns {Object} Validation result
 */
export const validateUserSession = (user) => {
    try {
        // Check if user exists
        if (!user || !user.id) {
            return {
                valid: false,
                reason: 'No user session found'
            };
        }

        // Get session from localStorage
        const sessionData = localStorage.getItem('fintrust_session');
        if (!sessionData) {
            return {
                valid: false,
                reason: 'No session data found'
            };
        }

        const session = JSON.parse(sessionData);

        // Check if session belongs to current user
        if (session.userId !== user.id) {
            return {
                valid: false,
                reason: 'Session user mismatch'
            };
        }

        // Check session expiry (default 24 hours)
        const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const sessionAge = Date.now() - new Date(session.createdAt).getTime();

        if (sessionAge > sessionTimeout) {
            // Session expired
            localStorage.removeItem('fintrust_session');
            return {
                valid: false,
                reason: 'Session expired',
                expiredAt: new Date(new Date(session.createdAt).getTime() + sessionTimeout).toISOString()
            };
        }

        // Update last activity
        session.lastActivity = new Date().toISOString();
        localStorage.setItem('fintrust_session', JSON.stringify(session));

        return {
            valid: true,
            userId: user.id,
            sessionAge: Math.floor(sessionAge / 1000 / 60), // in minutes
            expiresIn: Math.floor((sessionTimeout - sessionAge) / 1000 / 60) // in minutes
        };
    } catch (error) {
        console.error('Session validation error:', error);
        return {
            valid: false,
            reason: 'Session validation failed',
            error: error.message
        };
    }
};

/**
 * Create user session
 * @param {Object} user - User object
 * @returns {Object} Session info
 */
export const createUserSession = (user) => {
    const session = {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    localStorage.setItem('fintrust_session', JSON.stringify(session));
    console.log('✅ Session created for:', user.name);

    return session;
};

/**
 * Destroy user session
 * @returns {boolean} Success status
 */
export const destroyUserSession = () => {
    try {
        localStorage.removeItem('fintrust_session');
        console.log('✅ Session destroyed');
        return true;
    } catch (error) {
        console.error('Error destroying session:', error);
        return false;
    }
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
    const userData = localStorage.getItem('fintrust_user');
    const sessionData = localStorage.getItem('fintrust_session');

    if (!userData || !sessionData) {
        return false;
    }

    const user = JSON.parse(userData);
    const sessionValid = validateUserSession(user);

    return sessionValid.valid;
};

/**
 * Get current session info
 * @returns {Object|null} Session data or null
 */
export const getCurrentSession = () => {
    const sessionData = localStorage.getItem('fintrust_session');
    return sessionData ? JSON.parse(sessionData) : null;
};
