// Area definitions for Halal Food Maps
// Each area has: id, name, center (map), restaurants

import { restaurants as shibuyaRestaurants } from './restaurants';
import { shinjukuRestaurants } from './shinjuku';

export const AREAS = [
  {
    id: 'shibuya',
    name: 'Shibuya',
    center: [35.658514, 139.70133],
    restaurants: shibuyaRestaurants,
  },
  {
    id: 'shinjuku',
    name: 'Shinjuku',
    center: [35.6895, 139.7003],
    restaurants: shinjukuRestaurants,
  },
];

export const getAreaById = (id) => AREAS.find((a) => a.id === id) ?? AREAS[0];
