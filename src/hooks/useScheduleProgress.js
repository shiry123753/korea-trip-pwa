import { useState, useEffect } from 'react'

// ───────────────────────────────────────────────────────────────
// 第一階段「時間表推算」進度來源。
// 設計成可替換：第二階段要接真實 GPS 時，只要在這層之上覆蓋
// legProgress / remainingMin 即可，不需改動 HomePage 的畫面邏輯。
// ───────────────────────────────────────────────────────────────

function toMin(hhmm) {
  if (typeof hhmm !== 'string') return null
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// 由行程資料推算每一段「移動」的時間表。
// 預設：出發時間 = 該站 timeSlot + durationMin；抵達 = 下一站 timeSlot。
// 若某一站另外填了 departAt / travelMin，就以填的為準（方便微調每段路）。
export function getDayLegs(day) {
  if (!day?.spots?.length) return []
  const spots = day.spots
  const legs = []
  for (let i = 0; i < spots.length - 1; i++) {
    const s = spots[i]
    const nx = spots[i + 1]
    const startMin = toMin(s.timeSlot) ?? 0
    const depart = s.departAt != null ? toMin(s.departAt) : startMin + (s.durationMin || 0)
    const arriveDefault = toMin(nx.timeSlot)
    const arrive = s.travelMin != null
      ? depart + s.travelMin
      : (arriveDefault != null ? Math.max(depart, arriveDefault) : depart)
    legs.push({ index: i, from: s, to: nx, depart, arrive, travel: Math.max(0, arrive - depart) })
  }
  return legs
}

// 純函式：給「當天資料」與「現在幾點（當日分鐘）」，算出巴士進度。
// phase: none | before | moving | dwell | done
export function computeScheduleProgress(day, nowMin) {
  const base = {
    phase: 'none', movingLegIndex: -1, legProgress: 0,
    remainingMin: null, atSpotIndex: -1, destSpot: null,
  }
  if (!day?.spots?.length) return base
  const legs = getDayLegs(day)
  if (!legs.length) return { ...base, phase: 'dwell', atSpotIndex: 0, destSpot: day.spots[0] }

  // 正在某一段移動中？
  for (const leg of legs) {
    if (nowMin >= leg.depart && nowMin < leg.arrive) {
      const p = leg.travel > 0 ? (nowMin - leg.depart) / leg.travel : 1
      return {
        phase: 'moving',
        movingLegIndex: leg.index,
        legProgress: Math.min(1, Math.max(0, p)),
        remainingMin: Math.max(0, Math.round(leg.arrive - nowMin)),
        destSpot: leg.to,
        atSpotIndex: -1,
      }
    }
  }
  // 還沒出發（第一段之前）
  if (nowMin < legs[0].depart) {
    return { ...base, phase: 'before', atSpotIndex: 0, destSpot: day.spots[0] }
  }
  // 全部走完
  if (nowMin >= legs[legs.length - 1].arrive) {
    const last = day.spots.length - 1
    return { ...base, phase: 'done', atSpotIndex: last, destSpot: day.spots[last] }
  }
  // 停留在某一站（兩段移動之間）
  let atIdx = 0
  for (const leg of legs) if (nowMin >= leg.arrive) atIdx = leg.index + 1
  return { ...base, phase: 'dwell', atSpotIndex: atIdx, destSpot: day.spots[atIdx] }
}

function realNowMin() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

// Hook：即時感 —— 每 20 秒自動重算一次，巴士會自己往前跑。
// overrideNowMin 有值時 = 用「模擬時間」（給預覽用），不啟動計時器。
export function useScheduleProgress(day, overrideNowMin) {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (overrideNowMin != null) return
    const id = setInterval(() => setTick((t) => t + 1), 20000)
    return () => clearInterval(id)
  }, [overrideNowMin])

  const nowMin = overrideNowMin != null ? overrideNowMin : realNowMin()
  return computeScheduleProgress(day, nowMin)
}
