import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, userData, logout } = useAuth();
  const [loans, setLoans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "loans"), where("involvedUsers", "array-contains", user.uid));
    const unsub = onSnapshot(q, snap => {
      setLoans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  const activeLoans = loans.filter(l => l.status !== "paid");
  const totalLent = loans.filter(l => l.lenderId === user.uid).reduce((s, l) => s + l.amount, 0);
  const totalBorrowed = loans.filter(l => l.borrowerId === user.uid).reduce((s, l) => s + l.amount, 0);

  async function markRepaid(loan) {
    const isOnTime = new Date() <= new Date(loan.deadline);
    const scoreChange = isOnTime ? 10 : -25;
    const borrowerRef = doc(db, "users", loan.borrowerId);
    const borrowerSnap = await getDoc(borrowerRef);
    const currentScore = borrowerSnap.data().trustScore || 500;
    await updateDoc(borrowerRef, { trustScore: currentScore + scoreChange });
    await updateDoc(doc(db, "loans", loan.id), { status: "paid", paidAt: new Date().toISOString() });
  }

  async function markLate(loan) {
    const borrowerRef = doc(db, "users", loan.borrowerId);
    const borrowerSnap = await getDoc(borrowerRef);
    const currentScore = borrowerSnap.data().trustScore || 500;
    await updateDoc(borrowerRef, { trustScore: currentScore - 25 });
    await updateDoc(doc(db, "loans", loan.id), { status: "late" });
  }

  const score = userData?.trustScore || 500;
  const scoreColor = score >= 600 ? "#4ade80" : score >= 400 ? "#facc15" : "#f87171";

  return (
    <div style={styles.bg}>
      <nav style={styles.nav}>
        <div style={styles.navLogo}>₹ FinTrust</div>
        <div style={styles.navRight}>
          <span style={styles.navName}>{user?.displayName}</span>
          <button style={styles.navBtn} onClick={() => navigate("/add-loan")}>+ Add Loan</button>
          <button style={styles.navLogout} onClick={logout}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Trust Score</p>
            <p style={{ ...styles.statValue, color: scoreColor }}>{score}</p>
            <p style={styles.statSub}>{score >= 600 ? "🟢 Trusted" : score >= 400 ? "🟡 Moderate" : "🔴 At Risk"}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Lent</p>
            <p style={{ ...styles.statValue, color: "#4ade80" }}>₹{totalLent.toLocaleString()}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Borrowed</p>
            <p style={{ ...styles.statValue, color: "#f87171" }}>₹{totalBorrowed.toLocaleString()}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Active Loans</p>
            <p style={{ ...styles.statValue, color: "#a78bfa" }}>{activeLoans.length}</p>
          </div>
        </div>

        {/* Loans List */}
        <h2 style={styles.sectionTitle}>Active Loans</h2>
        {activeLoans.length === 0 && <p style={styles.empty}>No active loans. Click "+ Add Loan" to get started.</p>}
        <div style={styles.loanList}>
          {activeLoans.map(loan => {
            const isLender = loan.lenderId === user.uid;
            const overdue = new Date() > new Date(loan.deadline);
            return (
              <div key={loan.id} style={styles.loanCard}>
                <div style={styles.loanTop}>
                  <span style={{ ...styles.badge, background: isLender ? "#166534" : "#7f1d1d" }}>
                    {isLender ? "LENT" : "BORROWED"}
                  </span>
                  <span style={{ ...styles.badge, background: overdue ? "#7f1d1d" : loan.status === "late" ? "#92400e" : "#1e3a5f" }}>
                    {loan.status === "late" ? "LATE" : overdue ? "OVERDUE" : "ACTIVE"}
                  </span>
                </div>
                <div style={styles.loanAmount}>₹{loan.amount.toLocaleString()}</div>
                <div style={styles.loanInfo}>
                  <span>{isLender ? `To: ${loan.borrowerName}` : `From: ${loan.lenderName}`}</span>
                  <span>Due: {new Date(loan.deadline).toLocaleDateString()}</span>
                </div>
                {loan.note && <p style={styles.loanNote}>"{loan.note}"</p>}
                <div style={styles.loanInfo}>
                  <span>Repayment: {loan.repaymentType}</span>
                  {loan.interest > 0 && <span>Interest: {loan.interest}%</span>}
                </div>
                {isLender && loan.status === "active" && (
                  <div style={styles.actionRow}>
                    <button style={styles.paidBtn} onClick={() => markRepaid(loan)}>✓ Mark Repaid</button>
                    <button style={styles.lateBtn} onClick={() => markLate(loan)}>✗ Mark Late</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Paid Loans */}
        {loans.filter(l => l.status === "paid").length > 0 && (
          <>
            <h2 style={styles.sectionTitle}>Completed Loans</h2>
            <div style={styles.loanList}>
              {loans.filter(l => l.status === "paid").map(loan => (
                <div key={loan.id} style={{ ...styles.loanCard, opacity: 0.6 }}>
                  <div style={styles.loanTop}>
                    <span style={{ ...styles.badge, background: "#166534" }}>PAID ✓</span>
                  </div>
                  <div style={styles.loanAmount}>₹{loan.amount.toLocaleString()}</div>
                  <div style={styles.loanInfo}>
                    <span>{loan.lenderId === user.uid ? `To: ${loan.borrowerName}` : `From: ${loan.lenderName}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  bg: { minHeight: "100vh", background: "#0d0d1a", fontFamily: "'Segoe UI', sans-serif", color: "#fff" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  navLogo: { fontSize: 20, fontWeight: 800, color: "#a78bfa" },
  navRight: { display: "flex", alignItems: "center", gap: 12 },
  navName: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
  navBtn: { padding: "8px 18px", background: "#6c63ff", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 },
  navLogout: { padding: "8px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 13 },
  container: { maxWidth: 900, margin: "0 auto", padding: "32px 20px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 36 },
  statCard: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px" },
  statLabel: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" },
  statValue: { fontSize: 32, fontWeight: 800, margin: "0 0 4px" },
  statSub: { fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 },
  sectionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: "rgba(255,255,255,0.8)" },
  empty: { color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "40px 0", fontSize: 15 },
  loanList: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 36 },
  loanCard: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 },
  loanTop: { display: "flex", gap: 8, marginBottom: 12 },
  badge: { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.5 },
  loanAmount: { fontSize: 28, fontWeight: 800, marginBottom: 10, color: "#fff" },
  loanInfo: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6 },
  loanNote: { fontSize: 13, color: "rgba(255,255,255,0.4)", fontStyle: "italic", borderLeft: "2px solid #6c63ff", paddingLeft: 10, margin: "10px 0" },
  actionRow: { display: "flex", gap: 8, marginTop: 14 },
  paidBtn: { flex: 1, padding: "9px", background: "#166534", border: "none", borderRadius: 10, color: "#4ade80", fontWeight: 700, cursor: "pointer", fontSize: 13 },
  lateBtn: { flex: 1, padding: "9px", background: "#7f1d1d", border: "none", borderRadius: 10, color: "#f87171", fontWeight: 700, cursor: "pointer", fontSize: 13 },
};
