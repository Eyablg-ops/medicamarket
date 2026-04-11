// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Profile() {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Pré-remplir le formulaire avec les données de l'utilisateur
  useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  // Détermine le chemin du dashboard selon le rôle
  const dashboardPath =
    user?.role === 'clinique' ? '/clinique/dashboard' :
    user?.role === 'admin'    ? '/admin/dashboard'    :
    '/dashboard';

  // Mise à jour du profil
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.patch('/profile/', {
        first_name: formData.first_name,
        last_name:  formData.last_name,
        phone:      formData.phone,
      });
      setMessage('Profil mis à jour avec succès !');
    } catch {
      setMessage('Erreur lors de la mise à jour.');
    }
  };

  // Export RGPD
  const handleExportData = async () => {
    try {
      const res = await API.get('/gdpr/export/');
      const blob = new Blob(
        [JSON.stringify(res.data, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mes_donnees.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Impossible d'exporter les données pour le moment.");
    }
  };

  // Suppression du compte
  const handleDeleteAccount = async () => {
    const password = prompt(
      'Entrez votre mot de passe pour confirmer la suppression :'
    );
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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Barre de navigation ── */}
      <div className="bg-emerald-700 px-8 py-4 flex justify-between items-center">
        <h2 className="text-white font-bold text-lg">MedicaMarket</h2>
        <div className="flex items-center gap-3">
          <Link
            to={dashboardPath}
            className="text-white text-sm bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-500 transition"
          >
            ← Tableau de bord
          </Link>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-white text-sm bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-emerald-700 mb-6">Mon Profil</h1>

        {/* Message de succès / erreur */}
        {message && (
          <div className={`p-3 rounded mb-6 text-sm font-medium ${
            message.includes('succès')
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* ── Formulaire ── */}
        <form onSubmit={handleUpdate} className="space-y-4 bg-white p-6 rounded-xl shadow">
          <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              value={formData.phone || ''}
              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
              placeholder="Téléphone"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Infos non modifiables */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-1">
            <p><strong>Email :</strong> {user.email} <span className="text-gray-400">(non modifiable)</span></p>
            <p><strong>Rôle :</strong> {user.role}</p>
            <p><strong>Inscrit le :</strong> {new Date(user.date_joined).toLocaleDateString('fr-FR')}</p>
          </div>

          {/* ── Deux boutons ── */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
            >
              Enregistrer
            </button>
            <Link
              to={dashboardPath}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium text-center"
            >
              ← Retour au dashboard
            </Link>
          </div>
        </form>

        {/* ── Section RGPD ── */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">🔒 Vie privée (RGPD)</h2>
          <p className="text-sm text-gray-500">
            Vous pouvez exporter vos données personnelles ou supprimer définitivement votre compte.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleExportData}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-medium"
            >
              📥 Exporter mes données
            </button>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium"
            >
              🗑️ Supprimer mon compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}