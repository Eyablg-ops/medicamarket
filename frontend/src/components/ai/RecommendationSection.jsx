import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get_recommendations } from '../../api/ai';
import ProductCard from '../ProductCard';

export default function RecommendationSection({ products = [] }) {
  const [recommendations, set_recommendations] = useState([]);
  const [is_modal_open, set_is_modal_open] = useState(false);

  useEffect(() => {
    const load_recommendations = async () => {
      try {
        const last_search_query = localStorage.getItem('last_search_query') || '';
        const response = await get_recommendations(last_search_query);
        const data = response.data?.results || response.data || [];

        set_recommendations(
          data.length > 0 ? data : products
        );
      } catch (error) {
        console.error(error);
        set_recommendations(products);
      }
    };

    load_recommendations();
  }, [products]);

  const preview_recommendations = recommendations.slice(0, 3);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm lg:max-w-md">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              🤖 Recommandé pour vous
            </h2>
            <p className="text-xs text-gray-500">
              Selon vos recherches récentes
            </p>
          </div>

          <button
            type="button"
            onClick={() => set_is_modal_open(true)}
            className="text-xs font-semibold text-emerald-600 hover:underline"
          >
            Voir →
          </button>
        </div>

        <div className="flex gap-2 overflow-hidden">
          {preview_recommendations.map((product) => (
            <Link
              key={product.id}
              to={`/shop/${product.slug}`}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-emerald-50 p-2 hover:bg-emerald-100"
            >
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                {product.image ? (
                  <img
                    src={
                      product.image.startsWith('http')
                        ? product.image
                        : `http://localhost:8000${product.image}`
                    }
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-lg">
                    💊
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-gray-900">
                  {product.name}
                </p>
                <p className="text-xs font-bold text-emerald-700">
                  {product.price} TND
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {is_modal_open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  🤖 Toutes les recommandations
                </h2>
                <p className="text-sm text-gray-500">
                  Produits recommandés selon vos recherches récentes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => set_is_modal_open(false)}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                Fermer
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {recommendations.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}