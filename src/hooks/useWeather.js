import { useState, useEffect, useCallback } from 'react'

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

async function fetchOnce() {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000) // 8 秒逾時，避免在爛網路上卡死
  try {
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&forecast_days=1`,
      { signal: ctrl.signal },
    )
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const data = await r.json()
    if (!data?.daily?.weathercode) throw new Error('資料格式異常')
    const code = data.daily.weathercode[0]
    return {
      date: todayKey(),
      code,
      max: Math.round(data.daily.temperature_2m_max[0]),
      min: Math.round(data.daily.temperature_2m_min[0]),
      ...wmoToInfo(code),
    }
  } finally {
    clearTimeout(timer)
  }
}

// 回傳 { weather, status, retry }；status: loading | ok | error
export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [status, setStatus] = useState('loading')

  const load = useCallback(async () => {
    setStatus('loading')

    // 先把任何快取拿出來墊著（就算是舊的，也比空白好）
    let cached = null
    try { cached = JSON.parse(localStorage.getItem(CACHE_KEY)) } catch { /* ignore */ }
    if (cached) setWeather(cached)

    // 今天的快取就直接用，仍在背景更新
    if (cached?.date === todayKey()) setStatus('ok')

    // 重試 2 次
    for (let i = 0; i < 2; i++) {
      try {
        const w = await fetchOnce()
        setWeather(w)
        setStatus('ok')
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(w)) } catch { /* ignore */ }
        return
      } catch { /* 換下一次重試 */ }
    }

    // 全部失敗：有舊快取就繼續顯示（ok），否則顯示錯誤讓使用者重試
    setStatus(cached ? 'ok' : 'error')
  }, [])

  useEffect(() => { load() }, [load])

  return { weather, status, retry: load }
}
