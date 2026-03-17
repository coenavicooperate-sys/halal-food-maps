import { useMemo, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { HALAL_LEVELS, CATEGORIES } from '../data/restaurants';
import { getAreaById, getRestaurantPath, getLPPath } from '../data/areas';
import { getLPDescription } from '../lib/lpDescription';
import { RestaurantRatings } from './RestaurantRatings';

/** Build page title and H1 from filters */
function getLPTitle(area, categoryId, halalLevelId) {
  const areaName = area?.name || '';
  const catLabel = categoryId && CATEGORIES[categoryId] ? CATEGORIES[categoryId].label : null;
  const halalLabel = halalLevelId && HALAL_LEVELS[halalLevelId] ? HALAL_LEVELS[halalLevelId].label : null;

  if (catLabel && halalLabel) {
    return { h1: `${halalLabel} ${catLabel} in ${areaName}`, title: `${halalLabel} ${catLabel} in ${areaName} | Halal Food Maps` };
  }
  if (catLabel) {
    return { h1: `Halal ${catLabel} in ${areaName}`, title: `Halal ${catLabel} in ${areaName} | Halal Food Maps` };
  }
  if (halalLabel) {
    return { h1: `${halalLabel} Restaurants in ${areaName}`, title: `${halalLabel} Restaurants in ${areaName} | Halal Food Maps` };
  }
  return { h1: `Halal Restaurants in ${areaName}`, title: `Halal Restaurants in ${areaName} | Halal Food Maps` };
}

export function DynamicLPPage({ categoryId, halalLevelId }) {
  const { areaId } = useParams();
  const area = getAreaById(areaId || 'shibuya');

  const filteredRestaurants = useMemo(() => {
    if (!area) return [];
    return area.restaurants
      .filter((r) => {
        if (categoryId && r.category !== categoryId) return false;
        if (halalLevelId && r.halalLevel !== halalLevelId) return false;
        return true;
      })
      .sort((a, b) => {
        const scoreA = a.reviews?.halalFoodMaps?.score ?? 0;
        const scoreB = b.reviews?.halalFoodMaps?.score ?? 0;
        return scoreB - scoreA;
      });
  }, [area, categoryId, halalLevelId]);

  const { h1, title } = useMemo(
    () => getLPTitle(area, categoryId, halalLevelId),
    [area, categoryId, halalLevelId]
  );

  const isEmpty = filteredRestaurants.length === 0;
  const metaDescription = useMemo(
    () => getLPDescription(area, categoryId, halalLevelId, filteredRestaurants),
    [area, categoryId, halalLevelId, filteredRestaurants]
  );

  useEffect(() => {
    document.title = title;
    return () => { document.title = 'Halal Food Maps'; };
  }, [title]);

  // メタディスクリプション（DB集計に基づく差別化テキスト）+ og:description
  useEffect(() => {
    if (!metaDescription) return;
    const defaultDesc = 'Discover halal-friendly restaurants in Tokyo.';
    const metas = [
      { selector: 'meta[name="description"]', name: 'description', attr: 'name' },
      { selector: 'meta[property="og:description"]', name: 'og:description', attr: 'property' },
    ];
    const prevs = metas.map(({ selector, name, attr }) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute('content');
      el.setAttribute('content', metaDescription);
      return { selector, prev };
    });
    return () => {
      prevs.forEach(({ selector, prev }) => {
        document.querySelector(selector)?.setAttribute('content', prev || defaultDesc);
      });
    };
  }, [metaDescription]);

  // 空ページ対策: noindex + リダイレクト（生成しないように制御）
  useEffect(() => {
    if (isEmpty) {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
      return () => { document.head.removeChild(meta); };
    }
  }, [isEmpty]);

  if (!area) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <h1 className="text-xl font-bold text-slate-800 mb-4">Area not found</h1>
        <Link to="/" className="text-emerald-600 hover:underline">← Back to map</Link>
      </div>
    );
  }

  // 空ページ: 親ページへリダイレクト（中身のないページを避ける）
  if (isEmpty) {
    const parentPath = categoryId && halalLevelId
      ? getLPPath(area.id, categoryId, null)  // 3段階→2段階へ
      : categoryId || halalLevelId
        ? `/${area.id}`  // 2段階→エリアへ
        : `/${area.id}`;
    return <Navigate to={parentPath} replace />;
  }

  // フィルターチップ: 結果が1件以上ある組み合わせのみ表示
  const categoriesWithResults = useMemo(() => {
    return Object.keys(CATEGORIES).filter((id) =>
      area.restaurants.some((r) => {
        if (r.category !== id) return false;
        if (halalLevelId && r.halalLevel !== halalLevelId) return false;
        return true;
      })
    );
  }, [area, halalLevelId]);

  const halalLevelsWithResults = useMemo(() => {
    return Object.keys(HALAL_LEVELS).filter((id) =>
      area.restaurants.some((r) => {
        if (r.halalLevel !== id) return false;
        if (categoryId && r.category !== categoryId) return false;
        return true;
      })
    );
  }, [area, categoryId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <Link to={`/${area.id}`} className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors">
            <span>←</span>
            <span className="font-medium">Back to map</span>
          </Link>
          <div className="flex-1 min-w-0" />
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
            <span className="text-white text-base">🍽</span>
          </div>
          <span className="font-bold text-slate-800 truncate">Halal Food Maps</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">{h1}</h1>
        {metaDescription && (
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">{metaDescription}</p>
        )}
        <p className="text-slate-500 text-sm mb-6">
          {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
        </p>

        {/* Filter chips - 結果が1件以上ある組み合わせのみリンク表示 */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            to={`/${area.id}`}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            All
          </Link>
          {Object.entries(CATEGORIES)
            .filter(([id]) => categoriesWithResults.includes(id))
            .map(([id, { label }]) => (
              <Link
                key={id}
                to={getLPPath(area.id, id, halalLevelId)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  categoryId === id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label}
              </Link>
            ))}
          <span className="w-px bg-slate-200 self-stretch" />
          {Object.entries(HALAL_LEVELS)
            .filter(([id]) => halalLevelsWithResults.includes(id))
            .map(([id, { label, color }]) => (
              <Link
                key={id}
                to={getLPPath(area.id, categoryId, id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium text-white ${
                  halalLevelId === id ? 'ring-2 ring-offset-2 ring-slate-400' : 'opacity-90 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
              >
                {label}
              </Link>
            ))}
        </div>

        {/* Restaurant list */}
        <div className="space-y-4">
          {filteredRestaurants.map((r) => (
            <Link
              key={r.id}
              to={getRestaurantPath(area.id, r)}
              className="block p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                  {r.photos?.[0] ? (
                    <img src={r.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl">🍽</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-slate-800">{r.name}</h2>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: HALAL_LEVELS[r.halalLevel]?.color || HALAL_LEVELS.unknown.color }}
                    >
                      {HALAL_LEVELS[r.halalLevel]?.label}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                      {r.category}
                    </span>
                  </div>
                  <div className="mt-2">
                    <RestaurantRatings restaurant={r} />
                  </div>
                </div>
                <span className="text-emerald-600 font-medium shrink-0 self-center">View details →</span>
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}
