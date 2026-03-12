import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './Leaderboard.css';

const Leaderboard = () => {
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // In a real app we'd rank by XP and transaction speed
                // For now, we'll try to get all users or mock it
                setLoading(true);
                const q = query(collection(db, 'users'), limit(50));
                const snapshot = await getDocs(q);

                const users = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    // Generate mock XP/Speed for demo if not present
                    users.push({
                        id: doc.id,
                        name: data.name || 'Anonymous',
                        email: data.email,
                        xp: data.xp || Math.floor(Math.random() * 5000) + 100,
                        speedScore: data.speedScore || (Math.random() * 5 + 8).toFixed(1) // Fake out of 10
                    });
                });

                // Sort by XP
                users.sort((a, b) => b.xp - a.xp);
                setTopUsers(users);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="leaderboard-page fade-in">
            <div className="leaderboard-header">
                <h1>🏆 FinTrust Leaderboard</h1>
                <p>Ranked by Experience Points (XP) and Transaction Speed</p>
            </div>

            <div className="leaderboard-content">
                {loading ? (
                    <div className="loading-state">Loading rankings...</div>
                ) : (
                    <div className="leaderboard-table-wrapper">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>User</th>
                                    <th>Speed Score</th>
                                    <th>Total XP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topUsers.map((user, index) => (
                                    <tr key={user.id} className={index < 3 ? `top-${index + 1}` : ''}>
                                        <td className="rank-cell">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </td>
                                        <td className="user-cell">
                                            <div className="user-avatar-small">{user.name.charAt(0)}</div>
                                            <div className="user-name-cell">
                                                {user.name}
                                            </div>
                                        </td>
                                        <td className="speed-cell">
                                            <div className="speed-bar-container">
                                                <span className="speed-text">{user.speedScore}/10</span>
                                            </div>
                                        </td>
                                        <td className="xp-cell">
                                            <span className="xp-badge">{user.xp} XP</span>
                                        </td>
                                    </tr>
                                ))}
                                {topUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="empty-state">No users ranked yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
