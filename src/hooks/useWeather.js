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

function timeoutReject(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('連線逾時')), ms))
}

async function fetchWeather() {
  const r = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&forecast_days=1`,
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
}

// 回傳 { weather, status, errMsg, retry }；status: loading | ok | error
export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errMsg, setErrMsg] = useState('')

  const load = useCallback(async () => {
    setStatus('loading')
    setErrMsg('')

    // 先把任何快取拿出來墊著（就算是舊的，也比空白好）
    let cached = null
    try { cached = JSON.parse(localStorage.getItem(CACHE_KEY)) } catch { /* ignore */ }
    if (cached) setWeather(cached)

    try {
      // Promise.race 保證 12 秒一定會結束（不靠 AbortController，避開 iOS 中止不生效的情況）
      const w = await Promise.race([fetchWeather(), timeoutReject(12000)])
      setWeather(w)
      setStatus('ok')
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(w)) } catch { /* ignore */ }
    } catch (e) {
      setErrMsg(e?.message || '載入失敗')
      setStatus(cached ? 'ok' : 'error') // 有舊快取就繼續顯示，否則顯示可重試
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { weather, status, errMsg, retry: load }
}
