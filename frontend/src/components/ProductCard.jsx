import { Link } from 'react-router-dom';
import { addToCart } from '../api/orders';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { refreshCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await addToCart(product.id);
      await refreshCart();
      alert('✅ Produit ajouté au panier !');
    } catch {
      alert('❌ Connectez-vous pour ajouter au panier');
    }
  };

  return (
    <Link to={`/shop/${product.slug}`} className="block">
      <div className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden group">
        
        {/* Image */}
        <div className="h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image?.startsWith('http') ? product.image : `http://localhost:8000${product.image}`}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          ) : (
            <span className="text-5xl">💊</span>
          )}
        </div>

        <div className="p-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-1 mb-2">
            {product.is_expiring_soon && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                ⚠️ Expire bientôt
              </span>
            )}
            {product.requires_prescription && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                📋 Ordonnance
              </span>
            )}
            {!product.is_in_stock && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                Rupture de stock
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-3">{product.category_name}</p>

          <div className="flex items-center justify-between">
            <span className="text-blue-600 font-bold text-lg">{product.price} TND</span>
            {product.is_in_stock && (
              <button
                onClick={handleAddToCart}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                + Panier
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}