import { useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HALAL_LEVELS } from '../data/restaurants';
import { getAreaById, getSlugFromName } from '../data/areas';
import { useRestaurantWithEdits } from '../hooks/useRestaurantWithEdits';
import { useRestaurantReviews } from '../hooks/useRestaurantReviews';
import { useAuth } from '../contexts/AuthContext';
import { RestaurantRatings } from './RestaurantRatings';
import { RestaurantLocationMap } from './RestaurantLocationMap';
import { RestaurantReviewsSection } from './RestaurantReviewsSection';
import { RestaurantReviewsPreview } from './RestaurantReviewsPreview';

export function RestaurantDetailPage() {
  const params = useParams();
  const areaId = params.areaId || 'shibuya';
  const slug = params.slug ?? params.filter1;
  const photoScrollRef = useRef(null);
  const reviewsSectionRef = useRef(null);

  const area = getAreaById(areaId);
  const { restaurant, loading } = useRestaurantWithEdits(areaId, slug);
  const { avgRating, count } = useRestaurantReviews(areaId, slug);
  const { loginId } = useAuth();
  const isOwnStore = restaurant && loginId === `${areaId}-${slug}`;

  useEffect(() => {
    if (photoScrollRef.current) {
      photoScrollRef.current.scrollLeft = 0;
    }
  }, [restaurant?.id]);

  useEffect(() => {
    if (restaurant) {
      document.title = `${restaurant.name} | Halal Food Maps ${area?.name || ''}`;
    }
    return () => {
      document.title = 'Halal Food Maps';
    };
  }, [restaurant, area?.name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">読み込み中...</p>
      </div>
    );
  }

  if (!restaurant) {
    const fallbackArea = getAreaById(areaId);
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <h1 className="text-xl font-bold text-slate-800 mb-4">Restaurant not found</h1>
        <Link to={fallbackArea ? `/${fallbackArea.id}` : '/'} className="text-emerald-600 hover:underline">
          ← Back to map
        </Link>
      </div>
    );
  }

  const photos = restaurant.photos || [];
  const menu = restaurant.menu;
  const menuFood = (menu?.food || []).slice(0, 10);
  const menuDrinks = (menu?.drinks || []).slice(0, 5);
  const hasMenu = menuFood.length > 0 || menuDrinks.length > 0;
  const features = (restaurant.features || []).slice(0, 4);
  const recommendedMenu = (restaurant.recommendedMenu || []).slice(0, 4);
  const galleryPhotos = (restaurant.galleryPhotos || []).slice(0, 10);
  const mapUrl = `https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}`;

  const hasReservation = !!restaurant.reservationUrl;
  const hasPhone = !!restaurant.phone;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header with back link */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <Link
            to={area ? `/${area.id}` : '/'}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <span>←</span>
            <span className="font-medium">Back to map</span>
          </Link>
          <div className="flex-1 min-w-0" />
          {isOwnStore && (
            <Link to="/admin" className="text-sm text-emerald-600 hover:underline font-medium shrink-0">
              店舗情報を編集
            </Link>
          )}
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
            <span className="text-white text-base">🍽</span>
          </div>
          <span className="font-bold text-slate-800 truncate">Halal Food Maps</span>
        </div>
      </header>

      {/* Main content - scrollable */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto bg-white shadow-sm">
          {/* Hero photo gallery */}
          <div className="relative max-w-4xl mx-auto px-6 md:px-8">
            <div
              ref={photoScrollRef}
              className="flex gap-3 py-4 md:py-6 overflow-x-auto snap-x snap-mandatory scroll-smooth justify-start"
            >
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

          <div className="p-6 md:p-8 pt-4 pb-24 md:pb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 text-center">
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
              <RestaurantRatings
                restaurant={restaurant}
                siteReviews={count > 0 ? { score: avgRating, count } : undefined}
              />
            </div>

            <p className="text-slate-600 mb-6 text-center md:text-left">{restaurant.description}</p>

            {features.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-3">Features</h2>
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth px-8 md:px-0">
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

            {recommendedMenu.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-3">Recommended Menu</h2>
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth px-8 md:px-0">
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

            {hasMenu && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span>📋</span> Menu
                </h2>
                <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                  {menuFood.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-amber-800 bg-amber-50 px-4 py-2 rounded-lg mb-3 inline-block">
                        🍽 Food
                      </h3>
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
                      <h3 className="text-sm font-semibold text-sky-800 bg-sky-50 px-4 py-2 rounded-lg mb-3 inline-block">
                        🥤 Drinks
                      </h3>
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

            <RestaurantReviewsPreview
              areaId={areaId}
              restaurantSlug={slug}
              onViewAll={() => reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            />

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
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Map</p>
                <RestaurantLocationMap restaurant={restaurant} />
              </div>
            </section>

            <RestaurantReviewsSection areaId={areaId} restaurantSlug={slug} scrollRef={reviewsSectionRef} />

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
            <p className="text-center mt-4">
              <Link to="/login" className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline">
                For store owners
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Fixed bottom bar - mobile: Reserve/Call + Route */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[2001] bg-white border-t border-slate-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-3 max-w-4xl mx-auto">
          {hasReservation ? (
            <a
              href={restaurant.reservationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 rounded-lg bg-emerald-600 text-white font-semibold text-center hover:bg-emerald-700 transition-colors"
            >
              Reserve
            </a>
          ) : hasPhone ? (
            <a
              href={`tel:${restaurant.phone}`}
              className="flex-1 py-3.5 rounded-lg bg-emerald-600 text-white font-semibold text-center hover:bg-emerald-700 transition-colors"
            >
              Call
            </a>
          ) : null}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-center hover:bg-slate-50 transition-colors"
          >
            Route
          </a>
        </div>
      </div>
    </div>
  );
}
