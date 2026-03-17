import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Fixes map loading issues when container size isn't ready yet (e.g. flex layout).
 * Calls invalidateSize() so Leaflet recalculates viewport and loads tiles correctly.
 * Also applies semi-transparent style to popups when they open.
 */
function MapInitializer() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // After layout has settled (flexbox needs a frame)
    const rafId = requestAnimationFrame(() => {
      map.invalidateSize();
      setTimeout(() => map.invalidateSize(), 150);
    });

    const applyPopupStyle = () => {
      const wrappers = map.getContainer().querySelectorAll('.leaflet-popup-content-wrapper');
      wrappers.forEach((el) => {
        el.style.setProperty('background', 'rgba(255, 255, 255, 0.85)', 'important');
        el.style.setProperty('backdrop-filter', 'blur(10px)');
        el.style.setProperty('-webkit-backdrop-filter', 'blur(10px)');
      });
      const tips = map.getContainer().querySelectorAll('.leaflet-popup-tip');
      tips.forEach((el) => {
        el.style.setProperty('background', 'rgba(255, 255, 255, 0.85)', 'important');
      });
    };

    const onPopupOpen = () => {
      requestAnimationFrame(applyPopupStyle);
    };

    map.on('popupopen', onPopupOpen);
    applyPopupStyle();

    return () => {
      cancelAnimationFrame(rafId);
      map.off('popupopen', onPopupOpen);
    };
  }, [map]);

  return null;
}

export default MapInitializer;
