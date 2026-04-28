import { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../api/products';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SmartSearchBar from '../components/ai/SmartSearchBar';
import ChatbotWidget from '../components/ai/ChatbotWidget';
import RecommendationSection from '../components/ai/RecommendationSection';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    getCategories().then((response) => {
      setCategories(response.data.results || response.data);
    });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory]);

  useEffect(() => {
    setLoading(true);

    const params = { page };

    if (search) {
      params.search = search;
    }

    if (selectedCategory) {
      params.category = selectedCategory;
    }

    getProducts(params)
      .then((response) => {
        const data = response.data;

        setProducts(data.results || data);
        setNextPage(data.next);
        setPreviousPage(data.previous);
        setCount(data.count || 0);
      })
      .finally(() => setLoading(false));
  }, [search, selectedCategory, page]);

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              🏥 Notre Boutique
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Trouvez rapidement vos produits médicaux.
            </p>
          </div>

          <RecommendationSection products={products} />
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <SmartSearchBar value={search} on_change={setSearch} />

          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les catégories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-xl">
            Chargement...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-xl">
            Aucun produit trouvé
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500">
              {count} produit(s) trouvé(s)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={!previousPage}
                onClick={() => setPage((currentPage) => currentPage - 1)}
                className="px-4 py-2 rounded-lg border bg-white disabled:opacity-40"
              >
                ← Précédent
              </button>

              <span className="text-sm text-gray-600">
                Page {page}
              </span>

              <button
                type="button"
                disabled={!nextPage}
                onClick={() => setPage((currentPage) => currentPage + 1)}
                className="px-4 py-2 rounded-lg border bg-white disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
      <ChatbotWidget />
    </>
  );
}