const statuses = {
  pendiente: { label: "Pendiente", className: "status-pending" },
  pagada: { label: "Pagada", className: "status-paid" },
  vencida: { label: "Vencida", className: "status-overdue" },
  borrador: { label: "Borrador", className: "status-draft" },
};

export default function StatusBadge({ status }) {
  const normalized = String(status || "pendiente").toLowerCase();
  const item = statuses[normalized] || statuses.pendiente;

  return (
    <span className={`status-badge ${item.className}`}>
      <span className="status-dot" />
      {item.label}
    </span>
  );
}
