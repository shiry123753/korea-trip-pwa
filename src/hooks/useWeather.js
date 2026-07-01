import { useState, useEffect } from 'react'

// 釜山座標
const LAT = 35.1796
const LNG = 129.0756
const CACHE_KEY = 'korea_weather_cache'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function wmoToInfo(code) {
  if (code === 0) return { label: '晴天', icon: 'sun' }
  if (code <= 2)  return { label: '多雲時晴', icon: 'partly' }
  if (code <= 48) return { label: '陰天', icon: 'cloud' }
  if (code <= 67) return { label: '有雨', icon: 'rain' }
  if (code <= 77) return { label: '有雪', icon: 'cloud' }
  return { label: '有雨', icon: 'rain' }
}

export function useWeather() {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    const key = todayKey()
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
      if (cached?.date === key) { setWeather(cached); return }
    } catch { /* ignore */ }

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&forecast_days=1`,
    )
      .then((r) => r.json())
      .then((data) => {
        const code = data.daily.weathercode[0]
        const max  = Math.round(data.daily.temperature_2m_max[0])
        const min  = Math.round(data.daily.temperature_2m_min[0])
        const info = wmoToInfo(code)
        const result = { date: key, code, max, min, ...info }
        setWeather(result)
        localStorage.setItem(CACHE_KEY, JSON.stringify(result))
      })
      .catch(() => {})
  }, [])

  return weather
}
