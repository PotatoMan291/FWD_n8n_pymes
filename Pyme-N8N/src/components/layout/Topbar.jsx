import { useLocation } from "react-router-dom";
import { Menu, Search, Bell, CircleUserRound } from "lucide-react";

const pageTitles = {
  "/": ["Panel principal", "Aquí tienes el resumen de tu gestión financiera."],
  "/facturas": ["Facturas", "Consulta y administra tus documentos."],
  "/proveedores": [
    "Proveedores",
    "Gestiona la información de tus proveedores.",
  ],
  "/asistente": [
    "Asistente IA",
    "Gestiona facturas mediante lenguaje natural.",
  ],
};

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const [title, subtitle] = pageTitles[pathname] || pageTitles["/"];

  return (
    <header className="topbar">
      <button
        className="icon-button menu-toggle"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      <div className="topbar-heading">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="topbar-actions">
        <div className="environment-chip">
          <span /> Entorno local
        </div>
        <button
          className="icon-button topbar-search"
          aria-label="Ir a facturas"
          onClick={() => window.location.assign("/facturas")}
        >
          <Search size={19} />
        </button>
        <button className="icon-button" aria-label="Notificaciones">
          <Bell size={19} />
        </button>
        <div className="user-avatar">
          <CircleUserRound size={23} />
        </div>
      </div>
    </header>
  );
}
