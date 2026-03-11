import { HALAL_LEVELS } from '../data/restaurants';
import { RestaurantRatings } from './RestaurantRatings';

export function RestaurantDetailModal({ restaurant, onClose }) {
  if (!restaurant) return null;

  const photos = restaurant.photos || [];
  const menu = restaurant.menu;
  const menuFood = (menu?.food || []).slice(0, 10);
  const menuDrinks = (menu?.drinks || []).slice(0, 5);
  const hasMenu = menuFood.length > 0 || menuDrinks.length > 0;
  const features = (restaurant.features || []).slice(0, 4);
  const recommendedMenu = (restaurant.recommendedMenu || []).slice(0, 4);
  const galleryPhotos = (restaurant.galleryPhotos || []).slice(0, 10);
  const mapUrl = `https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}`;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal - full restaurant homepage style, centered on PC */}
      <div
        className="relative bg-white w-full max-w-2xl md:max-w-3xl max-h-[95vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl mx-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="sticky top-2 right-2 float-right z-10 w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Hero photo gallery - 5 photos, swipeable */}
        <div className="relative">
          <div className="flex gap-3 p-4 md:p-6 overflow-x-auto snap-x snap-mandatory scroll-smooth justify-center md:justify-start">
            {(photos.length >= 5 ? photos : [...photos, ...Array(5 - photos.length).fill(null)]).map((url, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-80 sm:w-96 h-48 sm:h-60 rounded-xl overflow-hidden bg-slate-200 snap-start"
              >
                {url ? (
                  <img src={url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">Photo</div>
                )}
              </div>
            ))}
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
            {Math.min(photos.length, 5)}/5 photos — swipe to view
          </div>
        </div>

        <div className="p-6 md:p-8 pt-4 max-w-4xl mx-auto">
          {/* Header - centered on PC */}
          <h1 id="detail-title" className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 text-center">
            {restaurant.name}
          </h1>

          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <span
              className="px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: HALAL_LEVELS[restaurant.halalLevel]?.color || HALAL_LEVELS.unknown.color }}
            >
              {HALAL_LEVELS[restaurant.halalLevel]?.label}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 capitalize">
              {restaurant.category}
            </span>
            {restaurant.prayerRoom && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                Prayer room available
              </span>
            )}
          </div>

          <div className="mb-6 flex justify-center">
            <RestaurantRatings restaurant={restaurant} />
          </div>

          <p className="text-slate-600 mb-6 text-center md:text-left">{restaurant.description}</p>

          {/* Features section - max 4, horizontal scroll, portrait photo + title + desc */}
          {features.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Features</h2>
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth justify-center md:justify-start">
                {features.map((item, i) => (
                  <div key={i} className="flex-shrink-0 w-52 sm:w-64 snap-start">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-200 mb-2">
                      <img src={item.photo} alt="" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recommended Menu section - max 4, horizontal scroll */}
          {recommendedMenu.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Recommended Menu</h2>
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth justify-center md:justify-start">
                {recommendedMenu.map((item, i) => (
                  <div key={i} className="flex-shrink-0 w-52 sm:w-64 snap-start">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-200 mb-2">
                      {item.photo ? (
                        <img src={item.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Photo</div>
                      )}
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                    <p className="text-emerald-600 font-medium text-sm">{item.price}</p>
                    {item.desc && <p className="text-xs text-slate-500">{item.desc}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interior & Exterior photos - up to 10 */}
          {galleryPhotos.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Interior & Exterior</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {galleryPhotos.map((url, i) => (
                  <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Menu section */}
          {hasMenu && (
            <section className="mb-6">
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span>📋</span> Menu
              </h2>
              <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                {menuFood.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 mb-2">Food</h3>
                    <div className="space-y-2">
                      {menuFood.map((item, i) => (
                        <div key={i} className="flex justify-between items-start gap-4">
                          <div>
                            <p className="font-medium text-slate-800">{item.name}</p>
                            {item.desc && <p className="text-sm text-slate-500">{item.desc}</p>}
                          </div>
                          <span className="font-semibold text-slate-700 shrink-0">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {menuDrinks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 mb-2">Drinks</h3>
                    <div className="space-y-2">
                      {menuDrinks.map((item, i) => (
                        <div key={i} className="flex justify-between items-start gap-4">
                          <div>
                            <p className="font-medium text-slate-800">{item.name}</p>
                            {item.desc && <p className="text-sm text-slate-500">{item.desc}</p>}
                          </div>
                          <span className="font-semibold text-slate-700 shrink-0">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {restaurant.menuBookUrl && (
                <a
                  href={restaurant.menuBookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  All menu →
                </a>
              )}
            </section>
          )}

          {/* Info section */}
          <section className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span>📍</span> Location & Info
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-slate-400 shrink-0">📍</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">Address</p>
                  <p className="text-slate-600">{restaurant.address}</p>
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-600 hover:underline mt-1 inline-block"
                  >
                    Open in Maps →
                  </a>
                </div>
              </div>
              {restaurant.hours && (
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 shrink-0">🕐</span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Hours</p>
                    <p className="text-slate-600">{restaurant.hours}</p>
                  </div>
                </div>
              )}
              {restaurant.phone && (
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 shrink-0">📞</span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Phone</p>
                    <a href={`tel:${restaurant.phone}`} className="text-slate-600 hover:text-emerald-600">
                      {restaurant.phone}
                    </a>
                  </div>
                </div>
              )}
              {restaurant.payment && restaurant.payment.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 shrink-0">💳</span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Payment</p>
                    <p className="text-slate-600">{restaurant.payment.join(', ')}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="text-slate-400 shrink-0">ℹ️</span>
                <div className="flex flex-wrap gap-2">
                  {restaurant.wifi && (
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-sm">Wi-Fi</span>
                  )}
                  {restaurant.parking && (
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-sm">Parking</span>
                  )}
                  {!restaurant.wifi && !restaurant.parking && (
                    <span className="text-slate-500 text-sm">—</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* CTA - centered */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 justify-center">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
            >
              Get directions
            </a>
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Call
              </a>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Powered by Halal Food Maps — Your online presence when you don&apos;t have a website
          </p>
        </div>
      </div>
    </div>
  );
}
