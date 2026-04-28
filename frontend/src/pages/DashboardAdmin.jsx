import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  ResponsiveContainer, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { get_alerts_summary } from '../api/ai';
import axios from 'axios';
const roleStyle = (role) => {
  if (role === 'admin')    return 'bg-red-100 text-red-700';
  if (role === 'clinique') return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
};

export default function DashboardAdmin() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [users, setUsers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchUser, setSearchUser] = useState('');
  const [alertsSummary, setAlertsSummary] = useState(null);
  useEffect(() => { loadData(); }, []);

const loadData = async () => {
  try {
    const token = localStorage.getItem('access_token');

    const [statsRes, alertsRes] = await Promise.all([
      API.get('../api/orders/admin/stats/'),
      axios.get('http://localhost:8000/api/ai/alerts/summary/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    setStats(statsRes.data.stats);
    setUsers(statsRes.data.users || []);
    setTopProducts(statsRes.data.top_products || []);
    setSalesData(statsRes.data.sales_history || []);
    setAlertsSummary(alertsRes.data);
  } catch (e) {
    console.error('Erreur chargement stats:', e);
  } finally {
    setLoading(false);
  }
};

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.first_name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.last_name.toLowerCase().includes(searchUser.toLowerCase())
  );

  const TABS = [
    { key: 'overview', label: '📊 Vue d\'ensemble' },
    { key: 'users',    label: '👥 Utilisateurs' },
    { key: 'products', label: '📦 Top produits' },
    { key: 'expired', label: '🚫 Produits expirés' },
  { key: 'expiring', label: '⚠️ Expire bientôt' },
  ];

  const KPI = stats ? [
    { label: 'Total Stock',     value: stats.total_stock?.toLocaleString(),            icon: '📦', color: 'bg-sky-50 border-sky-200',        text: 'text-sky-700' },
    { label: 'Stock restant',   value: stats.remaining_stock?.toLocaleString(),         icon: '✅', color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
    { label: 'Qté vendue',      value: stats.quantity_sold?.toLocaleString(),           icon: '🛒', color: 'bg-violet-50 border-violet-200',   text: 'text-violet-700' },
    { label: 'Revenu total',    value: `${stats.total_revenue?.toLocaleString()} TND`, icon: '💰', color: 'bg-amber-50 border-amber-200',     text: 'text-amber-700' },
    { label: 'Utilisateurs',    value: stats.total_users,                              icon: '👥', color: 'bg-pink-50 border-pink-200',       text: 'text-pink-700' },
    { label: 'Cliniques',       value: stats.total_clinics,                            icon: '🏥', color: 'bg-teal-50 border-teal-200',       text: 'text-teal-700' },
    { label: 'Commandes',       value: stats.total_orders,                             icon: '📋', color: 'bg-blue-50 border-blue-200',       text: 'text-blue-700' },
    { label: 'Payées',          value: stats.paid_orders,                              icon: '💳', color: 'bg-green-50 border-green-200',     text: 'text-green-700' },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">⚙️ Administration</h1>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Admin
            </span>
          </div>
          <p className="text-gray-500">
            Connecté en tant que <strong>{user?.email}</strong>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-5 py-3 text-sm font-medium rounded-t-lg transition border-b-2 -mb-px ${
                activeTab === t.key
                  ? 'border-emerald-600 text-emerald-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-xl">
            Chargement des données...
          </div>
        ) : (
          <>
            {/* ── Vue d'ensemble ── */}
            {activeTab === 'overview' && (
              <div>
                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
                  {KPI.map((k, i) => (
                    <div key={i} className={`rounded-2xl border p-4 ${k.color}`}>
                      <div className="text-2xl mb-2">{k.icon}</div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{k.label}</p>
                      <p className={`text-xl font-bold ${k.text}`}>{k.value}</p>
                    </div>
                  ))}
                </div>
                {alertsSummary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm text-red-600">Produits expirés</p>
                    <p className="mt-2 text-3xl font-bold text-red-700">
                      {alertsSummary.expired_count}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                    <p className="text-sm text-yellow-600">Expire bientôt</p>
                    <p className="mt-2 text-3xl font-bold text-yellow-700">
                      {alertsSummary.expiring_soon_count}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-100 p-5">
                    <p className="text-sm text-gray-600">Rupture de stock</p>
                    <p className="mt-2 text-3xl font-bold text-gray-700">
                      {alertsSummary.out_of_stock_count}
                    </p>
                  </div>
                </div>
              )}

                {/* Graphique */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                        Évolution des ventes
                      </p>
                      <h2 className="text-xl font-bold text-gray-900">
                        Performance mensuelle
                      </h2>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
                      Données réelles
                    </span>
                  </div>
                  {salesData.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      Aucune vente payée pour le moment
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="period" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                          <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', borderColor: '#E5E7EB' }}
                            formatter={(value) => [`${value} TND`, 'Ventes']}
                          />
                          <Legend />
                          <Bar dataKey="sales" fill="#10B981" radius={[6, 6, 0, 0]} name="Ventes (TND)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Derniers utilisateurs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">👥 Derniers inscrits</h2>
                    <button onClick={() => setActiveTab('users')}
                      className="text-sm text-emerald-600 hover:underline font-medium">
                      Voir tous →
                    </button>
                  </div>
                  <UsersTable users={users.slice(0, 5)} roleStyle={roleStyle} />
                </div>
              </div>
            )}

            {/* ── Utilisateurs ── */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">
                    👥 Tous les utilisateurs ({users.length})
                  </h2>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchUser}
                      onChange={e => setSearchUser(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                      {users.filter(u => u.role === 'client').length} clients
                    </span>
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                      {users.filter(u => u.role === 'clinique').length} cliniques
                    </span>
                  </div>
                </div>
                <UsersTable users={filteredUsers} roleStyle={roleStyle} />
              </div>
            )}

            {/* ── Top produits ── */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">
                    📦 Produits les plus vendus
                  </h2>
                </div>
                {topProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    Aucune vente enregistrée pour le moment
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['#', 'Produit', 'Ventes', 'Revenu généré'].map(h => (
                            <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {topProducts.map((p, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-bold text-gray-400">{i + 1}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                            <td className="px-6 py-4 text-gray-700">
                              {p.sales.toLocaleString()} unités
                            </td>
                            <td className="px-6 py-4 font-semibold text-emerald-700">
                              {p.revenue}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {/* ── Produits expirés ── */}
{activeTab === 'expired' && (
  <ProductAlertTable
    title="🚫 Produits expirés"
    products={alertsSummary?.expired_products || []}
    emptyMessage="Aucun produit expiré."
    variant="red"
  />
)}

{/* ── Produits proches expiration ── */}
{activeTab === 'expiring' && (
  <ProductAlertTable
    title="⚠️ Produits proches de l’expiration"
    products={alertsSummary?.expiring_soon_products || []}
    emptyMessage="Aucun produit proche de l’expiration."
    variant="yellow"
  />
)}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function UsersTable({ users, roleStyle }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Nom', 'Email', 'Rôle', 'Clinique', 'Statut', 'Inscrit le'].map(h => (
              <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400">
                Aucun utilisateur trouvé
              </td>
            </tr>
          ) : users.map(u => (
            <tr key={u.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 font-medium text-gray-900">
                {u.first_name} {u.last_name}
              </td>
              <td className="px-6 py-4 text-gray-500">{u.email}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleStyle(u.role)}`}>
                  {u.role}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500 text-xs">
                {u.clinic_name || '—'}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {u.is_active ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500">
                {u.date_joined?.split('T')[0]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function ProductAlertTable({ title, products, emptyMessage, variant }) {
  const headerClass =
    variant === 'red'
      ? 'bg-red-50 text-red-700'
      : 'bg-yellow-50 text-yellow-700';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={headerClass}>
              <tr>
                <th className="text-left px-6 py-3">Produit</th>
                <th className="text-left px-6 py-3">Catégorie</th>
                <th className="text-left px-6 py-3">Expiration</th>
                <th className="text-right px-6 py-3">Stock</th>
                <th className="text-right px-6 py-3">Prix</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {product.name}
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {product.category_name || '—'}
                  </td>

                  <td className={`px-6 py-4 font-semibold ${
                    variant === 'red' ? 'text-red-600' : 'text-yellow-700'
                  }`}>
                    {product.expiration_date}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {product.stock}
                  </td>

                  <td className="px-6 py-4 text-right font-semibold text-emerald-700">
                    {product.price} TND
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}