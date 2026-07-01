import { useState, useEffect, useRef, useCallback } from 'react'
import { getDrivingEta } from '../utils/distanceMatrix'

const POLL_INTERVAL_MS = 30_000   // 每 30 秒更新 GPS
const ARRIVE_THRESHOLD_M = 200    // 200m 視為抵達

export function useGpsProgress(nextSpot) {
  const [state, setState] = useState({
    status: 'idle',        // idle | locating | moving | arriving | error
    distanceM: null,
    durationMin: null,
    durationText: null,
    distanceText: null,
    progress: 0,
    errorMsg: null,
  })

  const legStartDistRef = useRef(null)  // 這段路程起始距離（首次 GPS 讀值）
  const prevSpotIdRef   = useRef(null)
  const timerRef        = useRef(null)
  const mountedRef      = useRef(true)

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false } }, [])

  const fetchEta = useCallback(async (position) => {
    if (!nextSpot?.address) return
    try {
      const origin = `${position.coords.latitude},${position.coords.longitude}`
      const result = await getDrivingEta(origin, nextSpot.address)
      if (!mountedRef.current) return

      const distM = result.etaMinutes * 60 * (result.distanceText?.includes('km')
        ? parseFloat(result.distanceText) * 1000 / result.etaMinutes / 60
        : 1)

      // 用 etaMinutes 做粗略距離估算備用；直接用 Distance Matrix 的 distance
      // 實際上 Distance Matrix API 回傳的 distanceText 是字串("1.2 km")，需另外解析
      // 改用 result.rawDistanceM 如果有的話，否則用 etaMinutes 分鐘 × 假設平均 25km/h
      const rawDistM = result.rawDistanceM ?? result.etaMinutes * 25000 / 60

      if (prevSpotIdRef.current !== nextSpot.id) {
        prevSpotIdRef.current = nextSpot.id
        legStartDistRef.current = rawDistM
      }

      const start    = legStartDistRef.current ?? rawDistM
      const progress = start > 0 ? Math.min(1, Math.max(0, 1 - rawDistM / start)) : 0
      const arriving = rawDistM < ARRIVE_THRESHOLD_M

      setState({
        status: arriving ? 'arriving' : 'moving',
        distanceM: rawDistM,
        durationMin: result.etaMinutes,
        durationText: result.etaText,
        distanceText: result.distanceText,
        progress,
        errorMsg: null,
      })
    } catch (err) {
      if (!mountedRef.current) return
      setState((s) => ({ ...s, status: 'error', errorMsg: err.message }))
    }
  }, [nextSpot])

  const poll = useCallback(() => {
    if (!nextSpot) {
      setState({ status: 'idle', distanceM: null, durationMin: null, durationText: null, distanceText: null, progress: 0, errorMsg: null })
      return
    }
    setState((s) => ({ ...s, status: s.status === 'idle' ? 'locating' : s.status }))
    navigator.geolocation.getCurrentPosition(fetchEta, (err) => {
      if (!mountedRef.current) return
      setState((s) => ({ ...s, status: 'error', errorMsg: err.message }))
    }, { enableHighAccuracy: true, timeout: 10000 })
  }, [nextSpot, fetchEta])

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, status: 'error', errorMsg: '此裝置不支援 GPS 定位' }))
      return
    }
    if (!nextSpot) {
      setState({ status: 'idle', distanceM: null, durationMin: null, durationText: null, distanceText: null, progress: 0, errorMsg: null })
      return
    }

    // nextSpot 換了，重置起始距離
    if (prevSpotIdRef.current !== nextSpot.id) {
      legStartDistRef.current = null
    }

    poll()
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(timerRef.current)
  }, [nextSpot, poll])

  return state
}
