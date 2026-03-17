import { useState, useEffect } from 'react';
import { getRestaurantBySlug } from '../data/areas';
import { supabase } from '../lib/supabase';

/** 静的データとDBの編集をマージした店舗データを返す */
export function useRestaurantWithEdits(areaId, slug) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = getRestaurantBySlug(areaId, slug);
    if (!base) {
      setRestaurant(null);
      setLoading(false);
      return;
    }

    if (!supabase) {
      setRestaurant(base);
      setLoading(false);
      return;
    }

    supabase
      .from('restaurant_edits')
      .select('edits')
      .eq('area_id', areaId)
      .eq('restaurant_slug', slug)
      .single()
      .then(({ data }) => {
        if (data?.edits) {
          setRestaurant({ ...base, ...data.edits });
        } else {
          setRestaurant(base);
        }
      })
      .catch(() => setRestaurant(base))
      .finally(() => setLoading(false));
  }, [areaId, slug]);

  return { restaurant, loading };
}
