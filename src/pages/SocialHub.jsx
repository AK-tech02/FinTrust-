import { useState, useEffect } from 'react';
import { useLoan } from '../context/LoanContext';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, or } from 'firebase/firestore';
import { db } from '../firebase';
import './SocialHub.css';
import toast from 'react-hot-toast';

const SocialHub = () => {
    const { user, gamification } = useLoan();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showManualForm, setShowManualForm] = useState(false);
    const [manualName, setManualName] = useState('');
    const [manualPhone, setManualPhone] = useState('');

    useEffect(() => {
        if (user) {
            fetchConnections();
        }
    }, [user]);

    const fetchConnections = async () => {
        try {
            // Find connections where user is either sender or receiver
            const q1 = query(collection(db, 'connections'), where('sender_id', '==', user.id));
            const q2 = query(collection(db, 'connections'), where('receiver_id', '==', user.id));

            const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

            const allConnections = [];
            snap1.forEach(doc => allConnections.push({ id: doc.id, ...doc.data() }));
            snap2.forEach(doc => allConnections.push({ id: doc.id, ...doc.data() }));

            const accepted = [];
            const pending = [];

            allConnections.forEach(conn => {
                if (conn.status === 'accepted') {
                    // Extract the OTHER person's info
                    const friendInfo = conn.sender_id === user.id
                        ? { id: conn.receiver_id, name: conn.receiver_name, email: conn.receiver_email }
                        : { id: conn.sender_id, name: conn.sender_name, email: conn.sender_email };
                    accepted.push({ ...conn, friend: friendInfo });
                } else if (conn.status === 'pending' && conn.receiver_id === user.id) {
                    // Only show pending requests RECEIVED by the user
                    pending.push(conn);
                }
            });

            setFriends(accepted);
            setPendingRequests(pending);
        } catch (error) {
            console.error('Error fetching connections:', error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        try {
            // We search by exact email or phone for privacy reasons in a financial app
            const q = query(
                collection(db, 'users'),
                or(
                    where('email', '==', searchTerm.trim()),
                    where('phone', '==', searchTerm.trim())
                )
            );

            const snapshot = await getDocs(q);
            const results = [];
            snapshot.forEach(doc => {
                if (doc.id !== user.id) { // Don't show self
                    results.push({ id: doc.id, ...doc.data() });
                }
            });

            setSearchResults(results);
            if (results.length === 0) {
                toast.error('No matching user found. Ensure they have registered with this exact email or phone.');
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to search for users.');
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async (targetUser) => {
        try {
            // Check if connection already exists
            const existingFriend = friends.find(f => f.friend.id === targetUser.id);
            if (existingFriend) {
                toast.error(`${targetUser.name} is already your friend!`);
                return;
            }

            await addDoc(collection(db, 'connections'), {
                sender_id: user.id,
                sender_name: user.name,
                sender_email: user.email,
                receiver_id: targetUser.id,
                receiver_name: targetUser.name,
                receiver_email: targetUser.email,
                status: 'pending',
                created_at: serverTimestamp()
            });

            toast.success(`Friend request sent to ${targetUser.name}!`);
            setSearchResults([]); // Clear search after sending
        } catch (error) {
            console.error('Error sending request:', error);
            toast.error('Failed to send request.');
        }
    };

    const handleRequest = async (requestId, accept) => {
        try {
            const connRef = doc(db, 'connections', requestId);
            if (accept) {
                await updateDoc(connRef, {
                    status: 'accepted',
                    updated_at: serverTimestamp()
                });
                toast.success('Friend request accepted!');
            } else {
                await updateDoc(connRef, {
                    status: 'rejected',
                    updated_at: serverTimestamp()
                });
                toast('Friend request declined.', { icon: '🛑' });
            }
            fetchConnections(); // Refresh lists
        } catch (error) {
            console.error('Error handling request:', error);
            toast.error('Something went wrong.');
        }
    };

    const sendVouch = async (friendId) => {
        if (gamification.trustScore < 60) {
            toast.error('Your Trust Score must be at least 60 to vouch for someone.');
            return;
        }

        try {
            await addDoc(collection(db, 'vouches'), {
                from_user: user.id,
                to_user: friendId,
                created_at: serverTimestamp()
            });
            toast.success('You successfully vouched for this user! Their trustworthiness just grew.', { icon: '🤝' });
            // In a full implementation, this would trigger a cloud function to boost the target's trust score
        } catch (error) {
            console.error('Error vouching:', error);
            toast.error('Failed to send vouch.');
        }
    };

    const importFromContacts = async () => {
        try {
            // Check if Contact Picker API is supported
            if ('contacts' in navigator && 'ContactsManager' in window) {
                const props = ['name', 'tel'];
                const opts = { multiple: true };
                const contacts = await navigator.contacts.select(props, opts);

                if (contacts.length > 0) {
                    const contact = contacts[0];
                    toast.success(`Imported ${contact.name[0]}! (Demo mode)`);
                    const newConn = { friend: { name: contact.name[0], email: contact.tel[0] || 'Unknown Number' }, id: 'imported_' + Date.now(), status: 'accepted' };
                    setFriends(prev => [...prev, newConn]);
                }
            } else {
                toast.error('Contact Picker API not supported on this browser (usually Android Chrome only). Mocking import instead.', { duration: 4000 });
                // Mock behavior for desktop/iOS
                setTimeout(() => {
                    const newConn = { friend: { name: 'Family Contact (Imported)', email: '+919876543210' }, id: 'mock_' + Date.now(), status: 'accepted' };
                    setFriends(prev => [...prev, newConn]);
                    toast.success('Successfully imported mock contact.');
                }, 1000);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to access contacts.');
        }
    };

    const handleManualAdd = (e) => {
        e.preventDefault();
        if (!manualName || !manualPhone) return;

        const newConn = {
            friend: { name: manualName, email: manualPhone },
            id: 'manual_' + Date.now(),
            status: 'accepted'
        };
        setFriends(prev => [...prev, newConn]);
        toast.success(`Successfully added ${manualName} to your network.`);
        setManualName('');
        setManualPhone('');
        setShowManualForm(false);
    };

    return (
        <div className="social-hub fade-in">
            <div className="social-header">
                <h1>👥 Social Hub</h1>
                <p>Connect with trusted friends and family to manage informal loans</p>
            </div>

            <div className="social-grid">
                {/* Left Column - Search & Pending Requests */}
                <div className="social-left">
                    <div className="social-card">
                        <h3>🔍 Find Contacts</h3>
                        <p className="subtext">Search by exact Email or Phone Number</p>

                        <form onSubmit={handleSearch} className="search-form">
                            <input
                                type="text"
                                placeholder="Enter email or +91 phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </form>

                        <div className="contacts-import-section" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' }}>
                            <h4 style={{ marginBottom: '12px', fontSize: '14px', color: '#4B5563' }}>Other ways to connect</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <button onClick={importFromContacts} className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                    📱 Import from Phone Contacts
                                </button>
                                <button onClick={() => setShowManualForm(!showManualForm)} className="btn-outline" style={{ width: '100%' }}>
                                    ✍️ Add Contact Manually
                                </button>
                            </div>

                            {showManualForm && (
                                <form onSubmit={handleManualAdd} className="manual-add-form" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#F9FAFB', padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                                    <input type="text" placeholder="Contact Name" value={manualName} onChange={e => setManualName(e.target.value)} required className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                                    <input type="text" placeholder="Phone Number or Email" value={manualPhone} onChange={e => setManualPhone(e.target.value)} required className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Add to Network</button>
                                </form>
                            )}
                        </div>

                        {searchResults.length > 0 && (
                            <div className="search-results">
                                <h4>Search Results</h4>
                                {searchResults.map(result => (
                                    <div key={result.id} className="user-list-item">
                                        <div className="user-info">
                                            <div className="user-avatar">{result.name.charAt(0)}</div>
                                            <div>
                                                <div className="user-name">
                                                    {result.name}
                                                    {result.is_new_user && <span className="badge-new">NEW</span>}
                                                </div>
                                                <div className="user-email">{result.email}</div>
                                            </div>
                                        </div>
                                        <button
                                            className="btn-secondary btn-small"
                                            onClick={() => sendFriendRequest(result)}
                                        >
                                            Add Friend
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {pendingRequests.length > 0 && (
                        <div className="social-card highlight-card">
                            <h3>👋 Pending Requests</h3>
                            <div className="requests-list">
                                {pendingRequests.map(req => (
                                    <div key={req.id} className="user-list-item">
                                        <div className="user-info">
                                            <div className="user-avatar">{req.sender_name.charAt(0)}</div>
                                            <div>
                                                <div className="user-name">{req.sender_name}</div>
                                                <div className="user-subtext">Wants to connect</div>
                                            </div>
                                        </div>
                                        <div className="request-actions">
                                            <button onClick={() => handleRequest(req.id, true)} className="btn-accept">✓</button>
                                            <button onClick={() => handleRequest(req.id, false)} className="btn-decline">✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - My Network */}
                <div className="social-right">
                    <div className="social-card">
                        <h3>🤝 My Trusted Network ({friends.length})</h3>
                        <p className="subtext">People you can transact with</p>

                        {friends.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📭</span>
                                <p>Your network is empty.</p>
                                <p className="empty-subtext">Search for friends and family to start adding them to your trusted circle.</p>
                            </div>
                        ) : (
                            <div className="friends-list">
                                {friends.map(conn => (
                                    <div key={conn.id} className="friend-card">
                                        <div className="friend-header">
                                            <div className="user-info">
                                                <div className="user-avatar">{conn.friend.name.charAt(0)}</div>
                                                <div>
                                                    <div className="user-name">{conn.friend.name}</div>
                                                    <div className="user-email">{conn.friend.email}</div>
                                                </div>
                                            </div>
                                            <div className="trust-badge">Verified Contact</div>
                                        </div>
                                        <div className="friend-actions">
                                            <button className="btn-secondary btn-small">Create Loan</button>
                                            <button
                                                className="btn-outline btn-small"
                                                onClick={() => sendVouch(conn.friend.id)}
                                                title="Endorse this person's trustworthiness"
                                            >
                                                Vouch for them
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialHub;
