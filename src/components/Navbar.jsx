import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoan } from '../context/LoanContext';
import { getDaysUntilDue } from '../utils/loanValidation';
import GamificationWidget from './GamificationWidget';
import ThemeToggle from './ThemeToggle';
import ReminderModal from './ReminderModal';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, loans } = useLoan();
    const navigate = useNavigate();
    const [showReminders, setShowReminders] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Calculate active reminders count
    const reminderCount = loans.filter(loan =>
        loan.status !== 'completed' && getDaysUntilDue(loan.dueDate) <= 3
    ).length;

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/dashboard" className="navbar-logo">
                    <div className="navbar-logo-icon">💎</div>
                    <span className="navbar-logo-text">Fintrust</span>
                </Link>
            </div>

            <div className="navbar-right">
                <GamificationWidget />
                <ThemeToggle />

                <button
                    className="navbar-notifications"
                    onClick={() => setShowReminders(true)}
                >
                    🔔
                    {reminderCount > 0 && (
                        <span className="notification-badge">{reminderCount}</span>
                    )}
                </button>

                {/* Notification Modal */}
                <ReminderModal
                    isOpen={showReminders}
                    onClose={() => setShowReminders(false)}
                />

                <div className="navbar-profile" onClick={handleLogout} title="Logout">
                    <div className="navbar-avatar">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                    <div className="navbar-user-info">
                        <div className="navbar-user-name">{user?.name || user?.email || 'User'}</div>
                        <div className="navbar-user-email">{user?.email || ''}</div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
