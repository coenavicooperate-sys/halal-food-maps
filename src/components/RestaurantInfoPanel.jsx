import { useState, useRef, useCallback } from 'react';
import { HALAL_LEVELS } from '../data/restaurants';
import { RestaurantRatings } from './RestaurantRatings';

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

function ListMarkerIcon({ category, halalLevel }) {
  const color = HALAL_LEVELS[halalLevel]?.color || HALAL_LEVELS.unknown.color;
  const iconSrc = ICON_IMAGES[category] || ICON_IMAGES.cafe;
  return (
    <div
      className="w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center overflow-hidden shrink-0"
      style={{ borderColor: color, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
    >
      <img src={iconSrc} alt="" className="w-5 h-5 object-contain" />
    </div>
  );
}

const COLLAPSED_HEIGHT = 280;
const getExpandedHeight = () => Math.min(window.innerHeight * 0.9, 850);

export function RestaurantInfoPanel({ restaurant, filteredRestaurants = [], onSelectRestaurant, onViewDetails }) {
  const [expanded, setExpanded] = useState(false);
  const [dragHeight, setDragHeight] = useState(null);
  const dragRef = useRef({ y: 0, height: 0, expandedHeight: 0, currentHeight: 0 });

  const photos = restaurant.photos || [];
  const displayPhotos = photos.length >= 5 ? photos : [...photos, ...Array(Math.max(0, 5 - photos.length)).fill(null)];

  const expandedHeight = getExpandedHeight();
  const currentHeight = dragHeight ?? (expanded ? expandedHeight : COLLAPSED_HEIGHT);

  const handleDragStart = useCallback((clientY) => {
    const startHeight = dragHeight ?? (expanded ? expandedHeight : COLLAPSED_HEIGHT);
    dragRef.current = { y: clientY, height: startHeight, expandedHeight, currentHeight: startHeight };
  }, [expanded, dragHeight, expandedHeight]);

  const handleDragMove = useCallback((clientY) => {
    const { y, height, expandedHeight: maxH } = dragRef.current;
    const delta = y - clientY; // positive = dragged up
    const newHeight = Math.max(COLLAPSED_HEIGHT, Math.min(maxH, height + delta));
    dragRef.current.currentHeight = newHeight;
    setDragHeight(newHeight);
  }, []);

  const handleDragEnd = useCallback(() => {
    const { expandedHeight: maxH, currentHeight: h, height: startH } = dragRef.current;
    const moved = Math.abs(h - startH);
    const finalHeight = h;
    const threshold = (COLLAPSED_HEIGHT + maxH) / 2;
    if (moved < 5) {
      setExpanded((prev) => !prev);
    } else {
      setExpanded(finalHeight > threshold);
    }
    setDragHeight(null);
  }, []);

  const handlePointerDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    handleDragStart(e.clientY);
  };

  const isDraggingRef = useRef(false);

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    handleDragMove(e.clientY);
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    handleDragEnd();
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[500] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.15)] rounded-t-2xl overflow-hidden flex flex-col"
      style={{
        height: currentHeight,
        transition: dragHeight !== null ? 'none' : 'height 0.3s ease-out',
      }}
    >
      {/* Drag handle - large touch target for mobile, swipe up/down to expand/collapse */}
      <div
        role="button"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={(e) => e.stopPropagation()}
        className="shrink-0 w-full min-h-[48px] py-4 flex justify-center items-center hover:bg-slate-50 active:bg-slate-100 cursor-grab active:cursor-grabbing select-none touch-none touch-manipulation"
        style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
        aria-label={expanded ? 'Drag down to close' : 'Drag up to expand'}
      >
        <span className="w-14 h-1.5 rounded-full bg-slate-400" />
      </div>

      {/* Store name, halal rank, genre - at top, centered on PC */}
      <div className="shrink-0 px-4 sm:px-6 pb-3 max-w-4xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-center md:justify-center gap-2">
          <h2 className="text-lg font-bold text-slate-800">{restaurant.name}</h2>
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
        <div className="mt-2">
          <RestaurantRatings restaurant={restaurant} />
        </div>
      </div>

      {/* Photos - always visible, above scroll */}
      <div className="shrink-0 px-4 sm:px-6 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory -mx-4 sm:mx-0 pl-8 pr-4 sm:pl-0 sm:pr-0">
          {displayPhotos.slice(0, 5).map((url, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-36 sm:w-40 h-24 sm:h-28 md:w-44 md:h-32 rounded-lg overflow-hidden bg-slate-200 snap-start"
            >
              {url ? (
                <img src={url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Photo</div>
              )}
            </div>
          ))}
        </div>
        {photos.length >= 5 && (
          <p className="text-[10px] text-slate-400 text-center mt-1">← Swipe to see all 5 photos →</p>
        )}
      </div>

      {/* Scrollable content - centered on PC */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-auto">
        <div className="px-4 sm:px-6 pb-6 max-w-4xl mx-auto">
          {/* Description, address, hours */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <p className="text-sm text-slate-600">{restaurant.description}</p>
            <p className="text-sm text-slate-500 flex items-start gap-1.5">
              <span className="shrink-0">📍</span>
              {restaurant.address}
            </p>
            {restaurant.hours && (
              <p className="text-sm text-slate-500 flex items-start gap-1.5">
                <span className="shrink-0">🕐</span>
                {restaurant.hours}
              </p>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={() => onViewDetails(restaurant)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              View details →
            </button>
          </div>

          {/* Restaurant list - all restaurants on the map */}
          {filteredRestaurants.length > 1 && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Restaurants on map ({filteredRestaurants.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredRestaurants.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onSelectRestaurant?.(r)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                      r.id === restaurant.id
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <ListMarkerIcon category={r.category} halalLevel={r.halalLevel} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p className="font-medium text-slate-800 truncate">{r.name}</p>
                        {r.hours && (
                          <span className="text-xs text-slate-500 shrink-0">{r.hours}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 capitalize">{r.category}</p>
                      <RestaurantRatings restaurant={r} compact />
                    </div>
                    {r.prayerRoom && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 shrink-0">
                        Prayer
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
