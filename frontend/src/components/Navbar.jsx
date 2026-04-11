// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath =
    user?.role === 'admin'    ? '/admin/dashboard'    :
    user?.role === 'clinique' ? '/clinique/dashboard' :
    '/dashboard';

  return (
    <nav className="bg-emerald-700 px-8 py-4 flex items-center justify-between shadow-md">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl no-underline">
        <span className="text-2xl">🏥</span>
        <span>MedicaMarket</span>
      </Link>

      {/* Liens centraux — visibles uniquement si non connecté */}
      {!user && (
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-emerald-100 hover:text-white text-sm transition">
            Accueil
          </Link>
          <a href="#features" className="text-emerald-100 hover:text-white text-sm transition">
            Fonctionnalités
          </a>
        </div>
      )}

      {/* Actions à droite */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Salutation */}
            <span className="text-emerald-100 text-sm hidden md:block">
              Bonjour, <strong className="text-white">{user.first_name}</strong>
            </span>

            <Link
              to={dashboardPath}
              className="text-white text-sm bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-500 transition font-medium"
            >
              🏠 Dashboard
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