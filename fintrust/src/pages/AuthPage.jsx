import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) await login(email, password);
      else await signup(email, password, name);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/\(auth.*\)/, ""));
    }
    setLoading(false);
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>₹</span>
          <h1 style={styles.logoText}>FinTrust</h1>
        </div>
        <p style={styles.tagline}>Lend & Borrow with Trust</p>

        <div style={styles.tabs}>
          <button style={isLogin ? styles.tabActive : styles.tab} onClick={() => setIsLogin(true)}>Login</button>
          <button style={!isLogin ? styles.tabActive : styles.tab} onClick={() => setIsLogin(false)}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <input style={styles.input} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
          )}
          <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  bg: { minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" },
  card: { background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 400, boxShadow: "0 25px 50px rgba(0,0,0,0.4)" },
  logo: { display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 4 },
  logoIcon: { background: "#6c63ff", color: "#fff", borderRadius: "50%", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 },
  logoText: { color: "#fff", fontSize: 28, fontWeight: 800, margin: 0 },
  tagline: { color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 13, marginBottom: 28, marginTop: 4 },
  tabs: { display: "flex", background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, padding: "10px", border: "none", background: "transparent", color: "rgba(255,255,255,0.5)", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 },
  tabActive: { flex: 1, padding: "10px", border: "none", background: "#6c63ff", color: "#fff", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700 },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  input: { padding: "13px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, outline: "none" },
  btn: { padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #6c63ff, #a855f7)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 },
  error: { color: "#ff6b6b", fontSize: 13, margin: 0, textAlign: "center" }
};
