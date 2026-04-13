import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders } from '../api/orders';
import { getProducts } from '../api/products';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const STATUS_LABELS = {
  pending: 'En attente', paid: 'Payé',
  processing: 'En traitement', shipped: 'Expédié',
  delivered: 'Livré', cancelled: 'Annulé',
};

const statusStyle = (s) => {
  if (s === 'paid' || s === 'delivered') return 'bg-emerald-100 text-emerald-700';
  if (s === 'pending')    return 'bg-amber-100 text-amber-700';
  if (s === 'cancelled')  return 'bg-red-100 text-red-700';
  if (s === 'processing') return 'bg-blue-100 text-blue-700';
  if (s === 'shipped')    return 'bg-purple-100 text-purple-700';
  return 'bg-gray-100 text-gray-600';
};

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordRes, prodRes] = await Promise.all([
        getOrders(),
        getProducts(),
      ]);
      setOrders(ordRes.data.results || ordRes.data);
      setProducts(prodRes.data.results || prodRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Stats réelles ──
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const paidOrders = orders.filter(o => o.status === 'paid').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalSpent = orders
    .filter(o => o.status === 'paid' || o.status === 'delivered')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
    .toFixed(2);

  // ── Produits récemment achetés (depuis les commandes) ──
  const boughtProducts = [];
  orders.forEach(order => {
    order.items?.forEach(item => {
      if (!boughtProducts.find(p => p.name === item.product_name)) {
        boughtProducts.push({
          name: item.product_name,
          price: `${item.product_price} TND`,
          quantity: item.quantity,
        });
      }
    });
  });

  // ── Recommandations (produits pas encore achetés) ──
  const boughtNames = boughtProducts.map(p => p.name);
  const recommendations = products
    .filter(p => !boughtNames.includes(p.name) && p.is_in_stock)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">

        {/* ── Bienvenue ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {user?.first_name} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Bienvenue sur votre espace personnel MedicaMarket.
          </p>
        </div>

        {/* ── Cartes résumé ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-10">
          {[
            { icon: '🛒', label: 'Total commandes',  value: totalOrders,    color: 'bg-emerald-50 border-emerald-200' },
            { icon: '💳', label: 'Commandes payées', value: paidOrders,     color: 'bg-blue-50 border-blue-200' },
            { icon: '✅', label: 'Livrées',           value: deliveredOrders, color: 'bg-teal-50 border-teal-200' },
            { icon: '⏳', label: 'En attente',        value: pendingOrders,  color: 'bg-amber-50 border-amber-200' },
          ].map((c, i) => (
            <div key={i} className={`rounded-2xl border p-5 ${c.color} flex items-center gap-4`}>
              <span className="text-3xl">{c.icon}</span>
              <div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Total dépensé ── */}
        {parseFloat(totalSpent) > 0 && (
          <div className="bg-emerald-600 rounded-2xl p-5 text-white mb-8 flex items-center justify-between">
            <div>
              <p className="text-emerald-200 text-sm">Total dépensé sur MedicaMarket</p>
              <p className="text-3xl font-bold mt-1">{totalSpent} TND</p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        )}

        {/* ── Dernières commandes ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">🛒 Mes dernières commandes</h2>
            <Link to="/orders"
              className="text-sm text-emerald-600 hover:underline font-medium">
              Voir tout →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-400">Chargement...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 mb-3">Aucune commande pour le moment</p>
              <Link to="/shop"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
                Aller à la boutique
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['N° commande', 'Date', 'Articles', 'Statut', 'Montant'].map(h => (
                      <th key={h}
                        className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.slice(0, 5).map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-emerald-700">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {order.items?.length > 0 ? (
                          <span>
                            {order.items[0].product_name}
                            {order.items.length > 1 && (
                              <span className="text-gray-400 text-xs ml-1">
                                +{order.items.length - 1} autre{order.items.length > 2 ? 's' : ''}
                              </span>
                            )}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(order.status)}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {order.total_amount} TND
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Produits déjà achetés ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">🔁 Déjà achetés</h2>
            </div>
            <div className="p-6 space-y-3">
              {boughtProducts.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  Aucun achat encore
                </p>
              ) : (
                boughtProducts.slice(0, 4).map((p, i) => (
                  <div key={i}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                    <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      💊
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">Commandé {p.quantity} fois</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-700">{p.price}</p>
                      <Link to="/shop"
                        className="text-xs text-blue-500 hover:underline">
                        Racheter
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ── Recommandations ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">✨ Recommandé pour vous</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              {recommendations.length === 0 ? (
                <div className="col-span-2 text-center text-gray-400 py-6">
                  <p className="mb-3">Découvrez notre boutique</p>
                  <Link to="/shop"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
                    Voir les produits
                  </Link>
                </div>
              ) : (
                recommendations.map((p, i) => (
                  <Link key={i} to={`/shop/${p.slug}`}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition cursor-pointer block">
                    <div className="w-10 h-10 mb-2 bg-white rounded-lg overflow-hidden flex items-center justify-center border">
                      {p.image ? (
                        <img
                          src={p.image?.startsWith('http') ? p.image : `http://localhost:8000${p.image}`}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">💊</span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 text-sm leading-snug truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.category_name}</p>
                    <p className="text-emerald-600 font-bold text-sm mt-2">{p.price} TND</p>
                  </Link>
                ))
              )}
            </div>
          </section>

        </div>

        {/* ── Actions rapides ── */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Boutique', icon: '🛍️', to: '/shop', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
              { label: 'Mon panier', icon: '🛒', to: '/cart', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
              { label: 'Mes commandes', icon: '📦', to: '/orders', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
              { label: 'Mon profil', icon: '👤', to: '/profile', color: 'bg-gray-50 text-gray-700 hover:bg-gray-100' },
            ].map(action => (
              <Link key={action.label} to={action.to}
                className={`${action.color} rounded-xl p-4 text-center transition font-medium text-sm`}>
                <div className="text-2xl mb-1">{action.icon}</div>
                {action.label}
              </Link>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}