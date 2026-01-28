
import { useLoan } from '../context/LoanContext';
import { formatCurrency, getDaysUntilDue } from '../utils/loanValidation';
import { Link } from 'react-router-dom';
import ReminderModal from '../components/ReminderModal';
import GamificationDashboard from '../components/GamificationDashboard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import './Dashboard.css';

const Dashboard = () => {
    const { loans, getStats } = useLoan();
    const stats = getStats();

    const recentLoans = loans.slice(0, 5);

    return (
        <div className="dashboard">
            {/* Automatic Popup Notification - Moved to Navbar */}


            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <Link to="/create-loan" className="btn-primary">
                    ➕ Create New Loan
                </Link>
            </div>

            {/* Gamification Dashboard */}
            <GamificationDashboard />

            {/* Analytics Dashboard */}
            <AnalyticsDashboard />

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>💸</div>
                    <div className="stat-content">
                        <div className="stat-label">Total Lent</div>
                        <div className="stat-value">{formatCurrency(stats.totalLent)}</div>
                        <div className="stat-meta">{stats.activeLent} active</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>💰</div>
                    <div className="stat-content">
                        <div className="stat-label">Total Borrowed</div>
                        <div className="stat-value">{formatCurrency(stats.totalBorrowed)}</div>
                        <div className="stat-meta">{stats.activeBorrowed} active</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>✅</div>
                    <div className="stat-content">
                        <div className="stat-label">Completed</div>
                        <div className="stat-value">{stats.completedLoans}</div>
                        <div className="stat-meta">Loans</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444, #F87171)' }}>⚠️</div>
                    <div className="stat-content">
                        <div className="stat-label">Overdue</div>
                        <div className="stat-value">{stats.overdueLoans}</div>
                        <div className="stat-meta">Loans</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2>Recent Loans</h2>
                    <Link to="/loans" className="btn-link">View All →</Link>
                </div>

                <div className="loans-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Person</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentLoans.map(loan => (
                                <tr key={loan.id}>
                                    <td>
                                        <div className="loan-person">
                                            <div className="loan-avatar">{(loan.type === 'lent' ? loan.borrowerName : loan.lenderName).charAt(0)}</div>
                                            <div>
                                                <div className="loan-name">{loan.type === 'lent' ? loan.borrowerName : loan.lenderName}</div>
                                                <div className="loan-email">{loan.type === 'lent' ? loan.borrowerEmail : loan.lenderEmail}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`type-badge ${loan.type}`}>
                                            {loan.type === 'lent' ? '↗️ Lent' : '↙️ Borrowed'}
                                        </span>
                                    </td>
                                    <td className="amount">{formatCurrency(loan.amount)}</td>
                                    <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${loan.status}`}>{loan.status}</span>
                                    </td>
                                    <td>
                                        <Link to={`/loan/${loan.id}`} className="btn-view">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
