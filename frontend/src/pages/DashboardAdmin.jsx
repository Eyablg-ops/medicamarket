// src/pages/DashboardAdmin.jsx  — Dashboard ADMIN
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  ResponsiveContainer, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

const DEMO_STATS = {
  total_stock:     11800,
  remaining_stock:  6200,
  quantity_sold:    5600,
  total_revenue:  182400,
};

const DEMO_SALES = [
  { period: 'Jan', sales: 11000 },
  { period: 'Fév', sales: 13500 },
  { period: 'Mar', sales: 16500 },
  { period: 'Avr', sales: 17800 },
  { period: 'Mai', sales: 16200 },
  { period: 'Juin', sales: 18500 },
];

const DEMO_USERS = [
  { id: 1, email: 'emna@test.com',    first_name: 'Emna',    last_name: 'Ben Ali',   role: 'client',   is_active: true,  date_joined: '2026-04-01' },
  { id: 2, email: 'clinique@test.com', first_name: 'Mohamed', last_name: 'Ben Youssef', role: 'clinique', is_active: true,  date_joined: '2026-04-05' },
  { id: 3, email: 'sara@test.com',    first_name: 'Sara',    last_name: 'Trabelsi',  role: 'client',   is_active: true,  date_joined: '2026-04-08' },
];

const DEMO_TOP_PRODUCTS = [
  { name: 'Gants stériles x100', sales: 1240, revenue: '8 680 TND' },
  { name: 'Masques FFP2 x50',    sales:  890, revenue: '4 450 TND' },
  { name: 'Seringues 5ml x500',  sales:  670, revenue: '3 350 TND' },
];

const roleStyle = (role) => {
  if (role === 'admin')    return 'bg-red-100 text-red-700';
  if (role === 'clinique') return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
};

export default function DashboardAdmin() {
  const { user } = useAuth();
  const [stats,       setStats]       = useState(DEMO_STATS);
  const [salesData,   setSalesData]   = useState(DEMO_SALES);
  const [users,       setUsers]       = useState(DEMO_USERS);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState('overview');

  useEffect(() => {
    async function load() {
      try {
        const r = await API.get('/admin/users/');
        setUsers(r.data.users || DEMO_USERS);
        setStats(r.data.stats || DEMO_STATS);
        setSalesData(r.data.sales_history || DEMO_SALES);
      } catch {
        // Utilise les données de démo
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const TABS = [
    { key: 'overview', label: '📊 Vue d\'ensemble' },
    { key: 'users',    label: '👥 Utilisateurs' },
    { key: 'products', label: '📦 Produits top' },
  ];

  const KPI = [
    { label: 'Total Stock',      value: stats.total_stock?.toLocaleString(),              icon: '📦', color: 'bg-sky-50 border-sky-200',     text: 'text-sky-700' },
    { label: 'Stock restant',    value: stats.remaining_stock?.toLocaleString(),           icon: '✅', color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
    { label: 'Quantité vendue',  value: stats.quantity_sold?.toLocaleString(),             icon: '🛒', color: 'bg-violet-50 border-violet-200', text: 'text-violet-700' },
    { label: 'Revenu total',     value: `${stats.total_revenue?.toLocaleString()} TND`,   icon: '💰', color: 'bg-amber-50 border-amber-200',  text: 'text-amber-700' },
    { label: 'Utilisateurs',     value: users.length,                                     icon: '👥', color: 'bg-pink-50 border-pink-200',    text: 'text-pink-700' },
    { label: 'Cliniques',        value: users.filter(u => u.role === 'clinique').length,   icon: '🏥', color: 'bg-teal-50 border-teal-200',    text: 'text-teal-700' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">

        {/* ── Header ── */}
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

        {/* ── Onglets ── */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-3 text-sm font-medium rounded-t-lg transition border-b-2 -mb-px ${
                activeTab === t.key
                  ? 'border-emerald-600 text-emerald-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Vue d'ensemble ── */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {KPI.map((k, i) => (
                <div key={i} className={`rounded-2xl border p-4 ${k.color}`}>
                  <div className="text-2xl mb-2">{k.icon}</div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{k.label}</p>
                  <p className={`text-xl font-bold ${k.text}`}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Graphique */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Évolution des ventes</p>
                  <h2 className="text-xl font-bold text-gray-900">Performance mensuelle</h2>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
                  Dernières données actualisées
                </span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="period" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#E5E7EB' }} />
                    <Legend />
                    <Bar dataKey="sales" fill="#10B981" radius={[6, 6, 0, 0]} name="Ventes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Derniers utilisateurs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">👥 Derniers inscrits</h2>
                <button onClick={() => setActiveTab('users')} className="text-sm text-emerald-600 hover:underline font-medium">
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
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                👥 Tous les utilisateurs ({users.length})
              </h2>
              <div className="flex gap-2 text-sm">
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                  {users.filter(u => u.role === 'client').length} clients
                </span>
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                  {users.filter(u => u.role === 'clinique').length} cliniques
                </span>
              </div>
            </div>
            <UsersTable users={users} roleStyle={roleStyle} />
          </div>
        )}

        {/* ── Top produits ── */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">📦 Produits les plus vendus</h2>
            </div>
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
                  {DEMO_TOP_PRODUCTS.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-gray-400">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                      <td className="px-6 py-4 text-gray-700">{p.sales.toLocaleString()} unités</td>
                      <td className="px-6 py-4 font-semibold text-emerald-700">{p.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Sous-composant tableau utilisateurs
function UsersTable({ users, roleStyle }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Nom', 'Email', 'Rôle', 'Statut', 'Inscrit le'].map(h => (
              <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map((u) => (
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
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {u.is_active ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500">{u.date_joined?.split('T')[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}