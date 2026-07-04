// Vercel Serverless Function：抓 Google Maps 即時路況預估行車時間（含塞車）。
// - 金鑰放伺服器端（GOOGLE_MAPS_SERVER_KEY），前端拿不到。
// - 用 Firestore eta_cache 每段路快取 120 秒 → 23 支手機共用同一筆，Google 呼叫量極小（省額度）。
// - 任何失敗都回 durationMin:null，前端會自動退回「時間表估算」，不會壞掉。

import admin from 'firebase-admin'

function getAdmin() {
  if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT
    if (!raw) throw new Error('未設定 FIREBASE_SERVICE_ACCOUNT')
    const svc = JSON.parse(raw)
    if (svc.private_key) svc.private_key = svc.private_key.replace(/\\n/g, '\n')
    admin.initializeApp({ credential: admin.credential.cert(svc) })
  }
  return admin
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const { origin, dest } = req.body || {}
  if (!origin || !dest) { res.status(200).json({ durationMin: null, source: 'missing-args' }); return }

  const key = process.env.GOOGLE_MAPS_SERVER_KEY
  if (!key) { res.status(200).json({ durationMin: null, source: 'no-key' }); return } // 尚未設金鑰 → 前端退回時間表

  try {
    const a = getAdmin()
    const db = a.firestore()
    const cacheId = Buffer.from(`${origin}__${dest}`).toString('base64').replace(/[^A-Za-z0-9]/g, '').slice(0, 180)
    const ref = db.collection('eta_cache').doc(cacheId)

    // 120 秒內的快取直接回，不打 Google
    const snap = await ref.get()
    const now = Date.now()
    if (snap.exists) {
      const c = snap.data()
      if (c?.ts && now - c.ts < 120000 && c.durationMin != null) {
        res.status(200).json({ durationMin: c.durationMin, source: 'cache' })
        return
      }
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}` +
      `&destinations=${encodeURIComponent(dest)}&departure_time=now&mode=driving&language=zh-TW&key=${key}`
    const gr = await fetch(url)
    const gd = await gr.json()
    const el = gd?.rows?.[0]?.elements?.[0]
    const secs = el?.duration_in_traffic?.value ?? el?.duration?.value
    if (secs == null) {
      res.status(200).json({ durationMin: null, source: 'google-nodata', status: gd?.status, elem: el?.status })
      return
    }
    const durationMin = Math.round(secs / 60)
    ref.set({ durationMin, ts: now, origin, dest }).catch(() => {}) // 寫快取，失敗不影響回應
    res.status(200).json({ durationMin, source: 'live' })
  } catch (e) {
    res.status(200).json({ durationMin: null, source: 'error', error: e?.message })
  }
}
