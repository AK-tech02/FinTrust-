import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AddLoan() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: "lent", // lent or borrowed
    borrowerName: "",
    borrowerEmail: "",
    amount: "",
    deadline: "",
    repaymentType: "lumpsum",
    interest: 0,
    note: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || !form.deadline || !form.borrowerName) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      const loanData = {
        lenderId: form.type === "lent" ? user.uid : "external",
        lenderName: form.type === "lent" ? user.displayName : form.borrowerName,
        borrowerId: form.type === "borrowed" ? user.uid : "external",
        borrowerName: form.type === "borrowed" ? user.displayName : form.borrowerName,
        amount: parseFloat(form.amount),
        deadline: form.deadline,
        repaymentType: form.repaymentType,
        interest: parseFloat(form.interest) || 0,
        note: form.note,
        status: "active",
        involvedUsers: [user.uid],
        createdAt: new Date().toISOString(),
        createdBy: user.uid
      };
      await addDoc(collection(db, "loans"), loanData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <button style={styles.back} onClick={() => navigate("/dashboard")}>← Back</button>
        <h2 style={styles.title}>Record a Loan</h2>

        {/* Type Toggle */}
        <div style={styles.toggleRow}>
          <button
            style={form.type === "lent" ? styles.toggleActive : styles.toggle}
            onClick={() => setForm({ ...form, type: "lent" })}
          >
            💸 I Lent Money
          </button>
          <button
            style={form.type === "borrowed" ? styles.toggleActive : styles.toggle}
            onClick={() => setForm({ ...form, type: "borrowed" })}
          >
            🤝 I Borrowed Money
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            {form.type === "lent" ? "Borrower's Name *" : "Lender's Name *"}
          </label>
          <input style={styles.input} name="borrowerName" placeholder="Friend/Family name" value={form.borrowerName} onChange={handleChange} required />

          <label style={styles.label}>Amount (₹) *</label>
          <input style={styles.input} name="amount" type="number" placeholder="e.g. 500" value={form.amount} onChange={handleChange} required />

          <label style={styles.label}>Repayment Deadline *</label>
          <input style={styles.input} name="deadline" type="date" value={form.deadline} onChange={handleChange} required />

          <label style={styles.label}>Repayment Type</label>
          <select style={styles.input} name="repaymentType" value={form.repaymentType} onChange={handleChange}>
            <option value="lumpsum">Lumpsum</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly (EMI)</option>
            <option value="flexible">Flexible</option>
          </select>

          <label style={styles.label}>Interest % (optional, 0 = none)</label>
          <input style={styles.input} name="interest" type="number" placeholder="0" value={form.interest} onChange={handleChange} />

          <label style={styles.label}>Note (optional)</label>
          <input style={styles.input} name="note" placeholder="e.g. For rent, medical emergency..." value={form.note} onChange={handleChange} />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Saving..." : "Record Loan"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  bg: { minHeight: "100vh", background: "#0d0d1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", padding: 20 },
  card: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 480 },
  back: { background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14, padding: 0, marginBottom: 20 },
  title: { color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 24, marginTop: 0 },
  toggleRow: { display: "flex", gap: 10, marginBottom: 24 },
  toggle: { flex: 1, padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontWeight: 600, fontSize: 14 },
  toggleActive: { flex: 1, padding: "12px", background: "#6c63ff", border: "1px solid #6c63ff", borderRadius: 12, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 },
  form: { display: "flex", flexDirection: "column", gap: 8 },
  label: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 14, outline: "none", marginBottom: 8 },
  btn: { marginTop: 8, padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #6c63ff, #a855f7)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  error: { color: "#f87171", fontSize: 13, margin: 0 }
};
