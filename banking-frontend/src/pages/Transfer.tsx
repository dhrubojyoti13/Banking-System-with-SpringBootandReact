import { useState, type FormEvent } from "react";
import api from "../services/api";
import FormMessage from "../components/FormMessage";

export default function Transfer() {
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setMessage(""); setError("");
    const value = Number(amount);
    if (!toAccountNumber.trim()) { setError("Enter the recipient account number."); return; }
    if (!Number.isFinite(value) || value <= 0) { setError("Enter an amount greater than zero."); return; }
    setLoading(true);
    try {
      await api.post("/api/accounts/transfer", { toAccountNumber: toAccountNumber.trim(), amount: value });
      setMessage(`₹${value.toFixed(2)} transferred successfully.`);
      setToAccountNumber(""); setAmount("");
    } catch (err: any) { setError(err.response?.data?.message || "Transfer failed. Confirm the recipient and backend endpoint."); }
    finally { setLoading(false); }
  };

  return <section className="narrow-section"><div className="page-heading"><div><span className="eyebrow">SEND MONEY</span><h1>Transfer money</h1><p className="muted">Transfer funds to another BankFlow account.</p></div></div><form className="panel form-panel" onSubmit={submit}><FormMessage message={error}/><FormMessage type="success" message={message}/><label>Recipient account number<input value={toAccountNumber} onChange={e=>setToAccountNumber(e.target.value)} required placeholder="Enter recipient account number"/></label><label>Transfer amount (INR)<div className="amount-input"><span>₹</span><input type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} required placeholder="0.00"/></div></label><p className="form-hint">Check the recipient account number carefully before sending.</p><button className="button button-primary full-width" disabled={loading}>{loading ? "Processing..." : "Confirm transfer"}</button></form></section>;
}