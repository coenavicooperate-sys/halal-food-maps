/**
 * Displays Halal Food Maps, Google, and Tabelog review scores/counts
 * siteReviews: { score, count } - サイト独自の口コミがあれば HFM の表示を上書き
 */
export function RestaurantRatings({ restaurant, compact = false, siteReviews }) {
  const reviews = restaurant?.reviews;
  const halalFoodMaps = siteReviews?.count > 0
    ? { score: siteReviews.score, count: siteReviews.count }
    : reviews?.halalFoodMaps;
  const google = reviews?.google;
  const tabelog = reviews?.tabelog;

  if (!halalFoodMaps && !google && !tabelog) return null;

  const RatingItem = ({ label, score, count }) => (
    <span className="flex items-center gap-1">
      <span className="text-slate-500 text-[10px]">{label}:</span>
      <span className="font-semibold text-slate-800">{score}</span>
      <span className="text-slate-500 text-[10px]">({count})</span>
    </span>
  );

  if (compact) {
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
        {halalFoodMaps && <RatingItem label="HFM" score={halalFoodMaps.score} count={halalFoodMaps.count} />}
        {google && <RatingItem label="Google" score={google.score} count={google.count} />}
        {tabelog && <RatingItem label="Tabelog" score={tabelog.score} count={tabelog.count} />}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {halalFoodMaps && (
        <div>
          <span className="text-slate-500">Halal Food Maps</span>
          <span className="ml-1 font-semibold text-slate-800">{halalFoodMaps.score}</span>
          <span className="text-slate-500 ml-0.5">({halalFoodMaps.count})</span>
        </div>
      )}
      {google && (
        <div>
          <span className="text-slate-500">Google</span>
          <span className="ml-1 font-semibold text-slate-800">{google.score}</span>
          <span className="text-slate-500 ml-0.5">({google.count})</span>
        </div>
      )}
      {tabelog && (
        <div>
          <span className="text-slate-500">Tabelog</span>
          <span className="ml-1 font-semibold text-slate-800">{tabelog.score}</span>
          <span className="text-slate-500 ml-0.5">({tabelog.count})</span>
        </div>
      )}
    </div>
  );
}
