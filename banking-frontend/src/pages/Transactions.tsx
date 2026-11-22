import { useEffect, useState } from "react";
import api from "../services/api";
import type { BankTransaction } from "../types";
import FormMessage from "../components/FormMessage";

export default function Transactions() {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<BankTransaction[]>("/api/transactions/history")
      .then(response => setTransactions(response.data))
      .catch(err => setError(err.response?.data?.message || "Could not load transaction history. Check that the history endpoint exists."))
      .finally(() => setLoading(false));
  }, []);

  return <section><div className="page-heading"><div><span className="eyebrow">ACCOUNT ACTIVITY</span><h1>Transactions</h1><p className="muted">Review deposits, withdrawals, and transfers.</p></div></div><FormMessage message={error}/><div className="panel table-panel">{loading ? <p className="muted">Loading transactions...</p> : transactions.length === 0 ? <div className="empty-state"><span>↗</span><h3>No transactions yet</h3><p className="muted">Your account activity will appear here.</p></div> : <div className="table-scroll"><table><thead><tr><th>Transaction</th><th>Description</th><th>Date</th><th className="align-right">Amount</th></tr></thead><tbody>{transactions.map((item, index) => <tr key={item.id ?? index}><td><strong>{item.transactionType || "Transaction"}</strong></td><td>{item.description || item.relatedAccount || "—"}</td><td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</td><td className="align-right amount-cell">₹{Number(item.amount).toLocaleString("en-IN", {minimumFractionDigits:2})}</td></tr>)}</tbody></table></div>}</div></section>;
}