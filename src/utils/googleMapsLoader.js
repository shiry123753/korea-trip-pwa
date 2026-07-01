let loadPromise = null

export function loadGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return Promise.reject(new Error('缺少 VITE_GOOGLE_MAPS_API_KEY'))
  }
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps)
  }
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.async = true
    script.onload = () => resolve(window.google.maps)
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Google Maps 載入失敗'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}
