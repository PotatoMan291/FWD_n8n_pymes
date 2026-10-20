import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock3,
  CircleCheck,
  Wallet,
  ArrowUpRight,
  Plus,
  Bot,
  ArrowRight,
} from "lucide-react";
import Swal from "sweetalert2";
import StatCard from "../components/ui/StatCard";
import InvoiceTable, { formatCRC } from "../components/ui/InvoiceTable";
import { getInvoices } from "../services/invoiceService";
import { getProviders } from "../services/providerService";

export default function Dashboard() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
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
        "No se pudo conectar con JSON Server. Comprueba que esté ejecutándose en el puerto 3001.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const pending = invoices.filter((item) => item.estado === "pendiente");
  const paid = invoices.filter((item) => item.estado === "pagada");
  const overdue = invoices.filter((item) => {
    return (
      item.estado !== "pagada" &&
      item.fechaVencimiento &&
      item.fechaVencimiento < new Date().toISOString().slice(0, 10)
    );
  });
  const totalPending = pending.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0,
  );
  const totalPaid = paid.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0,
  );

  return (
    <div className="page-content">
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="welcome-label">
            <span /> TU ESPACIO FINANCIERO
          </span>
          <h2>
            Todo en orden,
            <br />
            <em>todo bajo control.</em>
          </h2>
          <p>Administra tus facturas y proveedores desde un solo lugar.</p>
          <div className="welcome-actions">
            <button
              className="button button-light"
              onClick={() => navigate("/facturas")}
            >
              <Plus size={17} /> Nueva factura
            </button>
            <button
              className="button button-outline-light"
              onClick={() => navigate("/asistente")}
            >
              <Bot size={17} /> Hablar con el asistente
            </button>
          </div>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-document">
            <div className="art-document-mark">
              <FileText size={29} />
            </div>
            <span className="art-line line-long" />
            <span className="art-line" />
            <span className="art-line line-short" />
            <div className="art-total">
              <span>Total registrado</span>
              <strong>₡</strong>
            </div>
          </div>
          <div className="art-sparkle sparkle-one">✦</div>
          <div className="art-sparkle sparkle-two">✧</div>
        </div>
      </section>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button
            className="button button-secondary button-small"
            onClick={loadDashboard}
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="section-heading">
        <div>
          <span className="eyebrow">VISTA GENERAL</span>
          <h2>Resumen financiero</h2>
        </div>
        <span className="updated-label">Datos de tu entorno local</span>
      </div>

      <section className="stats-grid">
        <StatCard
          title="Total de facturas"
          value={loading ? "…" : invoices.length}
          description="Documentos registrados"
          icon={FileText}
        />
        <StatCard
          title="Pendientes de pago"
          value={loading ? "…" : pending.length}
          description={loading ? "Cargando datos" : formatCRC(totalPending)}
          icon={Clock3}
          tone="gold"
        />
        <StatCard
          title="Facturas pagadas"
          value={loading ? "…" : paid.length}
          description={loading ? "Cargando datos" : formatCRC(totalPaid)}
          icon={CircleCheck}
          tone="blue"
        />
        <StatCard
          title="Proveedores"
          value={loading ? "…" : providers.length}
          description="Registrados en el sistema"
          icon={Wallet}
          tone="purple"
        />
      </section>

      <section className="dashboard-grid">
        <article className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">MOVIMIENTOS</span>
              <h2>Facturas recientes</h2>
            </div>
            <button
              className="text-button"
              onClick={() => navigate("/facturas")}
            >
              Ver todas <ArrowUpRight size={16} />
            </button>
          </div>
          {loading ? (
            <div className="loading-state">Cargando facturas…</div>
          ) : error ? (
            <div className="loading-state">Los datos no están disponibles.</div>
          ) : (
            <InvoiceTable
              invoices={[...invoices].slice(-5).reverse()}
              providers={providers}
              compact
            />
          )}
        </article>

        <aside className="side-panels">
          <article className="attention-card">
            <div className="attention-icon">
              <Clock3 size={21} />
            </div>
            <span className="eyebrow">REQUIEREN ATENCIÓN</span>
            <strong className="attention-number">
              {loading ? "…" : overdue.length}
            </strong>
            <h3>Facturas vencidas</h3>
            <p>Facturas sin pagar que superaron su fecha de vencimiento.</p>
            <button
              className="text-button"
              onClick={() => navigate("/facturas")}
            >
              Revisar facturas <ArrowRight size={16} />
            </button>
          </article>

          <article className="assistant-card">
            <div className="assistant-card-icon">
              <Bot size={22} />
            </div>
            <span className="eyebrow">PRÓXIMAMENTE</span>
            <h3>Tu asistente inteligente</h3>
            <p>Preparamos la conexión con Groq y los workflows de n8n.</p>
            <button
              className="button button-primary button-small"
              onClick={() => navigate("/asistente")}
            >
              Abrir asistente <ArrowRight size={16} />
            </button>
          </article>
        </aside>
      </section>

      <section className="quick-actions">
        <div>
          <span className="eyebrow">ACCESOS RÁPIDOS</span>
          <h2>¿Qué necesitas hacer?</h2>
        </div>
        <button className="quick-action" onClick={() => navigate("/facturas")}>
          <span className="quick-action-icon">
            <FileText size={20} />
          </span>
          <span>
            <strong>Gestionar facturas</strong>
            <small>Crear, consultar y editar</small>
          </span>
          <ArrowRight size={17} />
        </button>
        <button
          className="quick-action"
          onClick={() => navigate("/proveedores")}
        >
          <span className="quick-action-icon gold">
            <Wallet size={20} />
          </span>
          <span>
            <strong>Ver proveedores</strong>
            <small>Consultar tus contactos</small>
          </span>
          <ArrowRight size={17} />
        </button>
        <button className="quick-action" onClick={() => navigate("/asistente")}>
          <span className="quick-action-icon purple">
            <Bot size={20} />
          </span>
          <span>
            <strong>Probar el asistente</strong>
            <small>Interfaz de conversación</small>
          </span>
          <ArrowRight size={17} />
        </button>
      </section>
    </div>
  );
}
