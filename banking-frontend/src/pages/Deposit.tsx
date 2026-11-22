import { useState, type FormEvent } from "react";
import api from "../services/api";
import FormMessage from "../components/FormMessage";

export default function Deposit() {
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
      await api.post("/api/accounts/deposit", { amount: value });
      setMessage(`₹${value.toFixed(2)} deposited successfully.`);
      setAmount("");
    } catch (err: any) { setError(err.response?.data?.message || "Deposit failed. Confirm that the backend endpoint is available."); }
    finally { setLoading(false); }
  };

  return <section className="narrow-section"><div className="page-heading"><div><span className="eyebrow">ADD FUNDS</span><h1>Deposit money</h1><p className="muted">Add money to your bank account.</p></div></div><form className="panel form-panel" onSubmit={submit}><FormMessage message={error}/><FormMessage type="success" message={message}/><label>Deposit amount (INR)<div className="amount-input"><span>₹</span><input type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} required placeholder="0.00"/></div></label><p className="form-hint">Enter the amount you want to deposit.</p><button className="button button-primary full-width" disabled={loading}>{loading ? "Processing..." : "Confirm deposit"}</button></form></section>;
}