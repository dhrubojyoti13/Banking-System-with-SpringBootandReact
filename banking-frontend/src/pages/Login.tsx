import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormMessage from "../components/FormMessage";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setLoading(true);
    try { await login({ accountNumber: accountNumber.trim(), pin }); navigate("/"); }
    catch (err: any) { setError(err.response?.data?.message || "Login failed. Check your account number and PIN."); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-decoration"><div className="brand light"><span className="brand-mark">B</span>BankFlow</div><div className="auth-promo"><span className="eyebrow">BANKING, MADE SIMPLE</span><h1>Your money.<br/>Your control.</h1><p>A simple and secure place to manage your everyday banking.</p></div><span className="auth-footnote">Secure access to your banking dashboard</span></div>
      <div className="auth-panel"><form className="auth-form" onSubmit={submit}>
        <span className="eyebrow">WELCOME BACK</span><h2>Sign in to your account</h2><p className="muted">Enter your account details to continue.</p>
        <FormMessage message={error}/>
        <label>Account number<input value={accountNumber} onChange={e=>setAccountNumber(e.target.value)} required autoComplete="username" placeholder="Enter account number"/></label>
        <label>PIN<input value={pin} onChange={e=>setPin(e.target.value)} required type="password" inputMode="numeric" maxLength={6} autoComplete="current-password" placeholder="Enter your PIN"/></label>
        <button className="button button-primary full-width" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        <p className="auth-switch">Don't have an account? <Link to="/register">Create account</Link></p>
      </form></div>
    </div>
  );
}