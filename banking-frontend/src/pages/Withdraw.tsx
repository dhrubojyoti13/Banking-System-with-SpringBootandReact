import { useState, type FormEvent } from "react";
import api from "../services/api";
import FormMessage from "../components/FormMessage";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setMessage(""); setError("");
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) { setError("Enter an amount greater than zero."); return; }
    setLoading(true);
    try {
      await api.post("/api/accounts/withdraw", { amount: value });
      setMessage(`₹${value.toFixed(2)} withdrawn successfully.`);
      setAmount("");
    } catch (err: any) { setError(err.response?.data?.message || "Withdrawal failed. Check your balance and backend endpoint."); }
    finally { setLoading(false); }
  };

  return <section className="narrow-section"><div className="page-heading"><div><span className="eyebrow">TAKE OUT FUNDS</span><h1>Withdraw money</h1><p className="muted">Withdraw money from your bank account.</p></div></div><form className="panel form-panel" onSubmit={submit}><FormMessage message={error}/><FormMessage type="success" message={message}/><label>Withdrawal amount (INR)<div className="amount-input"><span>₹</span><input type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} required placeholder="0.00"/></div></label><p className="form-hint">You cannot withdraw more than your available balance.</p><button className="button button-primary full-width" disabled={loading}>{loading ? "Processing..." : "Confirm withdrawal"}</button></form></section>;
}