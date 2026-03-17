// Area definitions for Halal Food Maps
// Each area has: id, name, center (map), restaurants

import { restaurants as shibuyaRestaurants } from './restaurants';
import { shinjukuRestaurants } from './shinjuku';

export const AREAS = [
  {
    id: 'shibuya',
    name: 'Shibuya',
    nameJa: '渋谷',
    stationInfo: '渋谷駅周辺',
    center: [35.658514, 139.70133],
    restaurants: shibuyaRestaurants,
  },
  {
    id: 'shinjuku',
    name: 'Shinjuku',
    nameJa: '新宿',
    stationInfo: '新宿駅西口・東口周辺',
    center: [35.6895, 139.7003],
    restaurants: shinjukuRestaurants,
  },
];

export const getAreaById = (id) => AREAS.find((a) => a.id === id) ?? AREAS[0];

/** Generate URL slug from restaurant name (e.g. "Halal Ramen Ouka" -> "halal-ramen-ouka") */
export const getSlugFromName = (name) =>
  name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

/** Find restaurant by area and slug. Returns null if not found. */
export const getRestaurantBySlug = (areaId, slug) => {
  const area = getAreaById(areaId);
  if (!area) return null;
  return area.restaurants.find((r) => getSlugFromName(r.name) === slug) ?? null;
};

/** Get URL path for a restaurant detail page (e.g. /shibuya/halal-ramen-ouka) */
export const getRestaurantPath = (areaId, restaurant) =>
  `/${areaId}/${getSlugFromName(restaurant.name)}`;

/** Get URL path for dynamic LP (e.g. /shibuya/ramen, /shibuya/certified, /shibuya/ramen/certified) */
export const getLPPath = (areaId, categoryId, halalLevelId) => {
  const parts = [areaId];
  if (categoryId && categoryId !== 'all') parts.push(categoryId);
  if (halalLevelId && halalLevelId !== 'all') parts.push(halalLevelId);
  return '/' + parts.join('/');
};
