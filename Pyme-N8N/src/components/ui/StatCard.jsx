export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "green",
}) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span>{title}</span>
        <div className={`stat-icon stat-icon-${tone}`}>
          <Icon size={20} strokeWidth={1.8} />
        </div>
      </div>
      <strong className="stat-value">{value}</strong>
      <p className="stat-description">{description}</p>
    </article>
  );
}
