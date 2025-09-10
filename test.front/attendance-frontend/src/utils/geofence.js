// simple point-in-circle check
export function isInsideGeofence(
  userLat,
  userLng,
  centerLat,
  centerLng,
  radiusMeters
) {
  // Haversine distance
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(centerLat - userLat);
  const dLon = toRad(centerLng - userLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(userLat)) *
      Math.cos(toRad(centerLat)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d <= radiusMeters;
}
