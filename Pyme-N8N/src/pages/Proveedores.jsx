import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Users,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building2,
} from "lucide-react";
import Swal from "sweetalert2";
import Modal from "../components/ui/Modal";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
} from "../services/providerService";
import { getInvoices } from "../services/invoiceService";

const emptyForm = { nombre: "", identificacion: "", correo: "", telefono: "" };

export default function Proveedores() {
  const [providers, setProviders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [providerData, invoiceData] = await Promise.all([
        getProviders(),
        getInvoices(),
      ]);
      setProviders(providerData);
      setInvoices(invoiceData);
    } catch {
      setError("No se pudo cargar la información. Verifica JSON Server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = providers.filter((provider) =>
    [provider.nombre, provider.identificacion, provider.correo].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function startEdit(provider) {
    setEditing(provider);
    setForm({
      nombre: provider.nombre || "",
      identificacion: provider.identificacion || "",
      correo: provider.correo || "",
      telefono: provider.telefono || "",
    });
    setOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.nombre.trim() || !form.identificacion.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "El nombre y la identificación son obligatorios.",
      });
      return;
    }

    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      Swal.fire({
        icon: "warning",
        title: "Correo inválido",
        text: "Comprueba la dirección de correo.",
      });
      return;
    }

    const duplicate = providers.some(
      (provider) =>
        provider.identificacion.trim().toLowerCase() ===
          form.identificacion.trim().toLowerCase() &&
        String(provider.id) !== String(editing?.id),
    );

    if (duplicate) {
      Swal.fire({
        icon: "warning",
        title: "Identificación duplicada",
        text: "Ya existe un proveedor con esa identificación.",
      });
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateProvider(editing.id, {
          nombre: form.nombre.trim(),
          identificacion: form.identificacion.trim(),
          correo: form.correo.trim(),
          telefono: form.telefono.trim(),
        });
      } else {
        await createProvider({
          nombre: form.nombre.trim(),
          identificacion: form.identificacion.trim(),
          correo: form.correo.trim(),
          telefono: form.telefono.trim(),
        });
      }

      setOpen(false);
      await loadData();
      Swal.fire({
        icon: "success",
        title: editing ? "Proveedor actualizado" : "Proveedor registrado",
        timer: 1500,
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

  async function handleDelete(provider) {
    const related = invoices.filter(
      (invoice) => String(invoice.proveedorId) === String(provider.id),
    );

    if (related.length) {
      Swal.fire({
        icon: "info",
        title: "No se puede eliminar",
        text: `Este proveedor tiene ${related.length} factura(s) asociada(s). Primero debes reasignarlas o eliminarlas.`,
      });
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar proveedor?",
      text: provider.nombre,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#a83e38",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProvider(provider.id);
      await loadData();
      Swal.fire({
        icon: "success",
        title: "Proveedor eliminado",
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
        <div className="page-intro-icon gold">
          <Users size={23} />
        </div>
        <div>
          <span className="eyebrow">DIRECTORIO COMERCIAL</span>
          <h2>Gestión de proveedores</h2>
          <p>Administra tus contactos y su información.</p>
        </div>
        <button
          className="button button-primary page-intro-action"
          onClick={startCreate}
        >
          <Plus size={18} /> Nuevo proveedor
        </button>
      </section>

      <section className="panel list-panel">
        <div className="list-toolbar">
          <div className="search-field">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, identificación o correo..."
              aria-label="Buscar proveedores"
            />
          </div>
          <span className="results-count">
            {loading ? "Cargando…" : `${filtered.length} proveedor(es)`}
          </span>
        </div>

        {error ? (
          <div className="error-banner">
            {error}
            <button
              className="button button-secondary button-small"
              onClick={loadData}
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <div className="loading-state">Cargando proveedores…</div>
        ) : !filtered.length ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={26} />
            </div>
            <h3>No hay proveedores</h3>
            <p>Registra un proveedor para comenzar.</p>
          </div>
        ) : (
          <div className="provider-grid">
            {filtered.map((provider) => {
              const count = invoices.filter(
                (invoice) =>
                  String(invoice.proveedorId) === String(provider.id),
              ).length;
              return (
                <article className="provider-card" key={provider.id}>
                  <div className="provider-card-top">
                    <div className="provider-avatar">
                      <Building2 size={23} />
                    </div>
                    <div className="provider-actions">
                      <button
                        className="table-action"
                        onClick={() => startEdit(provider)}
                        aria-label="Editar proveedor"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="table-action action-danger"
                        onClick={() => handleDelete(provider)}
                        aria-label="Eliminar proveedor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3>{provider.nombre}</h3>
                  <p className="provider-id">ID: {provider.identificacion}</p>
                  <div className="provider-contact">
                    <Mail size={15} />
                    <span>{provider.correo || "Sin correo registrado"}</span>
                  </div>
                  <div className="provider-contact">
                    <Phone size={15} />
                    <span>
                      {provider.telefono || "Sin teléfono registrado"}
                    </span>
                  </div>
                  <div className="provider-card-footer">
                    <span>Facturas asociadas</span>
                    <strong>{count}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar proveedor" : "Nuevo proveedor"}
      >
        <form className="form-body" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field form-field-full">
              <span>Nombre o razón social *</span>
              <input
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre del proveedor"
              />
            </label>
            <label className="form-field form-field-full">
              <span>Identificación *</span>
              <input
                required
                value={form.identificacion}
                onChange={(e) =>
                  setForm({ ...form, identificacion: e.target.value })
                }
                placeholder="Cédula física o jurídica"
              />
            </label>
            <label className="form-field form-field-full">
              <span>Correo electrónico</span>
              <input
                type="email"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                placeholder="contacto@ejemplo.com"
              />
            </label>
            <label className="form-field form-field-full">
              <span>Teléfono</span>
              <input
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="2222-2222"
              />
            </label>
          </div>
          <div className="form-footer">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setOpen(false)}
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
                  : "Registrar proveedor"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
