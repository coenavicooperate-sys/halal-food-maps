import { CATEGORIES, HALAL_LEVELS } from '../data/restaurants';

/** 営業時間が22時以降までか（深夜営業の目安） */
function isLateNight(hours) {
  if (!hours || typeof hours !== 'string') return false;
  return /22|23|24|0:00|深夜/.test(hours);
}

/** DB集計に基づくLP用メタディスクリプションを生成 */
export function getLPDescription(area, categoryId, halalLevelId, restaurants) {
  if (!area || !restaurants?.length) return null;

  const count = restaurants.length;
  const nameJa = area.nameJa || area.name;
  const stationInfo = area.stationInfo || `${area.name}駅周辺`;

  const catLabel = categoryId && CATEGORIES[categoryId] ? CATEGORIES[categoryId].label : null;
  const halalLabel = halalLevelId && HALAL_LEVELS[halalLevelId] ? HALAL_LEVELS[halalLevelId].label : null;

  // 集計
  const hasPrayerRoom = restaurants.some((r) => r.prayerRoom);
  const hasLateNight = restaurants.some((r) => isLateNight(r.hours));
  const hasParking = restaurants.some((r) => r.parking);
  const hasReservation = restaurants.some((r) => r.reservationUrl);

  const parts = [];

  // 基本文
  if (catLabel && halalLabel) {
    parts.push(`${nameJa}の${halalLabel}${catLabel}${count}件`);
  } else if (catLabel) {
    parts.push(`${nameJa}のハラル${catLabel}${count}件`);
  } else if (halalLabel) {
    parts.push(`${nameJa}の${halalLabel}レストラン${count}件`);
  } else {
    parts.push(`${nameJa}のハラルレストラン${count}件`);
  }

  parts.push(`${stationInfo}の店舗を掲載`);

  // 差別化要素
  const features = [];
  if (hasPrayerRoom) features.push('礼拝室あり');
  if (hasLateNight) features.push('深夜営業');
  if (hasParking) features.push('駐車場あり');
  if (hasReservation) features.push('予約可');

  if (features.length > 0) {
    parts.push(`${features.join('・')}の店舗も掲載中`);
  }

  parts.push('Halal Food Mapsで検索');

  return parts.join('。');
}
