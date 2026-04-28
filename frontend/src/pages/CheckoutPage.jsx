import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { checkout } from '../api/orders';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axiosInstance from '../api/axiosInstance';
import ChatbotWidget from '../components/ai/ChatbotWidget';
export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=adresse, 2=carte, 3=otp, 4=succès
  const [order, setOrder] = useState(null);
  const [otpDemo, setOtpDemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    address: '', city: '', phone: ''
  });

  const [card, setCard] = useState({
    number: '', name: '', expiry: '', cvv: ''
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // ── ÉTAPE 1 : Créer la commande ──
  const handleCreateOrder = async () => {
    if (!form.address || !form.city || !form.phone) {
      setError('Tous les champs sont requis');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await checkout(form);
      setOrder(res.data);
      await refreshCart();
      setStep(2);
    } catch {
      setError('Erreur lors de la création de la commande.');
    } finally {
      setLoading(false);
    }
  };

  // ── ÉTAPE 2 : Valider la carte et envoyer OTP ──
  const handleCardSubmit = async () => {
    if (!card.number || !card.name || !card.expiry || !card.cvv) {
      setError('Tous les champs carte sont requis');
      return;
    }
    if (card.number.replace(/\s/g, '').length < 16) {
      setError('Numéro de carte invalide');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.post('/payments/initiate/', {
        order_id: order.id
      });
      setOtpDemo(res.data.otp_demo);
      setStep(3);
    } catch {
      setError('Erreur lors de l\'envoi de l\'OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── ÉTAPE 3 : Vérifier OTP ──
  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Entrez le code à 6 chiffres');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/payments/verify-otp/', {
        order_id: order.id,
        otp: otpValue,
      });
      setStep(4);
      setTimeout(() => navigate('/orders'), 3000);
    } catch (e) {
      setError(e.response?.data?.error || 'Code OTP incorrect');
    } finally {
      setLoading(false);
    }
  };

  // Formater numéro carte
  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').slice(0, 16)
      .replace(/(.{4})/g, '$1 ').trim();
  };

  // Gérer saisie OTP
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8">

        {/* Indicateur étapes */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { n: 1, label: 'Livraison' },
            { n: 2, label: 'Carte' },
            { n: 3, label: 'OTP' },
            { n: 4, label: 'Confirmé' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  step > s.n ? 'bg-green-500 text-white' :
                  step === s.n ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className="text-xs text-gray-500 mt-1">{s.label}</span>
              </div>
              {i < 3 && (
                <div className={`w-8 h-0.5 mx-1 mb-4 ${step > s.n ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* ── ÉTAPE 1 : Adresse ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-lg mb-4">📦 Adresse de livraison</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Adresse complète *"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input type="text" placeholder="Ville *"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input type="text" placeholder="Téléphone *"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Récap panier */}
            {cart && (
              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <h3 className="font-semibold text-sm mb-2">🧾 Récapitulatif</h3>
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{item.product.name} × {item.quantity}</span>
                    <span>{item.subtotal} TND</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{cart.total} TND</span>
                </div>
              </div>
            )}

            <button onClick={handleCreateOrder} disabled={loading}
              className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? '⏳...' : 'Continuer →'}
            </button>
          </div>
        )}

        {/* ── ÉTAPE 2 : Carte bancaire ── */}
        {step === 2 && order && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-lg mb-1">💳 Informations de paiement</h2>
            <p className="text-gray-500 text-sm mb-4">
              Montant : <strong className="text-blue-600">{order.total_amount} TND</strong>
            </p>

            {/* Carte visuelle */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white mb-5 shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <span className="text-sm opacity-75">MedicaMarket Pay</span>
                <div className="flex gap-1">
                  <div className="w-7 h-7 bg-yellow-400 rounded-full opacity-90"></div>
                  <div className="w-7 h-7 bg-yellow-600 rounded-full opacity-70 -ml-3"></div>
                </div>
              </div>
              <p className="text-xl font-mono tracking-widest mb-4">
                {card.number || '•••• •••• •••• ••••'}
              </p>
              <div className="flex justify-between text-sm">
                <span>{card.name || 'NOM PRÉNOM'}</span>
                <span>{card.expiry || 'MM/AA'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Numéro de carte *"
                value={card.number}
                onChange={e => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                maxLength={19}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Nom sur la carte *"
                value={card.name}
                onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM/AA *"
                  value={card.expiry}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                    if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                    setCard({ ...card, expiry: v });
                  }}
                  maxLength={5}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="CVV *"
                  value={card.cvv}
                  onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                  maxLength={3}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button onClick={handleCardSubmit} disabled={loading}
              className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? '⏳ Envoi OTP...' : `🔒 Payer ${order.total_amount} TND`}
            </button>

            <p className="text-xs text-center text-gray-400 mt-3">
              🔒 Paiement sécurisé — Simulation académique
            </p>
          </div>
        )}

        {/* ── ÉTAPE 3 : OTP ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <div className="text-5xl mb-3">📱</div>
            <h2 className="font-bold text-xl mb-1">Vérification OTP</h2>
            <p className="text-gray-500 text-sm mb-2">
              Un code a été envoyé à votre téléphone
            </p>

            {/* Afficher OTP en mode démo */}
            {otpDemo && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-yellow-600 font-medium">
                  🧪 Mode démonstration — Code OTP :
                </p>
                <p className="text-2xl font-bold text-yellow-700 tracking-widest mt-1">
                  {otpDemo}
                </p>
              </div>
            )}

            {/* Saisie OTP */}
            <div className="flex gap-2 justify-center mb-5">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(index, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              ))}
            </div>

            <button onClick={handleVerifyOtp} disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50">
              {loading ? '⏳ Vérification...' : '✅ Confirmer le paiement'}
            </button>

            <button onClick={() => { setOtp(['','','','','','']); handleCardSubmit(); }}
              className="w-full mt-2 text-blue-600 text-sm hover:underline">
              🔄 Renvoyer le code
            </button>
          </div>
        )}

        {/* ── ÉTAPE 4 : Succès ── */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Paiement confirmé !
            </h2>
            <p className="text-gray-500 mb-2">
              Commande #{order?.id} payée avec succès
            </p>
            <p className="text-3xl font-bold text-blue-600 mb-4">
              {order?.total_amount} TND
            </p>
            <p className="text-sm text-gray-400">
              Redirection vers vos commandes...
            </p>
          </div>
        )}

      </div>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}