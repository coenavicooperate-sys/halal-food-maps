import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

const POPUP_STYLE = {
  background: 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};

/**
 * Fixes map loading issues when container size isn't ready yet (e.g. flex layout).
 * Calls invalidateSize() so Leaflet recalculates viewport and loads tiles correctly.
 * Also applies semi-transparent style to popups when they open.
 */
function MapInitializer() {
  const map = useMap();
  const observerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    const styleId = 'hfm-popup-transparent';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .leaflet-popup-content-wrapper,
        .leaflet-popup-tip {
          background: rgba(255,255,255,0.65) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
        }
      `;
      document.head.appendChild(style);
    }

    const rafId = requestAnimationFrame(() => {
      map.invalidateSize();
      setTimeout(() => map.invalidateSize(), 150);
    });

    const applyToElement = (el) => {
      if (!el || el.dataset.hfmStyled === 'true') return;
      Object.assign(el.style, POPUP_STYLE);
      el.dataset.hfmStyled = 'true';
    };

    const applyPopupStyle = () => {
      document.querySelectorAll('.leaflet-popup-content-wrapper').forEach(applyToElement);
      document.querySelectorAll('.leaflet-popup-tip').forEach(applyToElement);
    };

    const onPopupOpen = () => {
      setTimeout(applyPopupStyle, 0);
      setTimeout(applyPopupStyle, 50);
      setTimeout(applyPopupStyle, 150);
    };

    map.on('popupopen', onPopupOpen);
    applyPopupStyle();

    observerRef.current = new MutationObserver(() => {
      applyPopupStyle();
    });
    observerRef.current.observe(map.getContainer(), {
      childList: true,
      subtree: true,
    });

    return () => {
      cancelAnimationFrame(rafId);
      map.off('popupopen', onPopupOpen);
      observerRef.current?.disconnect();
    };
  }, [map]);

  return null;
}

export default MapInitializer;
