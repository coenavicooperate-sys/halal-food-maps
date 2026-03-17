import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export function RestaurantLocationMap({ restaurant }) {
  if (!restaurant?.lat || !restaurant?.lng) return null;

  return (
    <div className="w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 [&_.leaflet-container]:h-full">
      <MapContainer
        center={[restaurant.lat, restaurant.lng]}
        zoom={16}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution={MAP_ATTRIBUTION}
        />
        <Marker position={[restaurant.lat, restaurant.lng]}>
          <Popup>
            <span className="font-semibold">{restaurant.name}</span>
            {restaurant.address && <p className="text-sm text-slate-600 mt-1">{restaurant.address}</p>}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
