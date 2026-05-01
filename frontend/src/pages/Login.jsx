import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    // Un seul appel — login() retourne res.data qui contient access/refresh
    await login(email, password);
    // Lire le rôle depuis le user du contexte APRÈS fetchProfile
    // On utilise une autre approche : lire le token décodé
    const token = localStorage.getItem('access_token');
    const { jwtDecode } = await import('jwt-decode');
    const decoded = jwtDecode(token);

    // Récupérer le profil pour avoir le rôle
    const profileRes = await import('../api/axios').then(m => m.default.get('/profile/'));
    const role = profileRes.data.role;

    if (role === 'admin')         navigate('/admin/dashboard');
    else if (role === 'clinique') navigate('/clinique/dashboard');
    else                          navigate('/dashboard');

  } catch (err) {
    setError(err.response?.data?.detail || 'Email ou mot de passe incorrect');
  } finally {
    setLoading(false);
  }
};

  return (
      <>
    <Navbar />

    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-emerald-700 mb-6">
          Connexion — MedicaMarket
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Pas de compte ?{' '}
          <Link to="/register" className="text-emerald-600 hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
</>
  );
}
