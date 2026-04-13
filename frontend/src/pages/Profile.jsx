import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Profile() {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  const dashboardPath =
    user?.role === 'clinique' ? '/clinique/dashboard' :
    user?.role === 'admin'    ? '/admin/dashboard'    :
    '/dashboard';

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.patch('/profile/', {
        first_name: formData.first_name,
        last_name:  formData.last_name,
        phone:      formData.phone,
      });
      setMessage('✅ Profil mis à jour avec succès !');
    } catch {
      setMessage('❌ Erreur lors de la mise à jour.');
    }
  };

  const handleExportData = async () => {
    try {
      const res = await API.get('/gdpr/export/');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mes_donnees.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Impossible d'exporter les données.");
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt('Entrez votre mot de passe pour confirmer la suppression :');
    if (!password) return;
    try {
      await API.delete('/gdpr/delete/', { data: { password } });
      logout();
      navigate('/login');
    } catch {
      alert('Mot de passe incorrect ou erreur serveur.');
    }
  };

  if (!user) return null;

  const isClinic = user.role === 'clinique';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-emerald-700 mb-6">
          {isClinic ? '🏥 Profil Clinique' : '👤 Mon Profil'}
        </h1>

        {message && (
          <div className={`p-3 rounded mb-6 text-sm font-medium ${
            message.includes('✅')
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* ── SECTION CLINIQUE ── */}
{isClinic && (
  <div className="bg-white rounded-xl shadow p-6 mb-6">
    <h2 className="font-bold text-lg text-emerald-700 mb-4">
      🏥 Informations de la clinique
    </h2>

    {/* Logo clinique */}
    <div className="flex items-center gap-4 mb-6 p-4 bg-emerald-50 rounded-xl">
      {user.clinic_logo ? (
        <img
          src={user.clinic_logo?.startsWith('http')
            ? user.clinic_logo
            : `http://localhost:8000${user.clinic_logo}`}
          alt="Logo clinique"
          className="w-20 h-20 object-cover rounded-xl border-2 border-emerald-300 shadow"
        />
      ) : (
        <div className="w-20 h-20 bg-emerald-100 rounded-xl flex items-center justify-center text-4xl border-2 border-emerald-200">
          🏥
        </div>
      )}
      <div>
        <p className="font-bold text-lg text-gray-800">
          {user.clinic_name || 'Ma Clinique'}
        </p>
        <p className="text-sm text-gray-500">
          Matricule fiscal : {user.tax_id || '—'}
        </p>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mt-1 inline-block">
          ✅ Compte Professionnel
        </span>
      </div>
    </div>

    {/* Infos clinique */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { label: 'Nom de la clinique', value: user.clinic_name },
        { label: 'Responsable', value: user.responsible_name },
        { label: 'Numéro TVA', value: user.tax_id },
        { label: 'Adresse clinique', value: user.clinic_address },
      ].map(({ label, value }) => (
        <div key={label} className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          <p className="font-semibold text-gray-800">{value || '—'}</p>
        </div>
      ))}
    </div>

    <div className="mt-4">
      <Link to="/clinique/dashboard"
        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium transition inline-block">
        💊 Gérer mes produits →
      </Link>
    </div>
  </div>
)}

        {/* ── FORMULAIRE INFOS PERSONNELLES ── */}
        <form onSubmit={handleUpdate} className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">
            {isClinic ? '👤 Informations du responsable' : '👤 Mes informations'}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                value={formData.first_name || ''}
                onChange={e => setFormData(p => ({ ...p, first_name: e.target.value }))}
                placeholder="Prénom"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                value={formData.last_name || ''}
                onChange={e => setFormData(p => ({ ...p, last_name: e.target.value }))}
                placeholder="Nom"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              value={formData.phone || ''}
              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
              placeholder="Téléphone"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Infos non modifiables */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-1 mb-4">
            <p><strong>Email :</strong> {user.email} <span className="text-gray-400">(non modifiable)</span></p>
            <p><strong>Rôle :</strong>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                isClinic ? 'bg-blue-100 text-blue-700' :
                user.role === 'admin' ? 'bg-red-100 text-red-700' :
                'bg-green-100 text-green-700'
              }`}>
                {isClinic ? '🏥 Clinique' : user.role === 'admin' ? '⚙️ Admin' : '👤 Client'}
              </span>
            </p>
            <p><strong>Inscrit le :</strong> {new Date(user.date_joined).toLocaleDateString('fr-FR')}</p>
          </div>

          <div className="flex gap-3">
            <button type="submit"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition font-medium">
              💾 Enregistrer
            </button>
            <Link to={dashboardPath}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium text-center">
              ← Dashboard
            </Link>
          </div>
        </form>

        {/* ── RGPD ── */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">🔒 Vie privée (RGPD)</h2>
          <p className="text-sm text-gray-500">
            Exportez vos données ou supprimez définitivement votre compte.
          </p>
          <div className="flex gap-3">
            <button onClick={handleExportData}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-medium">
              📥 Exporter mes données
            </button>
            <button onClick={handleDeleteAccount}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium">
              🗑️ Supprimer mon compte
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}