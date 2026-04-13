import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '', password: '', password_confirm: '',
    first_name: '', last_name: '', phone: '',
    role: 'client',
    clinic_name: '', tax_id: '', responsible_name: '', clinic_address: '',
    gdpr_consent: false,
  });
  const [clinicLogo, setClinicLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setClinicLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Utiliser FormData pour envoyer le logo
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        data.append(k, v);
      });
      if (clinicLogo) {
        data.append('clinic_logo', clinicLogo);
      }

      const result = await register(data);
      const role = result?.user?.role || formData.role;
      if (role === 'admin')         navigate('/admin/dashboard');
      else if (role === 'clinique') navigate('/clinique/dashboard');
      else                          navigate('/dashboard');
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        const firstError = Object.values(errors).flat()[0];
        setError(typeof firstError === 'string' ? firstError : "Erreur d'inscription");
      } else {
        setError('Erreur serveur');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-emerald-700 mb-6">
          Inscription — MedicaMarket
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Type de compte</label>
            <select name="role" value={formData.role} onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none">
              <option value="client">👤 Patient / Client</option>
              <option value="clinique">🏥 Clinique / Établissement</option>
            </select>
          </div>

          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input name="first_name" value={formData.first_name} onChange={handleChange}
                required className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input name="last_name" value={formData.last_name} onChange={handleChange}
                required className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              required className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Téléphone</label>
            <input name="phone" value={formData.phone} onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>

          {/* Mot de passe */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input type="password" name="password" value={formData.password}
                onChange={handleChange} required minLength={8}
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmer</label>
              <input type="password" name="password_confirm" value={formData.password_confirm}
                onChange={handleChange} required
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
          </div>

          {/* Champs clinique */}
          {formData.role === 'clinique' && (
            <div className="border-t pt-4 space-y-4">
              <h3 className="font-semibold text-emerald-700">🏥 Informations clinique</h3>

              <input name="clinic_name" placeholder="Nom de la clinique *"
                value={formData.clinic_name} onChange={handleChange} required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />

              <input name="tax_id" placeholder="Matricule fiscal *"
                value={formData.tax_id} onChange={handleChange} required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />

              <input name="responsible_name" placeholder="Nom du responsable *"
                value={formData.responsible_name} onChange={handleChange} required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />

              <textarea name="clinic_address" placeholder="Adresse de la clinique"
                value={formData.clinic_address} onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                rows={2} />

              {/* Upload logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🖼️ Logo de la clinique
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-emerald-400 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="clinic-logo"
                  />
                  <label htmlFor="clinic-logo" className="cursor-pointer block">
                    {logoPreview ? (
                      <div className="flex items-center gap-4 justify-center">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-20 w-20 object-cover rounded-xl border-2 border-emerald-300"
                        />
                        <div className="text-left">
                          <p className="text-sm font-medium text-emerald-600">✅ Logo sélectionné</p>
                          <p className="text-xs text-gray-400">{clinicLogo?.name}</p>
                          <p className="text-xs text-blue-500 mt-1 underline">Cliquer pour changer</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-3">
                        <p className="text-3xl mb-1">🏥</p>
                        <p className="text-gray-500 text-sm font-medium">
                          Ajouter le logo de votre clinique
                        </p>
                        <p className="text-gray-400 text-xs mt-1">JPG, PNG — optionnel</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* RGPD */}
          <div className="flex items-start gap-2">
            <input type="checkbox" name="gdpr_consent" checked={formData.gdpr_consent}
              onChange={handleChange} required className="mt-1" />
            <label className="text-sm text-gray-600">
              J'accepte la <a href="/privacy" className="text-emerald-600 underline">
              politique de confidentialité</a> et le traitement de mes données.
            </label>
          </div>

          <button type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-medium">
            Créer mon compte
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Déjà inscrit ? <Link to="/login" className="text-emerald-600 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}