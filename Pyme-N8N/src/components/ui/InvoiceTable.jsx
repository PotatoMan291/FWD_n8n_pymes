import { Eye, Pencil, Trash2, FileText } from "lucide-react";
import StatusBadge from "./StatusBadge";

export function formatCRC(value) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export default function InvoiceTable({
  invoices = [],
  providers = [],
  onView,
  onEdit,
  onDelete,
  compact = false,
}) {
  const getProvider = (id) =>
    providers.find((provider) => String(provider.id) === String(id));

  if (!invoices.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <FileText size={26} />
        </div>
        <h3>No hay facturas para mostrar</h3>
        <p>Cuando registres una factura, aparecerá en esta tabla.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Factura</th>
            <th>Proveedor</th>
            {!compact && <th>Emisión</th>}
            <th>Total</th>
            <th>Estado</th>
            {!compact && <th className="actions-heading">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
            const provider = getProvider(invoice.proveedorId);

            return (
              <tr key={invoice.id}>
                <td>
                  <div className="invoice-reference">
                    <div className="invoice-file-icon">
                      <FileText size={17} />
                    </div>
                    <div>
                      <strong>{invoice.numero || invoice.id}</strong>
                      <span>{invoice.descripcion || "Sin descripción"}</span>
                    </div>
                  </div>
                </td>
                <td>{provider?.nombre || "Proveedor desconocido"}</td>
                {!compact && <td>{invoice.fechaEmision || "—"}</td>}
                <td className="amount-cell">{formatCRC(invoice.total)}</td>
                <td>
                  <StatusBadge status={invoice.estado} />
                </td>
                {!compact && (
                  <td>
                    <div className="table-actions">
                      {onView && (
                        <button
                          className="table-action"
                          onClick={() => onView(invoice)}
                          title="Ver detalles"
                          aria-label="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          className="table-action"
                          onClick={() => onEdit(invoice)}
                          title="Editar factura"
                          aria-label="Editar factura"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="table-action action-danger"
                          onClick={() => onDelete(invoice)}
                          title="Eliminar factura"
                          aria-label="Eliminar factura"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
