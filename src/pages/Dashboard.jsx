
import { useLoan } from '../context/LoanContext';
import { formatCurrency, getDaysUntilDue } from '../utils/loanValidation';
import { exportLoansToCSV } from '../utils/exportUtils';
import { Link } from 'react-router-dom';
import ReminderModal from '../components/ReminderModal';
import GamificationDashboard from '../components/GamificationDashboard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import './Dashboard.css';

const Dashboard = () => {
    const { loans, getDashboardStats } = useLoan();
    const stats = getDashboardStats();

    const recentLentLoans = loans.filter(l => l.type === 'lent').slice(0, 5);
    const recentBorrowedLoans = loans.filter(l => l.type === 'borrowed').slice(0, 5);

    return (
        <div className="dashboard">
            {/* Automatic Popup Notification - Moved to Navbar */}


            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => exportLoansToCSV(loans)} className="btn-secondary" title="Export all loans to CSV">
                        📥 Export Data
                    </button>
                    <Link to="/create-loan" className="btn-primary">
                        ➕ Create New Loan
                    </Link>
                </div>
            </div>

            {/* Gamification Dashboard */}
            <GamificationDashboard />

            {/* Analytics Dashboard */}
            <AnalyticsDashboard />

            {/* Stats Cards - Updated for outstandings and status */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>💸</div>
                    <div className="stat-content">
                        <div className="stat-label">Total Receivable (Active)</div>
                        <div className="stat-value">{formatCurrency(stats.overview.lentOutstanding)}</div>
                        <div className="stat-meta">{stats.lending.activeCount} active loans</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>💰</div>
                    <div className="stat-content">
                        <div className="stat-label">Total Owed (Active)</div>
                        <div className="stat-value">{formatCurrency(stats.overview.borrowedOutstanding)}</div>
                        <div className="stat-meta">{stats.borrowing.activeCount} active loans</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>📊</div>
                    <div className="stat-content">
                        <div className="stat-label">Status at a Glance</div>
                        <div className="status-glance-row">
                            <span className="sg-item sg-active">{stats.overview.activeLoans} Active</span>
                            <span className="sg-item sg-overdue">{stats.overview.overdueLoans} Overdue</span>
                            <span className="sg-item sg-completed">{stats.overview.completedLoans} Done</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Segmented Activity */}
            <div className="dashboard-lists-grid">

                {/* Loans Given */}
                <div className="dashboard-section list-section">
                    <div className="section-header">
                        <h2>Loans Given (Receivable)</h2>
                        <Link to="/loans" className="btn-link">View All →</Link>
                    </div>
                    {recentLentLoans.length === 0 ? (
                        <p className="empty-state">No active loans given.</p>
                    ) : (
                        <div className="loans-table small-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Borrower</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLentLoans.map(loan => (
                                        <tr key={loan.id}>
                                            <td>
                                                <div className="loan-name">{loan.borrowerName}</div>
                                            </td>
                                            <td className="amount">{formatCurrency(loan.amount)}</td>
                                            <td><span className={`status-badge ${loan.status}`}>{loan.status}</span></td>
                                            <td><Link to={`/loan/${loan.id}`} className="btn-view">View</Link></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Loans Taken */}
                <div className="dashboard-section list-section">
                    <div className="section-header">
                        <h2>Loans Taken (Payable)</h2>
                        <Link to="/loans" className="btn-link">View All →</Link>
                    </div>
                    {recentBorrowedLoans.length === 0 ? (
                        <p className="empty-state">No active loans taken.</p>
                    ) : (
                        <div className="loans-table small-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Lender</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBorrowedLoans.map(loan => (
                                        <tr key={loan.id}>
                                            <td>
                                                <div className="loan-name">{loan.lenderName}</div>
                                            </td>
                                            <td className="amount">{formatCurrency(loan.amount)}</td>
                                            <td><span className={`status-badge ${loan.status}`}>{loan.status}</span></td>
                                            <td><Link to={`/loan/${loan.id}`} className="btn-view">View</Link></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
