// src/components/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-auto">
      <div className="max-w-6xl mx-auto px-8">

        {/* Grille principale */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Marque */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏥</span>
              <span className="text-white font-bold text-lg">MedicaMarket</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              La marketplace médicale de confiance en Tunisie. Produits certifiés, livraison rapide.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Facebook</a>
              <span className="text-gray-600">·</span>
              <a href="#" className="text-gray-400 hover:text-white text-sm">LinkedIn</a>
              <span className="text-gray-600">·</span>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Twitter</a>
            </div>
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">
              Plateforme
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-white transition">Accueil</Link></li>
              <li><Link to="/register" className="text-gray-400 hover:text-white transition">S'inscrire</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-white transition">Se connecter</Link></li>
            </ul>
          </div>

          {/* Mon compte */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">
              Mon compte
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="text-gray-400 hover:text-white transition">Mon profil</Link></li>
              <li><Link to="/mon-compte/rgpd" className="text-gray-400 hover:text-white transition">Mes données (RGPD)</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📧 contact@medicamarket.tn</li>
              <li>📞 +216 71 000 000</li>
              <li>📍 Tunis, Tunisie</li>
            </ul>
          </div>
        </div>

        {/* Barre basse */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <p>© {year} MedicaMarket. Tous droits réservés.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300 transition">Politique de confidentialité</a>
            <a href="#" className="hover:text-gray-300 transition">Conditions d'utilisation</a>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span>
              SSL Sécurisé · RGPD Conforme
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}