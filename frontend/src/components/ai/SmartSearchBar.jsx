import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get_search_suggestions } from '../../api/ai';

export default function SmartSearchBar({ value, on_change }) {
  const [suggestions, set_suggestions] = useState([]);
  const [is_loading, set_is_loading] = useState(false);
  const [is_open, set_is_open] = useState(false);

  useEffect(() => {
    const trimmed_value = value.trim();

    if (trimmed_value.length < 2) {
      set_suggestions([]);
      set_is_open(false);
      return;
    }

    const timeout_id = setTimeout(async () => {
      try {
        set_is_loading(true);
        const response = await get_search_suggestions(trimmed_value);
        set_suggestions(response.data || []);
        set_is_open(true);
      } catch (error) {
        console.error(error);
        set_suggestions([]);
        set_is_open(false);
      } finally {
        set_is_loading(false);
      }
    }, 300);

    return () => clearTimeout(timeout_id);
  }, [value]);

  return (
    <div className="relative w-full max-w-xl">
      <input
        type="text"
        value={value}
        onChange={(event) => on_change(event.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) {
            set_is_open(true);
          }
        }}
        placeholder="Rechercher un médicament, une catégorie..."
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
      />

      {is_open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          {is_loading && (
            <div className="px-4 py-3 text-sm text-gray-500">
              Recherche en cours...
            </div>
          )}

          {!is_loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-400">
              Aucun résultat trouvé
            </div>
          )}

          {!is_loading &&
            suggestions.map((item) => (
              <Link
                key={item.id}
                to={`/shop/${item.slug}`}
                onClick={() => set_is_open(false)}
                className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50"
              >
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border bg-white">
                  {item.image ? (
                    <img
                      src={
                        item.image.startsWith('http')
                          ? item.image
                          : `http://localhost:8000${item.image}`
                      }
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl">
                      💊
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.category_name} · {item.price} TND
                  </p>
                  <p className="text-xs text-emerald-600">{item.reason}</p>
                </div>

                {item.is_expiring_soon && !item.is_expired && (
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                    Expire bientôt
                  </span>
                )}
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}