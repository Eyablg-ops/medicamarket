import { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../api/products';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';  
import Footer from '../components/Footer';
import SmartSearchBar from '../components/ai/SmartSearchBar';
import ChatbotWidget from '../components/ai/ChatbotWidget';
export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   getCategories().then(r => setCategories(r.data.results || r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    getProducts(params)
      .then(r => setProducts(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, [search, selectedCategory]);

  return (
    <>
    <Navbar/>
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🏥 Notre Boutique</h1>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-8">
       <SmartSearchBar
  value={search}
  on_change={setSearch}
/>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Grille produits */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-xl">Chargement...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-xl">Aucun produit trouvé</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
    <div className="min-h-screen flex flex-col"><Footer /> 
          <ChatbotWidget />
    </div>
    </>
  );
}