import { useState } from 'react';
import { send_chat_message } from '../../api/ai';

export default function ChatbotWidget() {
  const [is_open, set_is_open] = useState(false);
  const [input_value, set_input_value] = useState('');
  const [messages, set_messages] = useState([
    {
      role: 'assistant',
      content: 'Bonjour 👋 Je suis l’assistant MedicaMarket.',
    },
  ]);
  const [is_loading, set_is_loading] = useState(false);

  const handle_submit = async (event) => {
    event.preventDefault();

    const trimmed_value = input_value.trim();
    if (!trimmed_value || is_loading) {
      return;
    }

    const user_message = {
      role: 'user',
      content: trimmed_value,
    };

    const updated_messages = [...messages, user_message];
    set_messages(updated_messages);
    set_input_value('');
    set_is_loading(true);

    try {
      const history = updated_messages
        .slice(-6, -1)
        .map((message) => ({
        role: message.role,
        content: message.content,
  }));

      const response = await send_chat_message({
        message: trimmed_value,
        history,
      });

      set_messages((previous_messages) => [
        ...previous_messages,
        {
          role: 'assistant',
          content: response.data.reply,
        },
      ]);
    } catch (error) {
      set_messages((previous_messages) => [
        ...previous_messages,
        {
          role: 'assistant',
          content: 'Le chatbot est momentanément indisponible.',
        },
      ]);
    } finally {
      set_is_loading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => set_is_open((previous_state) => !previous_state)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-emerald-600 px-5 py-4 text-white shadow-xl transition hover:bg-emerald-700"
      >
        💬
      </button>

      {is_open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="bg-emerald-600 px-4 py-3 text-white">
            <h3 className="font-semibold">Assistant MedicaMarket</h3>
            <p className="text-xs text-emerald-100">
              Recherche produit et aide rapide
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  message.role === 'user'
                    ? 'ml-auto bg-emerald-600 text-white'
                    : 'bg-white text-gray-800 shadow-sm'
                }`}
              >
                {message.content}
              </div>
            ))}

            {is_loading && (
              <div className="max-w-[85%] rounded-2xl bg-white px-4 py-2 text-sm text-gray-500 shadow-sm">
                Écriture en cours...
              </div>
            )}
          </div>

          <form onSubmit={handle_submit} className="border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input_value}
                onChange={(event) => set_input_value(event.target.value)}
                placeholder="Posez votre question..."
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={is_loading}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                Envoyer
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}