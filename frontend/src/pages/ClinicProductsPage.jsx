import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  getClinicProducts, createProduct, deleteProduct,
  getClinicCategories
} from '../api/clinic';

export default function ClinicProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [productForm, setProductForm] = useState({
    name: '', slug: '', description: '', price: '',
    stock: '', category: '', expiration_date: '',
    requires_prescription: false, is_active: true
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getClinicProducts();
      setProducts(res.data.results || res.data);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getClinicCategories();
      setCategories(res.data.results || res.data);
    } catch {}
  };

  const generateSlug = (name) => name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-');

  const resetForm = () => {
    setProductForm({
      name: '', slug: '', description: '', price: '',
      stock: '', category: '', expiration_date: '',
      requires_prescription: false, is_active: true
    });
    setProductImage(null);
    setImagePreview(null);
  };

  const handleCreateProduct = async () => {
    setError('');
    if (!productForm.name || !productForm.price || !productForm.stock) {
      setError('Nom, prix et stock sont obligatoires');
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(productForm).forEach(([k, v]) => {
        if (v !== '') formData.append(k, v);
      });
      if (productImage) formData.append('image', productImage);
      await createProduct(formData);
      setMessage('✅ Produit créé avec succès !');
      resetForm();
      loadProducts();
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setError('Erreur : ' + JSON.stringify(e.response?.data || 'Réessayez'));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await deleteProduct(id);
    loadProducts();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">💊 Gestion des Produits</h1>

        {message && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">{message}</div>}
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

        {/* Formulaire ajout */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">➕ Ajouter un produit</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nom du produit *"
              value={productForm.name}
              onChange={e => setProductForm({
                ...productForm,
                name: e.target.value,
                slug: generateSlug(e.target.value)
              })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input type="text" placeholder="Slug (auto-généré)"
              value={productForm.slug}
              onChange={e => setProductForm({ ...productForm, slug: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input type="number" placeholder="Prix (TND) *"
              value={productForm.price}
              onChange={e => setProductForm({ ...productForm, price: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input type="number" placeholder="Stock *"
              value={productForm.stock}
              onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select value={productForm.category}
              onChange={e => setProductForm({ ...productForm, category: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Sélectionner une catégorie</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">📅 Date d'expiration</label>
              <input type="date" value={productForm.expiration_date}
                onChange={e => setProductForm({ ...productForm, expiration_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <textarea placeholder="Description"
              value={productForm.description}
              onChange={e => setProductForm({ ...productForm, description: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 md:col-span-2"
              rows={3}
            />

            {/* Image upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">🖼️ Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-emerald-400 transition">
                <input type="file" accept="image/*" id="product-image"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) { setProductImage(file); setImagePreview(URL.createObjectURL(file)); }
                  }}
                  className="hidden"
                />
                <label htmlFor="product-image" className="cursor-pointer block">
                  {imagePreview ? (
                    <div className="flex items-center gap-4">
                      <img src={imagePreview} className="h-20 w-20 object-cover rounded-lg border" />
                      <div className="text-left">
                        <p className="text-sm text-emerald-600 font-medium">✅ Image sélectionnée</p>
                        <p className="text-xs text-blue-500 underline mt-1">Changer</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-3">
                      <p className="text-3xl mb-1">📷</p>
                      <p className="text-gray-500 text-sm">Cliquer pour ajouter une image</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex items-center gap-6 md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={productForm.requires_prescription}
                  onChange={e => setProductForm({ ...productForm, requires_prescription: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600" />
                <span className="text-sm">📋 Ordonnance requise</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={productForm.is_active}
                  onChange={e => setProductForm({ ...productForm, is_active: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600" />
                <span className="text-sm">✅ Produit actif</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={handleCreateProduct}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition font-medium">
              ➕ Créer
            </button>
            <button onClick={resetForm}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium">
              🔄 Réinitialiser
            </button>
          </div>
        </div>

        {/* Liste produits */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-lg mb-4">📦 Tous les produits ({products.length})</h2>
          {loading ? (
            <p className="text-center text-gray-400 py-8">Chargement...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Aucun produit</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-left">
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Produit</th>
                    <th className="px-4 py-3 text-right">Prix</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                    <th className="px-4 py-3 text-center">Statut</th>
                    <th className="px-4 py-3 text-center">Expiration</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {p.image ? (
                          <img src={p.image?.startsWith('http') ? p.image : `http://localhost:8000${p.image}`}
                            className="w-12 h-12 object-cover rounded-lg border" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">💊</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category_name}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-blue-600 font-bold">{p.price} TND</td>
                      <td className="px-4 py-3 text-right">
                        <span className={p.stock === 0 ? 'text-red-500 font-bold' : p.stock < 10 ? 'text-yellow-500' : 'text-green-600'}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.is_active ? '✅ Actif' : '❌ Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs">
                        {p.expiration_date ? (
                          <span className={p.is_expired ? 'text-red-500 font-bold' : p.is_expiring_soon ? 'text-yellow-600 font-bold' : 'text-gray-500'}>
                            {p.is_expired ? '❌ ' : p.is_expiring_soon ? '⚠️ ' : ''}{p.expiration_date}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDeleteProduct(p.id)}
                          className="text-red-400 hover:text-red-600 text-xs px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50">
                          🗑️ Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}