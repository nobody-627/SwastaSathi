// backend/services/locationService.js

// Stores latest location per session
const locationStore = new Map()

export function saveLocation(sessionId, lat, lng, accuracy) {
  locationStore.set(sessionId, {
    lat, lng, accuracy,
    updatedAt: Date.now(),
    mapsLink: `https://maps.google.com/?q=${lat},${lng}`,
    // Nearby ambulance search link:
    ambulanceLink: `https://www.google.com/maps/search/ambulance+near+me/@${lat},${lng},14z`,
    // Nearby doctor search link:
    doctorLink: `https://www.google.com/maps/search/doctor+near+me/@${lat},${lng},14z`,
  })
}

export function getLocation(sessionId) {
  return locationStore.get(sessionId) || null
}

export function clearLocation(sessionId) {
  locationStore.delete(sessionId)
}