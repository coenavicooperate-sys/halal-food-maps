import { useState, useRef } from 'react';
import { useRestaurantReviews } from '../hooks/useRestaurantReviews';

function StarRating({ value, onChange, readonly = false }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-0.5">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange(s)}
          className={`text-xl ${s <= value ? 'text-amber-400' : 'text-slate-200'} ${!readonly ? 'hover:text-amber-400 cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export function RestaurantReviewsSection({ areaId, restaurantSlug }) {
  const { reviews, loading, submitting, error, avgRating, count, submitReview } = useRestaurantReviews(
    areaId,
    restaurantSlug
  );

  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photoFiles, setPhotoFiles] = useState([]);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_PHOTOS = 5;
  const MAX_SIZE_MB = 5;

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.type.startsWith('image/') && f.size <= MAX_SIZE_MB * 1024 * 1024);
    setPhotoFiles((prev) => [...prev, ...valid].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (index) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    const ok = await submitReview({ authorName, rating, comment, photoFiles });
    if (ok) {
      setAuthorName('');
      setRating(0);
      setComment('');
      setPhotoFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (!areaId || !restaurantSlug) return null;

  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
        <span>💬</span> Reviews
        {avgRating != null && (
          <span className="text-sm font-normal text-slate-600">
            {avgRating} ({count})
          </span>
        )}
      </h2>

      {/* Submit form */}
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-sm text-slate-600 mb-3">Share your experience</p>
        <div className="space-y-3">
          <div>
            <label htmlFor="review-name" className="block text-xs font-medium text-slate-600 mb-1">
              Name (optional)
            </label>
            <input
              id="review-name"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label htmlFor="review-comment" className="block text-xs font-medium text-slate-600 mb-1">
              Comment (optional)
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your visit..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Photos (optional, up to {MAX_PHOTOS})
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handlePhotoChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium hover:file:bg-emerald-100"
            />
            {photoFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {photoFiles.map((file, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Thank you! Your review has been posted.</p>}
          <button
            type="submit"
            disabled={submitting || rating < 1}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Post review'}
          </button>
        </div>
      </form>

      {/* Review list */}
      {loading ? (
        <p className="text-sm text-slate-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-slate-500">No reviews yet. Be the first to share!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-medium text-slate-800">{r.author_name || 'Anonymous'}</span>
                <span className="text-xs text-slate-500">{formatDate(r.created_at)}</span>
              </div>
              <div className="mb-2">
                <StarRating value={r.rating} readonly />
              </div>
              {r.comment && <p className="text-sm text-slate-600 mb-2">{r.comment}</p>}
              {r.photos && r.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {r.photos.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-20 h-20 object-cover rounded-lg border border-slate-200 hover:opacity-90"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
