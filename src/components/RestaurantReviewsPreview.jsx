import { useRestaurantReviews } from '../hooks/useRestaurantReviews';

function StarRating({ value }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-0.5">
      {stars.map((s) => (
        <span key={s} className={`text-lg ${s <= value ? 'text-amber-400' : 'text-slate-200'}`}>
          ★
        </span>
      ))}
    </div>
  );
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export function RestaurantReviewsPreview({ areaId, restaurantSlug, onViewAll }) {
  const { reviews, loading, count } = useRestaurantReviews(areaId, restaurantSlug);
  const previewCount = 5;
  const displayReviews = reviews.slice(0, previewCount);

  if (!areaId || !restaurantSlug) return null;
  if (loading || count === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
        <span>💬</span> Recent reviews
      </h2>
      <div className="space-y-3">
        {displayReviews.map((r) => (
          <div key={r.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-medium text-slate-800 text-sm">{r.author_name || 'Anonymous'}</span>
              <span className="text-xs text-slate-500">{formatDate(r.created_at)}</span>
            </div>
            <div className="mb-1">
              <StarRating value={r.rating} />
            </div>
            {r.comment && <p className="text-sm text-slate-600 line-clamp-2">{r.comment}</p>}
            {r.photos && r.photos.length > 0 && (
              <div className="flex gap-1 mt-2">
                {r.photos.slice(0, 3).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="w-12 h-12 object-cover rounded border border-slate-200"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {count > previewCount && (
        <button
          type="button"
          onClick={onViewAll}
          className="mt-3 w-full py-2.5 rounded-lg border border-emerald-600 text-emerald-600 font-medium text-sm hover:bg-emerald-50 transition-colors"
        >
          View all {count} reviews
        </button>
      )}
      {count <= previewCount && count > 0 && (
        <button
          type="button"
          onClick={onViewAll}
          className="mt-3 w-full py-2.5 rounded-lg border border-emerald-600 text-emerald-600 font-medium text-sm hover:bg-emerald-50 transition-colors"
        >
          View all reviews & post one
        </button>
      )}
    </section>
  );
}
