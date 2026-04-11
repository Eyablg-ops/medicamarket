// src/pages/DashboardClinique.jsx  — Dashboard CLINIQUE
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DEMO_ORDERS = [
  { id: '#CLI-001', date: '10/04/2026', product: 'Gants stériles x500',  qty: 500, status: 'Livré',     amount: '340,00 TND' },
  { id: '#CLI-002', date: '09/04/2026', product: 'Masques FFP2 x200',    qty: 200, status: 'En cours',  amount: '210,00 TND' },
  { id: '#CLI-003', date: '07/04/2026', product: 'Seringues 10ml x1000', qty: 1000, status: 'En attente', amount: '180,00 TND' },
];

const DEMO_REQUESTS = [
  { product: 'Cathéters veineux x100', date: '11/04/2026', status: 'En traitement' },
  { product: 'Compresses stériles x500', date: '10/04/2026', status: 'Validée' },
];

const statusStyle = (s) => {
  if (s === 'Livré' || s === 'Validée')       return 'bg-emerald-100 text-emerald-700';
  if (s === 'En cours' || s === 'En traitement') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
};

export default function DashboardClinique() {
  const { user } = useAuth();
  const clinique = user?.clinique_profile;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour, {user?.first_name} 🏥
            </h1>
            <p className="text-gray-500 mt-1">
              {clinique?.clinic_name || 'Espace Clinique'} — Tableau de bord professionnel
            </p>
          </div>
          <div className="flex gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              clinique?.is_verified_clinic
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {clinique?.is_verified_clinic ? '✅ Clinique vérifiée' : '⏳ Vérification en attente'}
            </span>
          </div>
        </div>

        {/* ── Cartes résumé ── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-10">
          {[
            { icon: '📦', label: 'Commandes totales', value: DEMO_ORDERS.length,                              color: 'bg-emerald-50 border-emerald-200' },
            { icon: '✅', label: 'Livrées',           value: DEMO_ORDERS.filter(o => o.status === 'Livré').length,     color: 'bg-teal-50 border-teal-200' },
            { icon: '⏳', label: 'En cours',          value: DEMO_ORDERS.filter(o => o.status === 'En cours').length,  color: 'bg-amber-50 border-amber-200' },
            { icon: '📋', label: 'Demandes actives',  value: DEMO_REQUESTS.length,                           color: 'bg-purple-50 border-purple-200' },
          ].map((c, i) => (
            <div key={i} className={`rounded-2xl border p-5 ${c.color} flex items-center gap-4`}>
              <span className="text-2xl">{c.icon}</span>
              <div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Commandes en gros ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">📦 Historique des commandes en gros</h2>
            <button className="text-sm text-emerald-600 hover:underline font-medium">
              Nouvelle commande +
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['N° commande', 'Date', 'Produit', 'Quantité', 'Statut', 'Montant'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {DEMO_ORDERS.map((o, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-emerald-700">{o.id}</td>
                    <td className="px-6 py-4 text-gray-500">{o.date}</td>
                    <td className="px-6 py-4 text-gray-800">{o.product}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{o.qty.toLocaleString()}</td>
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

          {/* ── Demandes spécifiques ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">📋 Demandes spécifiques</h2>
            </div>
            <div className="p-6 space-y-3">
              {DEMO_REQUESTS.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{r.product}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(r.status)}`}>
                    {r.status}
                  </span>
                </div>
              ))}
              <button className="w-full mt-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition">
                + Nouvelle demande
              </button>
            </div>
          </section>

          {/* ── Infos établissement ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">🏥 Mon établissement</h2>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: 'Nom de la clinique',  value: clinique?.clinic_name       || '—' },
                { label: 'Matricule fiscal',    value: clinique?.matricule_fiscal  || '—' },
                { label: 'Responsable légal',   value: clinique?.responsable_name  || '—' },
                { label: 'Spécialité',          value: clinique?.specialty         || '—' },
                { label: 'Ville',               value: clinique?.city              || '—' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
              <Link
                to="/profile"
                className="block text-center mt-4 bg-emerald-50 text-emerald-700 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 transition"
              >
                Modifier mes informations →
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}