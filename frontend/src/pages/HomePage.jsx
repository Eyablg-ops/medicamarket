// src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FEATURES = [
  {
    icon: '✅',
    title: 'Produits certifiés',
    desc: 'Tous nos produits sont conformes aux normes médicales et vérifiés par nos experts.',
  },
  {
    icon: '🚚',
    title: 'Livraison rapide',
    desc: 'Recevez vos commandes en 24-48h partout dans le pays, avec suivi en temps réel.',
  },
  {
    icon: '🏥',
    title: 'Pour les cliniques',
    desc: 'Tarifs dégressifs, commandes en gros et gestion simplifiée pour les professionnels.',
  },
  {
    icon: '🔒',
    title: 'Données sécurisées',
    desc: 'Vos données médicales sont protégées. Conformité RGPD garantie.',
  },
  {
    icon: '💊',
    title: '+10 000 produits',
    desc: 'Médicaments, matériel médical, consommables — tout en un seul endroit.',
  },
  {
    icon: '📞',
    title: 'Support 7j/7',
    desc: 'Notre équipe médicale est disponible pour vous accompagner à tout moment.',
  },
];

const STATS = [
  { value: '500+', label: 'Cliniques partenaires' },
  { value: '10k+', label: 'Produits disponibles' },
  { value: '48h',  label: 'Délai de livraison max' },
  { value: '99%',  label: 'Clients satisfaits' },
];

const STEPS = [
  { n: '01', title: 'Créez votre compte', desc: 'Patient ou clinique, l\'inscription prend moins de 2 minutes.' },
  { n: '02', title: 'Choisissez vos produits', desc: 'Parcourez notre catalogue de +10 000 produits certifiés.' },
  { n: '03', title: 'Commandez en toute confiance', desc: 'Paiement sécurisé et suivi de commande en temps réel.' },
  { n: '04', title: 'Recevez rapidement', desc: 'Livraison express partout en Tunisie en 24 à 48 heures.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white py-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-2 rounded-full mb-8 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Marketplace médicale certifiée — Tunisie
          </span>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Vos produits médicaux,{' '}
            <span className="text-emerald-600">livrés simplement</span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Patients et cliniques, accédez à des milliers de produits médicaux certifiés.
            Commandez en toute confiance, recevez rapidement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
            >
              Commencer gratuitement →
            </Link>
            <Link
              to="/login"
              className="bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold border border-gray-200 hover:border-emerald-300 hover:text-emerald-700 transition"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-emerald-700 py-12 px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <div key={i}>
              <div className="text-4xl font-extrabold text-white mb-1">{s.value}</div>
              <div className="text-emerald-200 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3">
              Pourquoi nous choisir
            </p>
            <h2 className="text-4xl font-bold text-gray-900">
              Tout ce dont vous avez besoin
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl mb-5">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3">
              Simple et rapide
            </p>
            <h2 className="text-4xl font-bold text-gray-900">Comment ça marche ?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-5 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="text-3xl font-extrabold text-emerald-100 select-none flex-shrink-0">
                  {step.n}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{step.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 px-8 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Rejoignez MedicaMarket aujourd'hui
          </h2>
          <p className="text-emerald-100 text-lg mb-10">
            Que vous soyez patient ou clinique, créez votre compte en quelques secondes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register?role=client"
              className="bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-50 transition flex items-center gap-2 justify-center"
            >
              👤 Je suis patient
            </Link>
            <Link
              to="/register?role=clinique"
              className="bg-emerald-800 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-900 transition border border-emerald-400 flex items-center gap-2 justify-center"
            >
              🏥 Je suis une clinique
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}