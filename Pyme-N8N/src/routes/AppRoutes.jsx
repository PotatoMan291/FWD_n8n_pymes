import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Facturas from "../pages/Facturas";
import Proveedores from "../pages/Proveedores";
import Asistente from "../pages/Asistente";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/facturas" element={<Facturas />} />
      <Route path="/proveedores" element={<Proveedores />} />
      <Route path="/asistente" element={<Asistente />} />
      <Route
        path="*"
        element={
          <main className="not-found">
            <h2>Página no encontrada</h2>
            <a href="/">Volver al panel</a>
          </main>
        }
      />
    </Routes>
  );
}
