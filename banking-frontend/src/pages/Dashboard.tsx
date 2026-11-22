import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { AccountBalance } from "../types";
import FormMessage from "../components/FormMessage";

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [account, setAccount] = useState<AccountBalance | null>(null);
  const [error, setError] = useState("");
  const newAccountNumber = (location.state as { newAccountNumber?: string } | null)?.newAccountNumber;

  useEffect(() => {
    api.get<AccountBalance>("/api/accounts/balance")
      .then(response => setAccount(response.data))
      .catch(err => setError(err.response?.data?.message || "Could not load your account balance."));
  }, []);

  return (
    <section>
      <div className="page-heading"><div><span className="eyebrow">OVERVIEW</span><h1>Dashboard</h1><p className="muted">Here is a summary of your account.</p></div></div>
      {newAccountNumber && <FormMessage type="success" message={`Your account was created successfully. Account number: ${newAccountNumber}`}/>}
      <FormMessage message={error}/>
      <div className="balance-card"><div><span className="balance-label">AVAILABLE BALANCE</span><h2>{account ? `₹${Number(account.balance).toLocaleString("en-IN", {minimumFractionDigits:2})}` : "Loading..."}</h2><span className="balance-account">Account •••• {account?.accountNumber?.slice(-4) || "----"}</span></div><div className="balance-symbol">₹</div></div>
      <div className="section-title"><h2>Quick actions</h2><span className="muted">Manage your money</span></div>
      <div className="action-grid">
        <Link className="action-card" to="/deposit"><span className="action-icon green">↓</span><strong>Deposit money</strong><small>Add funds to your account</small></Link>
        <Link className="action-card" to="/withdraw"><span className="action-icon orange">↑</span><strong>Withdraw money</strong><small>Take out available funds</small></Link>
        <Link className="action-card" to="/transfer"><span className="action-icon blue">⇄</span><strong>Transfer money</strong><small>Send money to another account</small></Link>
        <Link className="action-card" to="/transactions"><span className="action-icon purple">↗</span><strong>Transactions</strong><small>Review your activity</small></Link>
      </div>
    </section>
  );
}