import { useLoan } from '../context/LoanContext';
import './ActivityFeed.css';

const ActivityFeed = ({ limit = 10, loanId = null }) => {
    const { getActivityFeed, getLoanActivityLog } = useLoan();

    const activities = loanId ? getLoanActivityLog(loanId) : getActivityFeed(limit);

    const getActivityIcon = (type) => {
        switch (type) {
            case 'LOAN_CREATED': return '📝';
            case 'PAYMENT_MADE': return '💰';
            case 'LOAN_COMPLETED': return '✅';
            case 'LOAN_OVERDUE': return '⚠️';
            case 'LOAN_UPDATED': return '✏️';
            case 'LOAN_DELETED': return '🗑️';
            default: return '📌';
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'LOAN_CREATED': return '#7C3AED';
            case 'PAYMENT_MADE': return '#10B981';
            case 'LOAN_COMPLETED': return '#3B82F6';
            case 'LOAN_OVERDUE': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (activities.length === 0) {
        return (
            <div className="activity-feed-empty">
                <div className="empty-icon">📭</div>
                <p>No activity yet</p>
            </div>
        );
    }

    return (
        <div className="activity-feed">
            {activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                    <div
                        className="activity-icon"
                        style={{ background: getActivityColor(activity.type) }}
                    >
                        {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-content">
                        <p className="activity-description">{activity.description}</p>
                        <span className="activity-timestamp">{formatTimestamp(activity.timestamp)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityFeed;
