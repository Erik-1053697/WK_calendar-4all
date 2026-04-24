export default function EmptyState({ title, message, children }) {
  return (
    <section className="empty-card">
      <h3>{title}</h3>
      <p>{message}</p>
      {children}
    </section>
  );
}
