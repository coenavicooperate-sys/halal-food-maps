import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Fixes map loading issues when container size isn't ready yet (e.g. flex layout).
 * Calls invalidateSize() so Leaflet recalculates viewport and loads tiles correctly.
 */
function MapInitializer() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // After layout has settled (flexbox needs a frame)
    const rafId = requestAnimationFrame(() => {
      map.invalidateSize();
      // Second call - catches slow layout calculations on some devices
      setTimeout(() => map.invalidateSize(), 150);
    });

    return () => cancelAnimationFrame(rafId);
  }, [map]);

  return null;
}

export default MapInitializer;
