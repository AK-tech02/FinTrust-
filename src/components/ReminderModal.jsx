import { useState, useEffect } from 'react';
import { useLoan } from '../context/LoanContext';
import { getDaysUntilDue, formatCurrency } from '../utils/loanValidation';
import { Link } from 'react-router-dom';
import './ReminderModal.css';

const ReminderModal = ({ isOpen, onClose }) => {
    const { loans } = useLoan();
    const [reminders, setReminders] = useState([]);

    useEffect(() => {
        // Update reminders whenever loans change
        const dueLoans = loans.filter(loan =>
            loan.status !== 'completed' && getDaysUntilDue(loan.dueDate) <= 3
        );
        setReminders(dueLoans);
    }, [loans]);

    if (!isOpen || reminders.length === 0) return null;

    const handleSendReminder = (loan) => {
        const personName = loan.type === 'lent' ? loan.borrowerName : loan.lenderName;
        const message = `Hi ${personName}, just a friendly reminder that the ${loan.type === 'lent' ? 'repayment' : 'payment'} of ${formatCurrency(loan.amount)} is due on ${new Date(loan.dueDate).toLocaleDateString()}. Thank you!`;

        // In a real app, this would integrate with an SMS/Email service
        alert(`✅ Notification Sent!\n\nTo: ${personName}\nMessage: "${message}"`);
    };

    return (
        <div className="reminder-modal-overlay">
            <div className="reminder-modal-content">
                <div className="reminder-modal-header">
                    <h2>
                        <span className="reminder-bell">🔔</span>
                        Payment Reminders
                    </h2>
                    <button className="btn-close-modal" onClick={onClose}>×</button>
                </div>

                <div className="reminder-modal-body">
                    {reminders.map(loan => {
                        const days = getDaysUntilDue(loan.dueDate);
                        const isOverdue = days < 0;
                        const personName = loan.type === 'lent' ? loan.borrowerName : loan.lenderName;

                        return (
                            <div key={loan.id} className={`reminder-item ${isOverdue ? 'overdue' : 'upcoming'}`}>
                                <div className="reminder-item-header">
                                    <span className="reminder-status">
                                        {isOverdue ? `⚠️ Overdue by ${Math.abs(days)} days` : `🕒 Due in ${days} days`}
                                    </span>
                                    <span className="type-badge small">
                                        {loan.type === 'lent' ? 'To Receive' : 'To Pay'}
                                    </span>
                                </div>

                                <div className="reminder-details">
                                    <div>
                                        <div className="reminder-person">{personName}</div>
                                        <Link to={`/loan/${loan.id}`} className="text-sm text-primary hover:underline">
                                            View Details
                                        </Link>
                                    </div>
                                    <div className="reminder-amount">
                                        {formatCurrency(loan.amount)}
                                    </div>
                                </div>

                                <div className="reminder-action">
                                    <button
                                        className="btn-send-message"
                                        onClick={() => handleSendReminder(loan)}
                                    >
                                        <span>📨 Send Polite Reminder</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ReminderModal;
