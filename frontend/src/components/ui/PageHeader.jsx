export default function PageHeader({ children }) {
  if (!children) {
    return null;
  }

  return <section className="page-header-compact">{children}</section>;
}
