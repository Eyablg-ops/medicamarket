import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getClinicProducts } from '../api/clinic';
import { getOrders } from '../api/orders';
import ChatbotWidget from '../components/ai/ChatbotWidget';
export default function DashboardClinique() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [prodRes, ordRes] = await Promise.all([
        getClinicProducts(),
        getOrders(),
      ]);
      setProducts(prodRes.data.results || prodRes.data);
      setOrders(ordRes.data.results || ordRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Calcul des stats ──
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.is_active).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    expiringSoon: products.filter(p => p.is_expiring_soon).length,
    totalOrders: orders.length,
    paidOrders: orders.filter(o => o.status === 'paid').length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalRevenue: orders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
      .toFixed(2),
  };

  // ── Top produits vendus ──
  const topProducts = () => {
    const counter = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        counter[item.product_name] = (counter[item.product_name] || 0) + item.quantity;
      });
    });
    return Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  // ── Répartition catégories ──
  const categoryStats = () => {
    const counter = {};
    products.forEach(p => {
      const cat = p.category_name || 'Autre';
      counter[cat] = (counter[cat] || 0) + 1;
    });
    return Object.entries(counter).sort((a, b) => b[1] - a[1]).slice(0, 4);
  };

  // ── Alertes ──
  const alerts = [
    ...products.filter(p => p.stock === 0).map(p => ({
      type: 'danger', name: p.name,
      desc: 'Rupture totale de stock', badge: 'Urgent'
    })),
    ...products.filter(p => p.stock > 0 && p.stock <= 5).map(p => ({
      type: 'danger', name: p.name,
      desc: `Stock critique — ${p.stock} unités`, badge: 'Urgent'
    })),
    ...products.filter(p => p.is_expiring_soon).map(p => ({
      type: 'warning', name: p.name,
      desc: `Expire le ${p.expiration_date}`, badge: 'Attention'
    })),
  ].slice(0, 5);

  const STATUS_COLORS = {
    pending:    'bg-yellow-100 text-yellow-800',
    paid:       'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped:    'bg-purple-100 text-purple-800',
    delivered:  'bg-green-100 text-green-900',
    cancelled:  'bg-red-100 text-red-800',
  };
  const STATUS_LABELS = {
    pending: 'En attente', paid: 'Payé',
    processing: 'En traitement', shipped: 'Expédié',
    delivered: 'Livré', cancelled: 'Annulé',
  };

  const CATEGORY_COLORS = [
    '#059669', '#2563eb', '#d97706', '#7c3aed', '#dc2626'
  ];

  const topProds = topProducts();
  const maxSales = topProds[0]?.[1] || 1;
  const catStats = categoryStats();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">

        {/* ── HEADER ── */}
        <div className="bg-emerald-700 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full overflow-hidden border-2 border-emerald-300 flex items-center justify-center">
                {user?.clinic_logo ? (
                  <img
                    src={user.clinic_logo?.startsWith('http')
                      ? user.clinic_logo
                      : `http://localhost:8000${user.clinic_logo}`}
                    alt="Logo" className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">🏥</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.clinic_name || 'Ma Clinique'}</h1>
                <p className="text-emerald-200 text-sm">{user?.email}</p>
                <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full mt-1 inline-block">
                  Compte Professionnel
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/clinique/products"
                className="bg-white text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-50 transition">
                + Produit
              </Link>
              <Link to="/clinique/categories"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-500 transition border border-emerald-400">
                Catégories
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-xl">Chargement...</div>
        ) : (
          <>
            {/* ── STATS PRODUITS ── */}
            <p className="text-sm font-medium text-gray-500 mb-3">Vue d'ensemble — Produits</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total produits', value: stats.totalProducts, sub: '+3 ce mois', subColor: 'text-blue-600', bg: 'bg-blue-100' },
                { label: 'Produits actifs', value: stats.activeProducts, sub: `${Math.round(stats.activeProducts / (stats.totalProducts || 1) * 100)}% du catalogue`, subColor: 'text-green-600', bg: 'bg-green-100' },
                { label: 'Rupture stock', value: stats.outOfStock, sub: 'À réapprovisionner', subColor: 'text-red-600', bg: 'bg-red-100' },
                { label: 'Expire bientôt', value: stats.expiringSoon, sub: 'Dans les 30 jours', subColor: 'text-yellow-600', bg: 'bg-yellow-100' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-5`}>
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{s.value}</p>
                  <p className={`text-xs mt-1 font-medium ${s.subColor}`}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* ── STATS COMMANDES ── */}
            <p className="text-sm font-medium text-gray-500 mb-3">Vue d'ensemble — Commandes</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total commandes', value: stats.totalOrders, sub: `${stats.pendingOrders} en attente`, subColor: 'text-blue-600', bg: 'bg-purple-100' },
                { label: 'Commandes payées', value: stats.paidOrders, sub: `${Math.round(stats.paidOrders / (stats.totalOrders || 1) * 100)}% taux paiement`, subColor: 'text-green-600', bg: 'bg-green-100' },
                { label: "Chiffre d'affaires", value: `${stats.totalRevenue} TND`, sub: 'Commandes payées', subColor: 'text-emerald-600', bg: 'bg-emerald-100' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-5`}>
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{s.value}</p>
                  <p className={`text-xs mt-1 font-medium ${s.subColor}`}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* ── LIGNE 3 : Top produits + Catégories ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              {/* Top produits vendus */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800">Top produits vendus</h2>
                  <Link to="/clinique/products"
                    className="text-emerald-600 text-xs hover:underline">Voir tout →</Link>
                </div>
                {topProds.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Aucune vente encore</p>
                ) : (
                  <div className="space-y-3">
                    {topProds.map(([name, count]) => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24 truncate">{name}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${Math.round(count / maxSales * 100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-16 text-right">
                          {count} ventes
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Répartition catégories */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 mb-4">Répartition catégories</h2>
                {catStats.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Aucune catégorie</p>
                ) : (
                  <div className="flex items-center gap-6">
                    {/* Donut SVG */}
                    <svg width="100" height="100" viewBox="0 0 36 36" className="flex-shrink-0">
                      {(() => {
                        const total = catStats.reduce((s, [, v]) => s + v, 0);
                        let offset = 25;
                        return catStats.map(([name, count], i) => {
                          const pct = Math.round(count / total * 100);
                          const el = (
                            <circle key={name} cx="18" cy="18" r="15.9"
                              fill="none" stroke={CATEGORY_COLORS[i]}
                              strokeWidth="3"
                              strokeDasharray={`${pct} ${100 - pct}`}
                              strokeDashoffset={-offset + 25}
                              transform="rotate(-90 18 18)"
                            />
                          );
                          offset += pct;
                          return el;
                        });
                      })()}
                      <text x="18" y="19" textAnchor="middle"
                        fontSize="5" fontWeight="500" fill="var(--color-text-primary)">
                        {stats.totalProducts} prod
                      </text>
                    </svg>
                    {/* Légende */}
                    <div className="space-y-2 flex-1">
                      {catStats.map(([name, count], i) => (
                        <div key={name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: CATEGORY_COLORS[i] }} />
                          <span className="text-xs text-gray-600 flex-1 truncate">{name}</span>
                          <span className="text-xs font-semibold text-gray-700">
                            {Math.round(count / (stats.totalProducts || 1) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── LIGNE 4 : Commandes récentes + Alertes ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              {/* Commandes récentes */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800">Commandes récentes</h2>
                  <Link to="/orders"
                    className="text-emerald-600 text-xs hover:underline">Voir tout →</Link>
                </div>
                {orders.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Aucune commande</p>
                ) : (
                  <div className="space-y-1">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id}
                        className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            Commande #{order.id}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || ''}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                        <p className="text-sm font-bold text-blue-600">
                          {order.total_amount} TND
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Alertes importantes */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800">Alertes importantes</h2>
                  {alerts.length > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                      {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {alerts.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-3xl mb-2">✅</p>
                    <p className="text-green-600 text-sm font-medium">Tout est en ordre !</p>
                    <p className="text-gray-400 text-xs">Aucune alerte pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {alerts.map((alert, i) => (
                      <div key={i}
                        className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                          alert.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {alert.type === 'danger' ? '!' : '~'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {alert.name}
                          </p>
                          <p className="text-xs text-gray-500">{alert.desc}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                          alert.type === 'danger'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {alert.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── ACTIONS RAPIDES ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Actions rapides</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Ajouter un produit', icon: '💊', to: '/clinique/products', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
                  { label: 'Gérer catégories', icon: '🗂️', to: '/clinique/categories', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                  { label: 'Voir commandes', icon: '📦', to: '/orders', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
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
          </>
        )}
      </div>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}