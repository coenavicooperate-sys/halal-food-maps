import { useState, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { HALAL_LEVELS, CATEGORIES } from './data/restaurants';
import { AREAS, getAreaById } from './data/areas';
import { RestaurantMarker } from './components/RestaurantMarker';
import { RestaurantInfoPanel } from './components/RestaurantInfoPanel';
import { RestaurantDetailModal } from './components/RestaurantDetailModal';
import MapInitializer from './components/MapInitializer';

// Map tile - using CartoDB Positron for a clean, trustworthy look
const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function MapContent({ filteredRestaurants, selectedRestaurant, onSelectRestaurant }) {
  return (
    <>
      {filteredRestaurants.map((r) => (
        <RestaurantMarker
          key={r.id}
          restaurant={r}
          isSelected={selectedRestaurant?.id === r.id}
          onSelect={onSelectRestaurant}
        />
      ))}
    </>
  );
}

function App() {
  const [currentAreaId, setCurrentAreaId] = useState('shibuya');
  const currentArea = getAreaById(currentAreaId);
  const restaurants = currentArea.restaurants;

  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [halalFilter, setHalalFilter] = useState('all');
  const [prayerRoomOnly, setPrayerRoomOnly] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);
  const [detailRestaurant, setDetailRestaurant] = useState(null);

  const handleAreaChange = (areaId) => {
    setCurrentAreaId(areaId);
    const area = getAreaById(areaId);
    setSelectedRestaurant(area.restaurants[0]);
    setDetailRestaurant(null);
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => {
        if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
        if (halalFilter !== 'all' && r.halalLevel !== halalFilter) return false;
        if (prayerRoomOnly && !r.prayerRoom) return false;
        return true;
      })
      .sort((a, b) => {
        const scoreA = a.reviews?.halalFoodMaps?.score ?? 0;
        const scoreB = b.reviews?.halalFoodMaps?.score ?? 0;
        return scoreB - scoreA;
      });
  }, [restaurants, categoryFilter, halalFilter, prayerRoomOnly]);

  // Auto-select first filtered restaurant when selection is filtered out
  const displayRestaurant = useMemo(() => {
    const isSelectedInFiltered = filteredRestaurants.some(
      (r) => r.id === selectedRestaurant?.id
    );
    if (!isSelectedInFiltered && filteredRestaurants.length > 0) {
      return filteredRestaurants[0];
    }
    return selectedRestaurant;
  }, [selectedRestaurant, filteredRestaurants]);

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col overflow-hidden">
      {/* 1. Search-style header - fixed at top */}
      <header className="shrink-0 bg-white border-b border-slate-200 shadow-sm z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white text-base">🍽</span>
              </div>
              <h1 className="text-lg font-bold text-slate-800">
                Halal Food Maps
              </h1>
            </div>
            <div className="flex-1 max-w-2xl flex items-center gap-2">
              <select
                value={currentAreaId}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                {AREAS.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
              <div className="relative flex-1 min-w-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
                <input
                  type="text"
                  value={`${currentArea.name} Halal`}
                  readOnly
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Filter bar - compact */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-1.5 z-20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-600">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            >
              <option value="all">All</option>
              {Object.entries(CATEGORIES).map(([id, { label }]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-600">Halal:</span>
            <select
              value={halalFilter}
              onChange={(e) => setHalalFilter(e.target.value)}
              className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            >
              <option value="all">All</option>
              {Object.entries(HALAL_LEVELS).map(([id, { label }]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={prayerRoomOnly}
              onChange={(e) => setPrayerRoomOnly(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-600">Prayer room</span>
          </label>
        </div>
      </div>

      {/* 3. Map + 4. Legend - fills remaining space */}
      <div className="flex-1 relative min-h-0">
        <MapContainer
          key={currentAreaId}
          center={currentArea.center}
          zoom={16}
          className="w-full h-full z-0"
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution={MAP_ATTRIBUTION}
          />
          <MapInitializer />
          <MapContent
            filteredRestaurants={filteredRestaurants}
            selectedRestaurant={displayRestaurant}
            onSelectRestaurant={setSelectedRestaurant}
          />
        </MapContainer>

        {/* Compact collapsible legend - above map, below restaurant panel (z-450 < panel z-500) */}
        <div className="absolute bottom-[220px] left-4 z-[450]">
          <button
            type="button"
            onClick={() => setLegendOpen(!legendOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur rounded-lg shadow-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-white transition-colors"
          >
            Legend
            <span className={`transition-transform ${legendOpen ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {legendOpen && (
            <div className="mt-1.5 bg-white/95 backdrop-blur rounded-lg shadow-lg border border-slate-200 p-2.5 text-[10px]">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div className="col-span-2 font-semibold text-slate-600 mb-0.5">Category</div>
                <span className="flex items-center gap-1"><img src="/icons/ramen.png" alt="" className="w-4 h-4 object-contain shrink-0" /> Ramen</span>
                <span className="flex items-center gap-1"><img src="/icons/sushi.png" alt="" className="w-4 h-4 object-contain shrink-0" /> Sushi</span>
                <span className="flex items-center gap-1"><img src="/icons/cafe.png" alt="" className="w-4 h-4 object-contain shrink-0" /> Cafe</span>
                <span className="flex items-center gap-1"><img src="/icons/yakiniku.png" alt="" className="w-4 h-4 object-contain shrink-0" /> Yakiniku</span>
                <div className="col-span-2 font-semibold text-slate-600 mt-1.5 mb-0.5">Color</div>
                {Object.entries(HALAL_LEVELS).map(([id, { label, color }]) => (
                  <span key={id} className="flex items-center gap-1 col-span-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Bottom sheet - overlays map, slides up like Google Maps */}
      {displayRestaurant && (
        <RestaurantInfoPanel
          restaurant={displayRestaurant}
          filteredRestaurants={filteredRestaurants}
          onSelectRestaurant={setSelectedRestaurant}
          onViewDetails={setDetailRestaurant}
        />
      )}

      {/* View details modal */}
      {detailRestaurant && (
        <RestaurantDetailModal
          restaurant={detailRestaurant}
          onClose={() => setDetailRestaurant(null)}
        />
      )}
    </div>
  );
}

export default App;
