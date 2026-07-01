// 後台指標計算：把 analytics_events 的原始事件，整理成後台要顯示的數字。
// 停留時間定義：同一個 sessionId 的最早與最晚事件時間相減。

// 使用路徑漏斗的預設階段（依 App 實際頁面順序）
export const FUNNEL_STAGES = ['onboarding', 'home', 'itinerary', 'rooms']

function eventMillis(e) {
  if (e.timestamp && typeof e.timestamp.toMillis === 'function') return e.timestamp.toMillis()
  if (typeof e.clientTime === 'number') return e.clientTime
  return 0
}

function localDateKey(ms) {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function computeMetrics(rawEvents) {
  // 正規化 + 排序
  const events = rawEvents
    .map((e) => ({ ...e, _ms: eventMillis(e) }))
    .filter((e) => e._ms > 0)
    .sort((a, b) => a._ms - b._ms)

  // ── sessions：sessionId -> { deviceId, name, min, max } ──
  const sessions = new Map()
  for (const e of events) {
    if (!e.sessionId) continue
    let s = sessions.get(e.sessionId)
    if (!s) {
      s = { sessionId: e.sessionId, deviceId: e.deviceId, name: e.userName || '', min: e._ms, max: e._ms }
      sessions.set(e.sessionId, s)
    }
    if (e._ms < s.min) s.min = e._ms
    if (e._ms > s.max) s.max = e._ms
    if (e.userName) s.name = e.userName // 用最新的名字
    if (e.deviceId) s.deviceId = e.deviceId
  }

  // ── deviceInfo：deviceId -> 裝置資訊（只在 session_start 記錄，取最新一筆）──
  const deviceInfoMap = new Map()
  for (const e of events) {
    if (e.deviceInfo && e.deviceId) deviceInfoMap.set(e.deviceId, e.deviceInfo)
  }

  // ── devices：deviceId -> 匯總 ──
  const devices = new Map()
  for (const s of sessions.values()) {
    const key = s.deviceId || '(unknown)'
    let d = devices.get(key)
    if (!d) {
      d = { deviceId: key, name: s.name || '', sessions: 0, totalStay: 0, lastSeen: 0, deviceInfo: null }
      devices.set(key, d)
    }
    d.sessions += 1
    d.totalStay += Math.max(0, s.max - s.min)
    if (s.max > d.lastSeen) d.lastSeen = s.max
    if (s.name) d.name = s.name
  }
  for (const d of devices.values()) {
    d.deviceInfo = deviceInfoMap.get(d.deviceId) || null
  }

  const deviceList = [...devices.values()].sort((a, b) => b.lastSeen - a.lastSeen)

  const uniqueUsers = devices.size
  const totalSessions = sessions.size
  const totalStayAll = deviceList.reduce((sum, d) => sum + d.totalStay, 0)
  const avgStayPerPerson = uniqueUsers ? totalStayAll / uniqueUsers : 0

  // ── feature_click 排名 ──
  const featureCounts = new Map()
  for (const e of events) {
    if (e.type !== 'feature_click') continue
    const k = e.page || '(unknown)'
    featureCounts.set(k, (featureCounts.get(k) || 0) + 1)
  }
  const topFeatures = [...featureCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // ── page_view 次數 + 每頁平均停留 ──
  // 每頁停留 ≈ 該 page_view 事件到同一 session 下一個事件的時間差
  const eventsBySession = new Map()
  for (const e of events) {
    if (!e.sessionId) continue
    if (!eventsBySession.has(e.sessionId)) eventsBySession.set(e.sessionId, [])
    eventsBySession.get(e.sessionId).push(e)
  }
  const pageCounts = new Map()
  const pageDwellSum = new Map()
  const pageDwellN = new Map()
  for (const list of eventsBySession.values()) {
    for (let i = 0; i < list.length; i++) {
      const e = list[i]
      if (e.type !== 'page_view') continue
      const k = e.page || '(unknown)'
      pageCounts.set(k, (pageCounts.get(k) || 0) + 1)
      const next = list[i + 1]
      if (next) {
        const dwell = next._ms - e._ms
        if (dwell > 0 && dwell < 1000 * 60 * 30) { // 忽略 >30 分的離群值（可能是掛著沒關）
          pageDwellSum.set(k, (pageDwellSum.get(k) || 0) + dwell)
          pageDwellN.set(k, (pageDwellN.get(k) || 0) + 1)
        }
      }
    }
  }
  const topPages = [...pageCounts.entries()]
    .map(([name, count]) => {
      const n = pageDwellN.get(name) || 0
      const avgDwell = n ? (pageDwellSum.get(name) || 0) / n : 0
      return { name, count, avgDwell }
    })
    .sort((a, b) => b.count - a.count)

  // ── 每日活躍（不重複 deviceId）──
  const dailyMap = new Map() // date -> Set(deviceId)
  for (const e of events) {
    const day = localDateKey(e._ms)
    if (!dailyMap.has(day)) dailyMap.set(day, new Set())
    if (e.deviceId) dailyMap.get(day).add(e.deviceId)
  }
  const daily = [...dailyMap.entries()]
    .map(([date, set]) => ({ date, count: set.size }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))

  // ── 錯誤紀錄（最新在前）──
  const errors = events
    .filter((e) => e.type === 'error')
    .map((e) => ({
      ms: e._ms,
      page: e.page || '(unknown)',
      deviceId: e.deviceId || '(unknown)',
      name: e.userName || '',
      message: e.message || '(no message)',
    }))
    .sort((a, b) => b.ms - a.ms)
    .slice(0, 100)

  // ── 使用路徑漏斗：每階段「曾造訪過該頁面的不重複裝置數」（不要求嚴格順序）──
  const visitedByStage = FUNNEL_STAGES.map(() => new Set())
  for (const e of events) {
    if (e.type !== 'page_view') continue
    const idx = FUNNEL_STAGES.indexOf(e.page)
    if (idx >= 0 && e.deviceId) visitedByStage[idx].add(e.deviceId)
  }
  const funnel = FUNNEL_STAGES.map((stage, i) => {
    const count = visitedByStage[i].size
    const prev = i === 0 ? count : visitedByStage[i - 1].size
    const retention = prev > 0 ? (count / prev) * 100 : 0
    return { stage, count, retention }
  })

  return {
    totalEvents: events.length,
    uniqueUsers,
    totalSessions,
    avgStayPerPerson,
    devices: deviceList,
    topFeatures,
    topPages,
    daily,
    errors,
    funnel,
  }
}

export function fmtDuration(ms) {
  if (!ms || ms < 0) return '0 秒'
  const totalSec = Math.round(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  if (m <= 0) return `${s} 秒`
  if (m < 60) return `${m} 分 ${s} 秒`
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${h} 小時 ${mm} 分`
}

export function fmtDateTime(ms) {
  if (!ms) return '—'
  try {
    return new Date(ms).toLocaleString('zh-TW', {
      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return new Date(ms).toISOString()
  }
}
