// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'clinique'
        ? '/clinique/dashboard'
        : '/dashboard';

  return (
    <nav className="bg-emerald-700 px-8 py-4 flex items-center justify-between shadow-md">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 text-white font-bold text-xl no-underline"
      >
        <span className="text-2xl">🏥</span>
        <span>MedicaMarket</span>
      </Link>

      {/* Liens centraux */}
      <div className="hidden md:flex items-center gap-6">
        {!user && (
          <Link
            to="/"
            className="text-emerald-100 hover:text-white text-sm transition"
          >
            Accueil
          </Link>
        )}

        <Link
          to="/shop"
          className="text-emerald-100 hover:text-white text-sm transition"
        >
          🛍️ Boutique
        </Link>
      </div>

      {/* Actions à droite */}
      <div className="flex items-center gap-3">
        {/* Badge Panier */}
        <Link to="/cart" className="relative text-white">
          <span className="text-2xl">🛒</span>

          {cart?.item_count > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {cart.item_count}
            </span>
          )}
        </Link>

        {user ? (
          <>
            <span className="text-emerald-100 text-sm hidden md:block">
              Bonjour, <strong className="text-white">{user.first_name}</strong>
            </span>

            {/* Dashboard selon rôle */}
            <Link
              to={dashboardPath}
              className="text-white text-sm bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-500 transition font-medium"
            >
              🏠 Dashboard
            </Link>

            {/* Liens spécifiques ADMIN */}
            {user.role === 'admin' && (
              <>
                <Link
                  to="/admin/products"
                  className="text-white text-sm bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-500 transition font-medium"
                >
                  💊 Produits
                </Link>

                <Link
                  to="/admin/categories"
                  className="text-white text-sm bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-500 transition font-medium"
                >
                  🗂️ Catégories
                </Link>
              </>
            )}

            {/* Commandes pour admin, clinique et client */}
            <Link
              to="/orders"
              className="text-white text-sm bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-500 transition font-medium"
            >
              📦 Commandes
            </Link>

            <Link
              to="/profile"
              className="text-white text-sm bg-transparent border border-emerald-400 px-4 py-2 rounded-lg hover:bg-emerald-600 transition font-medium"
            >
              👤 Mon profil
            </Link>

            <button
              onClick={handleLogout}
              className="text-white text-sm bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-white text-sm border border-emerald-400 px-4 py-2 rounded-lg hover:bg-emerald-600 transition font-medium"
            >
              Se connecter
            </Link>

            <Link
              to="/register"
              className="text-white text-sm bg-emerald-500 px-4 py-2 rounded-lg hover:bg-emerald-400 transition font-medium"
            >
              S'inscrire
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}