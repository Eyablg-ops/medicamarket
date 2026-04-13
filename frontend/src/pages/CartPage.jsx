import { useCart } from '../context/CartContext';
import { updateCartItem, removeCartItem } from '../api/orders';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
export default function CartPage() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  if (!cart || cart.items.length === 0) {
    return (
         <>
    <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Votre panier est vide</h2>
        <Link to="/shop" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Continuer mes achats
        </Link>
      </div>
      </>
    );
  }

  const handleQuantity = async (itemId, qty) => {
    await updateCartItem(itemId, qty);
    await refreshCart();
  };

  const handleRemove = async (itemId) => {
    await removeCartItem(itemId);
    await refreshCart();
  };

  return (
    <>
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🛒 Mon Panier</h1>

      <div className="space-y-4 mb-8">
        {cart.items.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
              💊
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{item.product.name}</h3>
              <p className="text-gray-500 text-sm">{item.product.price} TND / unité</p>
            </div>
            {/* Quantité */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 font-bold"
              >−</button>
              <span className="w-8 text-center font-semibold">{item.quantity}</span>
              <button
                onClick={() => handleQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 font-bold"
              >+</button>
            </div>
            <span className="font-bold text-blue-600 w-24 text-right">
              {item.subtotal} TND
            </span>
            <button
              onClick={() => handleRemove(item.id)}
              className="text-red-400 hover:text-red-600 text-xl ml-2"
            >✕</button>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
        <div>
          <p className="text-gray-500">Total ({cart.item_count} articles)</p>
          <p className="text-3xl font-bold text-blue-600">{cart.total} TND</p>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Commander →
        </button>
      </div>
    </div>
    <div className="min-h-screen flex flex-col"><Footer /> </div>
    </>
  );
}