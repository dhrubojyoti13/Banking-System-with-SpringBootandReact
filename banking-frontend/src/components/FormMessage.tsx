export default function FormMessage({ message, type = "error" }: { message: string; type?: "error" | "success" }) {
  if (!message) return null;
  return <div className={`form-message ${type}`} role="status">{message}</div>;
}