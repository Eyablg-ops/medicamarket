import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Profile() {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.patch('/profile/', formData);
      setMessage('Profil mis à jour !');
    } catch {
      setMessage('Erreur lors de la mise à jour');
    }
  };

  const handleExportData = async () => {
    const res = await API.get('/gdpr/export/');
    // Télécharger en JSON
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mes_donnees.json';
    a.click();
  };

  const handleDeleteAccount = async () => {
    const password = prompt('Entrez votre mot de passe pour confirmer la suppression :');
    if (!password) return;
    try {
      await API.delete('/gdpr/delete/', { data: { password } });
      logout();
    } catch {
      alert('Mot de passe incorrect');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-emerald-700 mb-6">Mon Profil</h1>

      {message && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded mb-4">{message}</div>
      )}

      <form onSubmit={handleUpdate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input value={formData.first_name || ''} onChange={e => setFormData(p => ({...p, first_name: e.target.value}))}
            placeholder="Prénom" className="px-4 py-2 border rounded-lg" />
          <input value={formData.last_name || ''} onChange={e => setFormData(p => ({...p, last_name: e.target.value}))}
            placeholder="Nom" className="px-4 py-2 border rounded-lg" />
        </div>
        <input value={formData.phone || ''} onChange={e => setFormData(p => ({...p, phone: e.target.value}))}
          placeholder="Téléphone" className="w-full px-4 py-2 border rounded-lg" />

        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
          <strong>Email :</strong> {user.email} (non modifiable)<br/>
          <strong>Rôle :</strong> {user.role}<br/>
          <strong>Inscrit le :</strong> {new Date(user.date_joined).toLocaleDateString('fr-FR')}
        </div>

        <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">
          Enregistrer
        </button>
      </form>

      {/* RGPD */}
      <div className="mt-8 border-t pt-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Vie privée (RGPD)</h2>
        <button onClick={handleExportData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          📥 Exporter mes données
        </button>
        <button onClick={handleDeleteAccount}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          🗑️ Supprimer mon compte
        </button>
      </div>
    </div>
  );
}
