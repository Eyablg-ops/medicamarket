import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get_recommendations } from '../../api/ai';

export default function RecommendationSection() {
  const [recommendations, set_recommendations] = useState([]);

  useEffect(() => {
    const load_recommendations = async () => {
      try {
        const last_search_query = localStorage.getItem('last_search_query') || '';
        const response = await get_recommendations(last_search_query);
        set_recommendations((response.data || []).slice(0, 3));
      } catch (error) {
        console.error(error);
        set_recommendations([]);
      }
    };

    load_recommendations();
  }, []);

  if (recommendations.length === 0) {
    return null;
  }

  return (
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

        <Link
          to="/shop"
          className="text-xs font-semibold text-emerald-600 hover:underline"
        >
          Voir →
        </Link>
      </div>

      <div className="flex gap-2 overflow-hidden">
        {recommendations.map((product) => (
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
  );
}