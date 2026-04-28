import { useState, useEffect } from 'react';
import { getOrders } from '../api/orders';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatbotWidget from '../components/ai/ChatbotWidget';
const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  paid:       'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  pending:    'En attente',
  paid:       'Payé',
  processing: 'En traitement',
  shipped:    'Expédié',
  delivered:  'Livré',
  cancelled:  'Annulé',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then(r => setOrders(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadInvoice = (orderId) => {
    const token = localStorage.getItem('access_token');
    fetch(`http://localhost:8000/api/payments/invoice/${orderId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture_${String(orderId).padStart(4, '0')}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert('Erreur lors du téléchargement'));
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="text-center py-20 text-gray-400 text-xl">Chargement...</div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">📦 Mes Commandes</h1>

        {orders.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl mb-4">Aucune commande pour l'instant</p>
            <Link to="/shop"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Aller à la boutique
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-gray-800 text-lg">
                        Commande #{order.id}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || ''}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      📅 {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                    <div className="space-y-1">
                      {order.items.map(item => (
                        <p key={item.id} className="text-sm text-gray-600">
                          • {item.product_name} × {item.quantity} —
                          <span className="font-medium"> {item.subtotal} TND</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <p className="font-bold text-blue-600 text-xl mb-3">
                      {order.total_amount} TND
                    </p>
                    {/* Bouton facture PDF — uniquement si payé */}
                    {order.status === 'paid' && (
                      <button
                        onClick={() => handleDownloadInvoice(order.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        📄 Télécharger facture
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="min-h-screen flex flex-col"><Footer /> 
      <ChatbotWidget /></div>
    </>
  );
}