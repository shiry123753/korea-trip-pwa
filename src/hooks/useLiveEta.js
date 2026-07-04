import { useState, useEffect } from 'react'

// 向 /api/eta 拿 Google 即時路況行車時間；每 90 秒更新一次。
// 失敗或沒設金鑰時回 { durationMin: null }，呼叫端會自動退回時間表估算。
export function useLiveEta(origin, dest, active) {
  const [eta, setEta] = useState({ durationMin: null, live: false })

  useEffect(() => {
    if (!active || !origin || !dest) {
      setEta({ durationMin: null, live: false })
      return
    }
    let alive = true

    async function fetchEta() {
      try {
        const r = await fetch('/api/eta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin, dest }),
        })
        const d = await r.json().catch(() => ({}))
        if (alive && r.ok && d.durationMin != null) {
          setEta({ durationMin: d.durationMin, live: true })
        }
      } catch { /* 失敗就維持退回時間表 */ }
    }

    fetchEta()
    const id = setInterval(fetchEta, 90000)
    return () => { alive = false; clearInterval(id) }
  }, [origin, dest, active])

  return eta
}
