import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../api/products';
import { addToCart } from '../api/orders';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatbotWidget from '../components/ai/ChatbotWidget';
export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProduct(slug)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      await refreshCart();
      setMessage('✅ Produit ajouté au panier !');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('❌ Connectez-vous pour ajouter au panier');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="text-center py-20 text-gray-400 text-xl">Chargement...</div>
    </>
  );

  if (!product) return null;

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Bouton retour */}
        <button
          onClick={() => navigate('/shop')}
          className="text-blue-600 hover:underline mb-6 flex items-center gap-1"
        >
          ← Retour à la boutique
        </button>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            {/* Image */}
            <div className="bg-gray-100 flex items-center justify-center h-80 md:h-auto">
              {product.image ? (
                <img
                  src={product.image?.startsWith('http') ? product.image : `http://localhost:8000${product.image}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-8xl">💊</span>
              )}
            </div>

            {/* Détails */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.is_expiring_soon && (
                    <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                      ⚠️ Expire bientôt
                    </span>
                  )}
                  {product.is_expired && (
                    <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">
                      ❌ Expiré
                    </span>
                  )}
                  {product.requires_prescription && (
                    <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      📋 Ordonnance requise
                    </span>
                  )}
                  {product.is_in_stock ? (
                    <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      ✅ En stock ({product.stock} unités)
                    </span>
                  ) : (
                    <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                      ❌ Rupture de stock
                    </span>
                  )}
                </div>

                {/* Nom et catégorie */}
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                <p className="text-blue-600 font-medium mb-4">📁 {product.category_name}</p>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

                {/* Date expiration */}
                {product.expiration_date && (
                  <p className="text-sm text-gray-500 mb-4">
                    📅 Date d'expiration : <strong>{product.expiration_date}</strong>
                  </p>
                )}
              </div>

              {/* Prix + Quantité + Bouton */}
              <div>
                <p className="text-4xl font-bold text-blue-600 mb-6">
                  {product.price} TND
                </p>

                {product.is_in_stock && !product.is_expired && (
                  <div className="flex items-center gap-4 mb-4">
                    {/* Quantité */}
                    <div className="flex items-center gap-2 border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="px-4 py-2 hover:bg-gray-100 font-bold text-lg"
                      >−</button>
                      <span className="px-4 py-2 font-semibold text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                        className="px-4 py-2 hover:bg-gray-100 font-bold text-lg"
                      >+</button>
                    </div>

                    {/* Bouton ajouter */}
                    <button
                      onClick={handleAddToCart}
                      disabled={adding}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {adding ? 'Ajout...' : '🛒 Ajouter au panier'}
                    </button>
                  </div>
                )}

                {/* Message feedback */}
                {message && (
                  <div className={`p-3 rounded-lg text-center font-medium ${
                    message.includes('✅') 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Bouton aller au panier */}
                {message.includes('✅') && (
                  <button
                    onClick={() => navigate('/cart')}
                    className="w-full mt-3 border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
                  >
                    Voir mon panier →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-screen flex flex-col"><Footer />
       <ChatbotWidget />
       </div>
    </>
  );
}