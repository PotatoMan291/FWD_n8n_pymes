import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Bot,
  Leaf,
  ChevronLeft,
} from "lucide-react";

const links = [
  { to: "/", label: "Panel principal", icon: LayoutDashboard, end: true },
  { to: "/facturas", label: "Facturas", icon: FileText },
  { to: "/proveedores", label: "Proveedores", icon: Users },
  { to: "/asistente", label: "Asistente IA", icon: Bot },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Cerrar menú"
        />
      )}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Leaf size={23} />
          </div>
          <div>
            <h2>FacturaBot</h2>
            <span>GESTIÓN INTELIGENTE</span>
          </div>
          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <p className="nav-caption">MENÚ PRINCIPAL</p>
        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Asistente IA" && <span className="nav-ai-dot" />}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="demo-card">
            <div className="demo-icon">
              <Bot size={20} />
            </div>
            <strong>Modo académico</strong>
            <p>Entorno local de demostración.</p>
            <span className="connection-indicator">
              <span /> Front-end activo
            </span>
          </div>
          <p className="sidebar-version">FacturaBot · v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
