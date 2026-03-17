import { useParams } from 'react-router-dom';
import { CATEGORIES, HALAL_LEVELS } from '../data/restaurants';
import { getRestaurantBySlug } from '../data/areas';
import { RestaurantDetailPage } from './RestaurantDetailPage';
import { DynamicLPPage } from './DynamicLPPage';

/**
 * Resolves /:areaId/:filter1 and /:areaId/:filter1/:filter2
 * - If filter1 (and filter2) are category/halal IDs → DynamicLPPage
 * - Else if filter1 matches a restaurant slug → RestaurantDetailPage
 */
export function AreaSlugRoute() {
  const { areaId, filter1, filter2 } = useParams();

  const isCategory = (s) => s && s in CATEGORIES;
  const isHalal = (s) => s && s in HALAL_LEVELS;

  // 3 segments: /areaId/filter1/filter2 → LP with both filters
  if (filter1 && filter2) {
    const categoryId = isCategory(filter1) ? filter1 : isCategory(filter2) ? filter2 : null;
    const halalLevelId = isHalal(filter1) ? filter1 : isHalal(filter2) ? filter2 : null;
    if (categoryId || halalLevelId) {
      return <DynamicLPPage categoryId={categoryId} halalLevelId={halalLevelId} />;
    }
    // Neither is valid filter → 404 or try restaurant (restaurant slugs don't have 3 segments, so 404)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <h1 className="text-xl font-bold text-slate-800 mb-4">Page not found</h1>
        <a href="/" className="text-emerald-600 hover:underline">← Back to map</a>
      </div>
    );
  }

  // 2 segments: /areaId/filter1 → LP (if category/halal) or Restaurant (if restaurant slug)
  if (filter1) {
    if (isCategory(filter1) || isHalal(filter1)) {
      const categoryId = isCategory(filter1) ? filter1 : null;
      const halalLevelId = isHalal(filter1) ? filter1 : null;
      return <DynamicLPPage categoryId={categoryId} halalLevelId={halalLevelId} />;
    }
    // Treat as restaurant slug
    return <RestaurantDetailPage />;
  }

  return null;
}
