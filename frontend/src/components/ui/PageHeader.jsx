export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <section className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
      </div>
      {children ? <div className="page-header__aside">{children}</div> : null}
    </section>
  );
}
