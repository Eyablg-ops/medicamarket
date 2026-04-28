import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getClinicCategories, createCategory, deleteCategory } from '../api/clinic';
import ChatbotWidget from '../components/ai/ChatbotWidget';

export default function ClinicCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', slug: '', description: '' });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getClinicCategories();
      setCategories(res.data.results || res.data);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => name.toLowerCase()
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-');

  const handleCreate = async () => {
    setError('');
    if (!form.name) { setError('Le nom est obligatoire'); return; }
    try {
      await createCategory({ ...form, slug: form.slug || generateSlug(form.name) });
      setMessage('✅ Catégorie créée !');
      setForm({ name: '', slug: '', description: '' });
      loadCategories();
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setError('Erreur : ' + JSON.stringify(e.response?.data || 'Réessayez'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    await deleteCategory(id);
    loadCategories();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🗂️ Gestion des Catégories</h1>

        {message && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">{message}</div>}
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">➕ Ajouter une catégorie</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Nom *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input type="text" placeholder="Slug (auto-généré)"
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input type="text" placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button onClick={handleCreate}
            className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition font-medium">
            ➕ Créer la catégorie
          </button>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-lg mb-4">🗂️ Toutes les catégories ({categories.length})</h2>
          {loading ? (
            <p className="text-center text-gray-400 py-8">Chargement...</p>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Aucune catégorie</p>
          ) : (
            <div className="space-y-2">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-lg">🗂️</div>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-gray-400">/{c.slug}</p>
                      {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(c.id)}
                    className="text-red-400 hover:text-red-600 text-xs px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50">
                    🗑️ Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <div className="min-h-screen flex flex-col"><ChatbotWidget /></div>
    </div>
  );
}