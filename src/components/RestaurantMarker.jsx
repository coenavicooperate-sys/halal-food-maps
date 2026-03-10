import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { HALAL_LEVELS } from '../data/restaurants';

import ramenIcon from '../assets/icons/ramen.png';
import sushiIcon from '../assets/icons/sushi.png';
import yakinikuIcon from '../assets/icons/yakiniku.png';
import cafeIcon from '../assets/icons/cafe.png';

const ICON_IMAGES = {
  ramen: ramenIcon,
  sushi: sushiIcon,
  yakiniku: yakinikuIcon,
  cafe: cafeIcon,
};

/**
 * Creates a custom marker icon using category image + halal level (border color)
 */
function createMarkerIcon(category, halalLevel, isActive) {
  const color = HALAL_LEVELS[halalLevel]?.color || HALAL_LEVELS.unknown.color;
  const iconSrc = ICON_IMAGES[category] || ICON_IMAGES.cafe;
  const activeStyle = isActive ? 'transform:scale(1.25);z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,0.4);' : '';

  return divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width:32px;
        height:32px;
        border-radius:50%;
        background:white;
        border:3px solid ${color};
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
        overflow:hidden;
        display:flex;
        align-items:center;
        justify-content:center;
        ${activeStyle}
      ">
        <img src="${iconSrc}" alt="" style="width:20px;height:20px;object-fit:contain;" />
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function RestaurantMarker({ restaurant, isSelected, onSelect }) {
  const icon = createMarkerIcon(
    restaurant.category,
    restaurant.halalLevel,
    isSelected
  );

  return (
    <Marker
      position={[restaurant.lat, restaurant.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(restaurant),
      }}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          {restaurant.photos?.[0] && (
            <div className="w-full h-24 rounded-lg overflow-hidden mb-2 bg-slate-200">
              <img src={restaurant.photos[0]} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <p className="font-semibold text-gray-900 mb-1.5">{restaurant.name}</p>
          <div className="flex flex-wrap gap-1 mb-1">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: HALAL_LEVELS[restaurant.halalLevel]?.color || HALAL_LEVELS.unknown.color }}
            >
              {HALAL_LEVELS[restaurant.halalLevel]?.label}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
              {restaurant.category}
            </span>
            {restaurant.prayerRoom && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Prayer room
              </span>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
