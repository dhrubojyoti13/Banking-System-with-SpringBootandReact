import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormMessage from "../components/FormMessage";

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [createdAccount, setCreatedAccount] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (!/^\d{4,6}$/.test(pin)) { setError("PIN must contain 4 to 6 digits."); return; }
    if (pin !== confirmPin) { setError("PINs do not match."); return; }
    setLoading(true);
    try {
      const response = await register({ fullName: fullName.trim(), pin });
      setCreatedAccount(response.accountNumber);
      navigate("/", { state: { newAccountNumber: response.accountNumber } });
    } catch (err: any) { setError(err.response?.data?.message || "Registration failed. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-decoration"><div className="brand light"><span className="brand-mark">B</span>BankFlow</div><div className="auth-promo"><span className="eyebrow">GET STARTED</span><h1>A smarter way<br/>to bank.</h1><p>Open your account and manage your money with confidence.</p></div><span className="auth-footnote">Your banking journey starts here</span></div>
      <div className="auth-panel"><form className="auth-form" onSubmit={submit}>
        <span className="eyebrow">NEW CUSTOMER</span><h2>Create your account</h2><p className="muted">Fill in your details to get started.</p>
        <FormMessage message={error}/>
        {createdAccount && <FormMessage type="success" message={`Account created: ${createdAccount}`}/>}
        <label>Full name<input value={fullName} onChange={e=>setFullName(e.target.value)} required minLength={2} placeholder="Your full name"/></label>
        <label>Create PIN<input value={pin} onChange={e=>setPin(e.target.value)} required type="password" inputMode="numeric" maxLength={6} placeholder="4–6 digit PIN"/></label>
        <label>Confirm PIN<input value={confirmPin} onChange={e=>setConfirmPin(e.target.value)} required type="password" inputMode="numeric" maxLength={6} placeholder="Re-enter your PIN"/></label>
        <button className="button button-primary full-width" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
        <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
      </form></div>
    </div>
  );
}