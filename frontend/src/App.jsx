import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ChatbotWidget from "./components/ai/ChatbotWidget";
import HomePage          from "./pages/HomePage";
import Login             from "./pages/Login";
import Register          from "./pages/Register";
import Dashboard         from "./pages/Dashboard";
import DashboardClinique from "./pages/DashboardClinique";
import DashboardAdmin    from "./pages/DashboardAdmin";
import Profile           from "./pages/Profile";

// ── Tes nouvelles pages (à créer juste après) ──
import ShopPage          from "./pages/ShopPage";
import CartPage          from "./pages/CartPage";
import CheckoutPage      from "./pages/CheckoutPage";
import OrdersPage        from "./pages/OrdersPage";
import ProductDetailPage from "./pages/ProductDetailPage";

import ClinicProductsPage    from "./pages/ClinicProductsPage";
import ClinicCategoriesPage  from "./pages/ClinicCategoriesPage";

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)                    return <Navigate to="/login" replace />;
  if (user.role === 'admin')    return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'clinique') return <Navigate to="/clinique/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

function RequireRole({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)              return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
function ChatbotVisibility() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  if (user.role === "admin") {
    return null;
  }

  return <ChatbotWidget />;
}
function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ── Pages publiques ── */}
        <Route path="/"        element={<HomePage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Boutique (publique) ── */}
        <Route path="/shop"    element={<ShopPage />} />

        {/* ── Panier (connecté) ── */}
        <Route path="/cart" element={
          <RequireAuth><CartPage /></RequireAuth>
        } />

        {/* ── Checkout (connecté) ── */}
        <Route path="/checkout" element={
          <RequireAuth><CheckoutPage /></RequireAuth>
        } />

        {/* ── Historique commandes (connecté) ── */}
        <Route path="/orders" element={
          <RequireAuth><OrdersPage /></RequireAuth>
        } />

        {/* ── Dashboard client ── */}
        <Route path="/dashboard" element={
          <RequireRole role="client"><Dashboard /></RequireRole>
        } />

        {/* ── Dashboard clinique ── */}
      <Route path="/clinique/dashboard" element={
  <RequireRole role="clinique">
    <DashboardClinique />
  </RequireRole>
} />

        {/* ── Dashboard admin ── */}
        <Route path="/admin/dashboard" element={
          <RequireRole role="admin"><DashboardAdmin /></RequireRole>
        } />

        {/* ── Profil ── */}
        <Route path="/profile" element={<Profile />} />

        {/* ── Redirect selon rôle ── */}
        <Route path="/me" element={<RoleRedirect />} />

        {/* ── 404 → accueil ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/shop/:slug" element={<ProductDetailPage />} />

        <Route path="/clinique/products" element={
  <RequireRole role="clinique"><ClinicProductsPage /></RequireRole>
} />
<Route path="/clinique/categories" element={
  <RequireRole role="clinique"><ClinicCategoriesPage /></RequireRole>
} />

      </Routes>
    </AuthProvider>
  );
}

export default App;