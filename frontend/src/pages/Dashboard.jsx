// src/pages/Dashboard.jsx  — Dashboard CLIENT
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Données de démo — à remplacer par de vraies API plus tard
const DEMO_ORDERS = [
  { id: '#ORD-001', date: '10/04/2026', product: 'Paracétamol 500mg x30', status: 'Livré',     amount: '12,00 TND' },
  { id: '#ORD-002', date: '08/04/2026', product: 'Tensiomètre digital',    status: 'En cours',  amount: '89,00 TND' },
  { id: '#ORD-003', date: '05/04/2026', product: 'Masques FFP2 x10',       status: 'Livré',     amount: '25,00 TND' },
];

const DEMO_FAVORITES = [
  { name: 'Paracétamol 500mg', category: 'Médicaments', price: '3,50 TND',  icon: '💊' },
  { name: 'Tensiomètre digital', category: 'Matériel',  price: '89,00 TND', icon: '🩺' },
  { name: 'Vitamine C 1000mg',  category: 'Compléments', price: '18,00 TND', icon: '🍊' },
];

const DEMO_RECOMMENDATIONS = [
  { name: 'Oméprazole 20mg',    category: 'Médicaments',  price: '8,00 TND',  icon: '💊' },
  { name: 'Thermomètre infrarouge', category: 'Matériel', price: '45,00 TND', icon: '🌡️' },
  { name: 'Vitamine D3',        category: 'Compléments',  price: '22,00 TND', icon: '☀️' },
  { name: 'Crème antiseptique', category: 'Soins',        price: '6,50 TND',  icon: '🧴' },
];

const statusStyle = (s) => {
  if (s === 'Livré')    return 'bg-emerald-100 text-emerald-700';
  if (s === 'En cours') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
};

export default function Dashboard() {
  const { user } = useAuth();
  const [orders,          setOrders]          = useState(DEMO_ORDERS);
  const [favorites,       setFavorites]       = useState(DEMO_FAVORITES);
  const [recommendations, setRecommendations] = useState(DEMO_RECOMMENDATIONS);

  useEffect(() => {
    // Charger les vraies données quand les endpoints sont prêts
    // API.get('/orders/').then(r => setOrders(r.data)).catch(() => {});
    // API.get('/favorites/').then(r => setFavorites(r.data)).catch(() => {});
  }, []);

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {[
            { icon: '🛒', label: 'Commandes total',  value: orders.length,                          color: 'bg-emerald-50 border-emerald-200' },
            { icon: '✅', label: 'Commandes livrées', value: orders.filter(o => o.status === 'Livré').length, color: 'bg-teal-50 border-teal-200' },
            { icon: '⏳', label: 'En cours',          value: orders.filter(o => o.status === 'En cours').length, color: 'bg-amber-50 border-amber-200' },
          ].map((c, i) => (
            <div key={i} className={`rounded-2xl border p-6 ${c.color} flex items-center gap-4`}>
              <span className="text-3xl">{c.icon}</span>
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Dernières commandes ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">🛒 Mes dernières commandes</h2>
            <Link to="/mes-commandes" className="text-sm text-emerald-600 hover:underline font-medium">
              Voir tout →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['N° commande', 'Date', 'Produit', 'Statut', 'Montant'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-emerald-700">{o.id}</td>
                    <td className="px-6 py-4 text-gray-500">{o.date}</td>
                    <td className="px-6 py-4 text-gray-800">{o.product}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{o.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Produits favoris ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">❤️ Mes favoris</h2>
            </div>
            <div className="p-6 space-y-3">
              {favorites.map((f, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                  <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {f.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{f.name}</p>
                    <p className="text-xs text-gray-400">{f.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-700">{f.price}</p>
                    <button className="text-xs text-red-400 hover:text-red-600 transition">Retirer</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Recommandations ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">✨ Recommandé pour vous</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              {recommendations.map((r, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition cursor-pointer">
                  <div className="text-2xl mb-2">{r.icon}</div>
                  <p className="font-medium text-gray-900 text-sm leading-snug">{r.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.category}</p>
                  <p className="text-emerald-600 font-bold text-sm mt-2">{r.price}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}