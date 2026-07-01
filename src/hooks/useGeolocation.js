import { useCallback, useState } from 'react'

export function useGeolocation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      const err = new Error('此裝置不支援定位')
      setError(err.message)
      return Promise.reject(err)
    }
    setLoading(true)
    setError(null)
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoading(false)
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        (err) => {
          setLoading(false)
          setError(err.message)
          reject(err)
        },
        { enableHighAccuracy: true, timeout: 8000 },
      )
    })
  }, [])

  return { locate, loading, error }
}
