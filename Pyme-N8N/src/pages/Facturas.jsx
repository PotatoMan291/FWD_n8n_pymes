import { useCallback, useEffect, useState } from "react";
import { Plus, Search, SlidersHorizontal, FileText, X } from "lucide-react";
import Swal from "sweetalert2";
import Modal from "../components/ui/Modal";
import InvoiceTable, { formatCRC } from "../components/ui/InvoiceTable";
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "../services/invoiceService";
import { getProviders } from "../services/providerService";

const emptyForm = {
  numero: "",
  proveedorId: "",
  descripcion: "",
  subtotal: "",
  impuestos: "",
  fechaEmision: new Date().toISOString().slice(0, 10),
  fechaVencimiento: "",
  estado: "pendiente",
};

export default function Facturas() {
  const [invoices, setInvoices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [invoiceData, providerData] = await Promise.all([
        getInvoices(),
        getProviders(),
      ]);
      setInvoices(invoiceData);
      setProviders(providerData);
    } catch {
      setError(
        "No se pudo cargar la información. Verifica que JSON Server esté activo.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = invoices.filter((invoice) => {
    const provider = providers.find(
      (p) => String(p.id) === String(invoice.proveedorId),
    );
    const term = search.toLowerCase();
    const matchesSearch = [
      invoice.numero,
      invoice.descripcion,
      provider?.nombre,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(term),
    );

    const matchesStatus =
      statusFilter === "todas" ||
      (statusFilter === "vencida"
        ? invoice.estado !== "pagada" &&
          invoice.fechaVencimiento &&
          invoice.fechaVencimiento < new Date().toISOString().slice(0, 10)
        : invoice.estado === statusFilter);

    return matchesSearch && matchesStatus;
  });

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, numero: `F-${Date.now().toString().slice(-6)}` });
    setModalOpen(true);
  }

  function openEdit(invoice) {
    setEditing(invoice);
    setForm({
      ...emptyForm,
      ...invoice,
      subtotal: String(invoice.subtotal ?? ""),
      impuestos: String(invoice.impuestos ?? ""),
    });
    setModalOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const subtotal = Number(form.subtotal);
    const impuestos = Number(form.impuestos);

    if (!form.numero.trim() || !form.proveedorId || !form.descripcion.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Completa el número, proveedor y descripción.",
      });
      return;
    }

    if (
      !Number.isFinite(subtotal) ||
      subtotal < 0 ||
      !Number.isFinite(impuestos) ||
      impuestos < 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Importes inválidos",
        text: "El subtotal y los impuestos deben ser números iguales o mayores que cero.",
      });
      return;
    }

    if (
      form.fechaVencimiento &&
      form.fechaEmision &&
      form.fechaVencimiento < form.fechaEmision
    ) {
      Swal.fire({
        icon: "warning",
        title: "Fechas inválidas",
        text: "El vencimiento no puede ser anterior a la emisión.",
      });
      return;
    }

    const duplicate = invoices.some(
      (invoice) =>
        invoice.numero.trim().toLowerCase() ===
          form.numero.trim().toLowerCase() &&
        String(invoice.id) !== String(editing?.id),
    );

    if (duplicate) {
      Swal.fire({
        icon: "warning",
        title: "Número duplicado",
        text: "Ya existe una factura con ese número.",
      });
      return;
    }

    const payload = {
      numero: form.numero.trim(),
      proveedorId: form.proveedorId,
      descripcion: form.descripcion.trim(),
      subtotal,
      impuestos,
      total: subtotal + impuestos,
      fechaEmision: form.fechaEmision,
      fechaVencimiento: form.fechaVencimiento,
      estado: form.estado,
    };

    setSaving(true);

    try {
      if (editing) {
        await updateInvoice(editing.id, payload);
      } else {
        await createInvoice(payload);
      }

      setModalOpen(false);
      await loadData();

      await Swal.fire({
        icon: "success",
        title: editing ? "Factura actualizada" : "Factura registrada",
        text: "Los cambios se guardaron correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: err.message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(invoice) {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar esta factura?",
      text: `Se eliminará ${invoice.numero}. Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#a83e38",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteInvoice(invoice.id);
      await loadData();
      Swal.fire({
        icon: "success",
        title: "Factura eliminada",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: err.message,
      });
    }
  }

  return (
    <div className="page-content">
      <section className="page-intro">
        <div className="page-intro-icon">
          <FileText size={23} />
        </div>
        <div>
          <span className="eyebrow">DOCUMENTACIÓN FINANCIERA</span>
          <h2>Control de facturas</h2>
          <p>Administra los documentos registrados en tu sistema.</p>
        </div>
        <button
          className="button button-primary page-intro-action"
          onClick={openCreate}
        >
          <Plus size={18} /> Nueva factura
        </button>
      </section>

      <section className="panel list-panel">
        <div className="list-toolbar">
          <div className="search-field">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por número, proveedor o descripción..."
              aria-label="Buscar facturas"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <label className="filter-select">
            <SlidersHorizontal size={16} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="todas">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="pagada">Pagadas</option>
              <option value="vencida">Vencidas</option>
              <option value="borrador">Borradores</option>
            </select>
          </label>
        </div>

        <div className="table-summary">
          <span>
            {loading ? "Cargando..." : `${filtered.length} factura(s)`}
          </span>
          <span>
            {formatCRC(
              filtered.reduce((sum, item) => sum + Number(item.total || 0), 0),
            )}{" "}
            en resultados
          </span>
        </div>

        {error ? (
          <div className="error-banner">
            {error}{" "}
            <button
              className="button button-secondary button-small"
              onClick={loadData}
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <div className="loading-state">Cargando facturas…</div>
        ) : (
          <InvoiceTable
            invoices={filtered}
            providers={providers}
            onView={setViewing}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar factura" : "Registrar factura"}
        size="wide"
      >
        <form className="form-body" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field">
              <span>Número de factura *</span>
              <input
                required
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                placeholder="F-2026-003"
              />
            </label>
            <label className="form-field">
              <span>Proveedor *</span>
              <select
                required
                value={form.proveedorId}
                onChange={(e) =>
                  setForm({ ...form, proveedorId: e.target.value })
                }
              >
                <option value="">Seleccionar proveedor</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field form-field-full">
              <span>Descripción *</span>
              <input
                required
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                placeholder="Descripción de la compra o servicio"
              />
            </label>
            <label className="form-field">
              <span>Subtotal (₡) *</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.subtotal}
                onChange={(e) => setForm({ ...form, subtotal: e.target.value })}
              />
            </label>
            <label className="form-field">
              <span>Impuestos (₡) *</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.impuestos}
                onChange={(e) =>
                  setForm({ ...form, impuestos: e.target.value })
                }
              />
            </label>
            <label className="form-field">
              <span>Fecha de emisión *</span>
              <input
                required
                type="date"
                value={form.fechaEmision}
                onChange={(e) =>
                  setForm({ ...form, fechaEmision: e.target.value })
                }
              />
            </label>
            <label className="form-field">
              <span>Fecha de vencimiento</span>
              <input
                type="date"
                value={form.fechaVencimiento}
                onChange={(e) =>
                  setForm({ ...form, fechaVencimiento: e.target.value })
                }
              />
            </label>
            <label className="form-field">
              <span>Estado</span>
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagada">Pagada</option>
                <option value="borrador">Borrador</option>
              </select>
            </label>
            <div className="total-preview">
              <span>Total calculado</span>
              <strong>
                {formatCRC(
                  Number(form.subtotal || 0) + Number(form.impuestos || 0),
                )}
              </strong>
            </div>
          </div>
          <div className="form-footer">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={saving}
            >
              {saving
                ? "Guardando…"
                : editing
                  ? "Guardar cambios"
                  : "Registrar factura"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Detalle de factura"
      >
        {viewing && (
          <div className="detail-body">
            <div className="detail-highlight">
              <span className="eyebrow">{viewing.numero}</span>
              <strong>{formatCRC(viewing.total)}</strong>
              <p>{viewing.descripcion}</p>
            </div>
            {[
              [
                "Proveedor",
                providers.find(
                  (p) => String(p.id) === String(viewing.proveedorId),
                )?.nombre || "Desconocido",
              ],
              ["Estado", viewing.estado],
              ["Subtotal", formatCRC(viewing.subtotal)],
              ["Impuestos", formatCRC(viewing.impuestos)],
              ["Emisión", viewing.fechaEmision || "—"],
              ["Vencimiento", viewing.fechaVencimiento || "—"],
            ].map(([label, value]) => (
              <div className="detail-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
            <button
              className="button button-primary button-block"
              onClick={() => {
                setViewing(null);
                openEdit(viewing);
              }}
            >
              Editar factura
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
