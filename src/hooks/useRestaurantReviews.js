import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/** 店舗の口コミを取得・投稿するフック */
export function useRestaurantReviews(areaId, restaurantSlug) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(() => {
    if (!areaId || !restaurantSlug) {
      setReviews([]);
      setLoading(false);
      return;
    }

    if (!supabase) {
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from('restaurant_reviews')
      .select('id, author_name, rating, comment, photos, created_at')
      .eq('area_id', areaId)
      .eq('restaurant_slug', restaurantSlug)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
          setReviews([]);
        } else {
          setReviews(data || []);
        }
      })
      .finally(() => setLoading(false));
  }, [areaId, restaurantSlug]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = useCallback(
    async ({ authorName, rating, comment, photoFiles = [] }) => {
      if (!supabase || !areaId || !restaurantSlug) {
        setError('Review feature is not available.');
        return false;
      }

      setSubmitting(true);
      setError(null);

      const photoUrls = [];
      const batchId = crypto.randomUUID();

      for (let i = 0; i < Math.min(photoFiles.length, 5); i++) {
        const file = photoFiles[i];
        if (!file?.type?.startsWith('image/')) continue;
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${areaId}/${restaurantSlug}/${batchId}_${i}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('review-photos')
          .upload(path, file, { upsert: true });
        if (uploadErr) {
          setError(uploadErr.message || 'Photo upload failed.');
          setSubmitting(false);
          return false;
        }
        const { data: urlData } = supabase.storage.from('review-photos').getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);
      }

      const { error: err } = await supabase.from('restaurant_reviews').insert({
        area_id: areaId,
        restaurant_slug: restaurantSlug,
        author_name: authorName?.trim() || null,
        rating: Number(rating),
        comment: comment?.trim() || null,
        photos: photoUrls,
      });

      setSubmitting(false);

      if (err) {
        setError(err.message);
        return false;
      }

      fetchReviews();
      return true;
    },
    [areaId, restaurantSlug, fetchReviews]
  );

  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;

  return {
    reviews,
    loading,
    submitting,
    error,
    avgRating,
    count: reviews.length,
    submitReview,
    refetch: fetchReviews,
  };
}
