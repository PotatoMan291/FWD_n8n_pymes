import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import AppRoutes from "./routes/AppRoutes";

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="main-area">
        <Topbar onMenuClick={() => setMenuOpen(true)} />
        <main className="main-content">
          <AppRoutes />
        </main>
        <footer className="app-footer">
          <span>© 2026 FacturaBot</span>
          <span>Proyecto académico · React + Vite + n8n</span>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
