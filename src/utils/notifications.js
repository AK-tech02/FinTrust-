// Notification Service Utilities

/**
 * Send email notification to user
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Email body (HTML or text)
 * @param {string} options.type - Notification type (loan_created, payment_reminder, overdue_alert, etc.)
 * @returns {Promise<Object>} Result of email send operation
 */
export const sendEmailNotification = async (options) => {
    const { to, subject, body, type = 'general' } = options;

    try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            throw new Error('Invalid email address');
        }

        // In production, this would call an actual email service (SendGrid, AWS SES, etc.)
        // For now, we'll simulate the email send and log to console
        console.log('📧 Sending Email Notification:', {
            to,
            subject,
            type,
            timestamp: new Date().toISOString()
        });

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Store notification in localStorage for demo purposes
        const notifications = JSON.parse(localStorage.getItem('fintrust_notifications') || '[]');
        notifications.unshift({
            id: `email_${Date.now()}`,
            type: 'email',
            notificationType: type,
            to,
            subject,
            body,
            status: 'sent',
            sentAt: new Date().toISOString()
        });
        localStorage.setItem('fintrust_notifications', JSON.stringify(notifications.slice(0, 50)));

        return {
            success: true,
            messageId: `msg_${Date.now()}`,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Email notification error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Send WhatsApp notification
 * @param {Object} options - WhatsApp options
 * @param {string} options.to - Phone number with country code
 * @param {string} options.message - Message text
 * @param {string} options.type - Notification type
 * @returns {Promise<Object>} Result of WhatsApp send operation
 */
export const sendWhatsAppNotification = async (options) => {
    const { to, message, type = 'general' } = options;

    try {
        // Validate phone number format (basic validation)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(to.replace(/\s/g, ''))) {
            throw new Error('Invalid phone number format');
        }

        // In production, this would use WhatsApp Business API or Twilio
        console.log('📱 Sending WhatsApp Notification:', {
            to,
            message: message.substring(0, 50) + '...',
            type,
            timestamp: new Date().toISOString()
        });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 700));

        // Store notification
        const notifications = JSON.parse(localStorage.getItem('fintrust_notifications') || '[]');
        notifications.unshift({
            id: `whatsapp_${Date.now()}`,
            type: 'whatsapp',
            notificationType: type,
            to,
            message,
            status: 'sent',
            sentAt: new Date().toISOString()
        });
        localStorage.setItem('fintrust_notifications', JSON.stringify(notifications.slice(0, 50)));

        return {
            success: true,
            messageId: `wa_${Date.now()}`,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('WhatsApp notification error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Update user notification preferences
 * @param {Object} preferences - Notification preferences
 * @param {boolean} preferences.emailEnabled - Enable email notifications
 * @param {boolean} preferences.whatsappEnabled - Enable WhatsApp notifications
 * @param {boolean} preferences.dueReminders - Send due date reminders
 * @param {boolean} preferences.overdueAlerts - Send overdue alerts
 * @param {boolean} preferences.paymentConfirmations - Send payment confirmations
 * @param {number} preferences.reminderDays - Days before due date to send reminder
 * @returns {Object} Updated preferences
 */
export const updateNotificationPreferences = (preferences) => {
    try {
        // Get current preferences
        const currentPrefs = JSON.parse(localStorage.getItem('fintrust_notification_prefs') || '{}');

        // Default preferences
        const defaultPrefs = {
            emailEnabled: true,
            whatsappEnabled: false,
            dueReminders: true,
            overdueAlerts: true,
            paymentConfirmations: true,
            loanCreatedNotif: true,
            reminderDays: 3
        };

        // Merge with new preferences
        const updatedPrefs = {
            ...defaultPrefs,
            ...currentPrefs,
            ...preferences,
            updatedAt: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('fintrust_notification_prefs', JSON.stringify(updatedPrefs));

        console.log('✅ Notification preferences updated:', updatedPrefs);

        return {
            success: true,
            preferences: updatedPrefs
        };
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get user notification preferences
 * @returns {Object} Current notification preferences
 */
export const getNotificationPreferences = () => {
    const prefs = localStorage.getItem('fintrust_notification_prefs');
    if (prefs) {
        return JSON.parse(prefs);
    }

    // Return defaults if not set
    return {
        emailEnabled: true,
        whatsappEnabled: false,
        dueReminders: true,
        overdueAlerts: true,
        paymentConfirmations: true,
        loanCreatedNotif: true,
        reminderDays: 3
    };
};

/**
 * Send loan-related notification (combines email and WhatsApp based on preferences)
 * @param {Object} options - Notification options
 * @param {string} options.type - Type of notification
 * @param {Object} options.loan - Loan data
 * @param {string} options.recipientEmail - Recipient email
 * @param {string} options.recipientPhone - Recipient phone
 * @returns {Promise<Object>} Results
 */
export const sendLoanNotification = async (options) => {
    const { type, loan, recipientEmail, recipientPhone } = options;
    const prefs = getNotificationPreferences();
    const results = { email: null, whatsapp: null };

    // Prepare notification content based on type
    let subject, body, message;

    switch (type) {
        case 'loan_created':
            subject = `New Loan Created - ₹${loan.amount.toLocaleString()}`;
            body = `<p>A new loan has been created:</p>
                    <ul>
                        <li>Amount: ₹${loan.amount.toLocaleString()}</li>
                        <li>Due Date: ${new Date(loan.dueDate).toLocaleDateString()}</li>
                        <li>Type: ${loan.type}</li>
                    </ul>`;
            message = `New loan created: ₹${loan.amount.toLocaleString()} due on ${new Date(loan.dueDate).toLocaleDateString()}`;
            break;

        case 'payment_reminder':
            subject = `Payment Reminder - ₹${loan.amount.toLocaleString()}`;
            body = `<p>Reminder: Your loan payment is due soon.</p>
                    <p>Due Date: ${new Date(loan.dueDate).toLocaleDateString()}</p>
                    <p>Outstanding: ₹${(loan.amount - loan.amountPaid).toLocaleString()}</p>`;
            message = `Reminder: Loan payment of ₹${(loan.amount - loan.amountPaid).toLocaleString()} due on ${new Date(loan.dueDate).toLocaleDateString()}`;
            break;

        case 'overdue_alert':
            subject = `⚠️ Overdue Alert - ₹${loan.amount.toLocaleString()}`;
            body = `<p style="color: red;"><strong>Your loan payment is overdue!</strong></p>
                    <p>Please make payment as soon as possible.</p>
                    <p>Outstanding: ₹${(loan.amount - loan.amountPaid).toLocaleString()}</p>`;
            message = `⚠️ OVERDUE: Loan payment of ₹${(loan.amount - loan.amountPaid).toLocaleString()} is past due date`;
            break;

        case 'payment_received':
            subject = `Payment Received - ₹${loan.amount.toLocaleString()}`;
            body = `<p>✅ Payment has been recorded.</p>
                    <p>Remaining Balance: ₹${(loan.amount - loan.amountPaid).toLocaleString()}</p>`;
            message = `✅ Payment received. Remaining: ₹${(loan.amount - loan.amountPaid).toLocaleString()}`;
            break;

        default:
            subject = 'Loan Update';
            body = '<p>Your loan has been updated.</p>';
            message = 'Your loan has been updated.';
    }

    // Send email if enabled
    if (prefs.emailEnabled && recipientEmail) {
        results.email = await sendEmailNotification({
            to: recipientEmail,
            subject,
            body,
            type
        });
    }

    // Send WhatsApp if enabled
    if (prefs.whatsappEnabled && recipientPhone) {
        results.whatsapp = await sendWhatsAppNotification({
            to: recipientPhone,
            message,
            type
        });
    }

    return results;
};
