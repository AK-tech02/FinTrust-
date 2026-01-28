import { useState } from 'react';
import { useLoan } from '../context/LoanContext';
import { isMockMode } from '../supabaseClient';
import './LoginSignup.css';

const LoginSignup = () => {
    const { login, signup } = useLoan();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Safety check
    if (!login || !signup) {
        return <div style={{ padding: '20px', color: 'white' }}>Loading authentication...</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        console.log('Auth attempt:', isLogin ? 'Login' : 'Signup', 'Email:', email);

        try {
            if (isLogin) {
                const result = await login(email, password);
                console.log('Login result:', result);
            } else {
                const result = await signup(email, password, name);
                console.log('Signup result:', result);
                if (!isMockMode) {
                    setError('Check your email for verification link, then sign in.');
                    setIsLogin(true);
                }
            }
        } catch (err) {
            console.error('Auth error:', err);

            // Provide user-friendly error messages
            let errorMessage = err.message || 'An error occurred';

            if (errorMessage.includes('Email not confirmed')) {
                errorMessage = 'Please check your email and click the verification link before signing in.';
            } else if (errorMessage.includes('Invalid login credentials')) {
                errorMessage = 'Invalid email or password. Please try again.';
            } else if (errorMessage.includes('User already registered')) {
                errorMessage = 'This email is already registered. Please sign in instead.';
                setIsLogin(true);
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        alert('Google sign-in (Demo)');
    };

    return (
        <div className="login-page">
            {/* Left Side - Welcome Section */}
            <div className="welcome-section">
                <div className="welcome-content">
                    <div className="logo">
                        <div className="logo-icon">💎</div>
                        <div className="logo-text">Fintrust</div>
                    </div>

                    <h1 className="welcome-heading">
                        Welcome to Your<br />
                        Financial Dashboard
                    </h1>

                    <p className="welcome-description">
                        Track your metrics, analyze trends, and make data-driven decisions with our powerful analytics platform.
                    </p>

                    <div className="feature-cards">
                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <div className="feature-content">
                                <h3>Real-time Analytics</h3>
                                <p>Monitor your data as it happens</p>
                            </div>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <div className="feature-content">
                                <h3>Secure & Private</h3>
                                <p>Bank-level encryption for your data</p>
                            </div>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <div className="feature-content">
                                <h3>Lightning Fast</h3>
                                <p>Optimized for peak performance</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Sign In Form */}
            <div className="signin-section">
                <div className="signin-container">
                    <div className="signin-card">
                        <div className="signin-header">
                            <h2 className="signin-title">{isLogin ? 'Sign In' : 'Create Account'}</h2>
                            <p className="signin-subtitle">
                                {isLogin ? 'Welcome back! Please sign in to continue' : 'Join FinTrust to start tracking your loans'}
                            </p>
                        </div>

                        {isMockMode && (
                            <div style={{
                                padding: '12px',
                                marginBottom: '16px',
                                backgroundColor: '#e7f3ff',
                                border: '1px solid #4a90e2',
                                borderRadius: '8px',
                                color: '#1a5490',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{ fontSize: '18px' }}>🔧</span>
                                <div>
                                    <strong>Development Mode</strong>
                                    <br />
                                    Sign in with any email and password to test the app!
                                </div>
                            </div>
                        )}

                        <button type="button" className="google-button" onClick={handleGoogleSignIn}>
                            <svg className="google-icon" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="divider">or</div>

                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div style={{
                                    padding: '12px',
                                    marginBottom: '16px',
                                    backgroundColor: '#fee',
                                    border: '1px solid #fcc',
                                    borderRadius: '8px',
                                    color: '#c33',
                                    fontSize: '14px'
                                }}>
                                    {error}
                                </div>
                            )}

                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="form-input"
                                        placeholder="Your Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    placeholder="vu1f2425084@pvppcoe.ac.in"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        className="form-input"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        className="checkbox-input"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <label htmlFor="remember" className="checkbox-label">
                                        Remember me
                                    </label>
                                </div>
                                <a href="#forgot" className="forgot-link">
                                    Forgot password?
                                </a>
                            </div>

                            <button type="submit" className="signin-button" disabled={loading}>
                                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                                <span>→</span>
                            </button>
                        </form>

                        <div className="signup-link">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;
