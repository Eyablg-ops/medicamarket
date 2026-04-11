// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import HomePage          from "./pages/HomePage";
import Login             from "./pages/Login";
import Register          from "./pages/Register";
import Dashboard         from "./pages/Dashboard";
import DashboardClinique from "./pages/DashboardClinique";
import DashboardAdmin    from "./pages/DashboardAdmin";
import Profile           from "./pages/Profile";

// Redirige vers le bon dashboard selon le rôle
function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)                    return <Navigate to="/login" replace />;
  if (user.role === 'admin')    return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'clinique') return <Navigate to="/clinique/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

// Protège une route selon le rôle exact
function RequireRole({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)              return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Page d'accueil publique ── */}
          <Route path="/"        element={<HomePage />} />

          {/* ── Auth ── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Dashboard client ── */}
          <Route path="/dashboard" element={
            <RequireRole role="client">
              <Dashboard />
            </RequireRole>
          } />

          {/* ── Dashboard clinique ── */}
          <Route path="/clinique/dashboard" element={
            <RequireRole role="clinique">
              <DashboardClinique />
            </RequireRole>
          } />

          {/* ── Dashboard admin ── */}
          <Route path="/admin/dashboard" element={
            <RequireRole role="admin">
              <DashboardAdmin />
            </RequireRole>
          } />

          {/* ── Profil — accessible à tous les rôles connectés ── */}
          <Route path="/profile" element={<Profile />} />

          {/* ── Redirection automatique selon rôle ── */}
          <Route path="/me" element={<RoleRedirect />} />

          {/* ── Toute autre URL → accueil ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;