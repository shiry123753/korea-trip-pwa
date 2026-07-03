// Vercel Serverless Function：後台一鍵群發推播
// - 只在伺服器端執行，FCM 服務帳戶金鑰與所有 token 都不會進到前端
// - 用密碼保護（比對 ANALYTICS_PASSWORD，非 VITE_ 前綴 = 只存在伺服器）
// - 讀 Firestore push_tokens 全部 token → FCM sendEachForMulticast → 回傳成功/失敗數
// - 順手清掉已失效（unregistered）的 token
//
// 需要的環境變數（Vercel）：
//   FIREBASE_SERVICE_ACCOUNT = 服務帳戶 JSON 全文
//   ANALYTICS_PASSWORD       = 後台密碼（與 VITE_ANALYTICS_PASSWORD 同值）

import admin from 'firebase-admin'

function getAdmin() {
  if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT
    if (!raw) throw new Error('伺服器未設定 FIREBASE_SERVICE_ACCOUNT')
    const svc = JSON.parse(raw)
    // 若 private_key 內是被跳脫的 \n，還原成真正換行（防呆，正常貼整份 JSON 不受影響）
    if (svc.private_key) svc.private_key = svc.private_key.replace(/\\n/g, '\n')
    admin.initializeApp({ credential: admin.credential.cert(svc) })
  }
  return admin
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { password, title, body } = req.body || {}

  if (!password || password !== process.env.ANALYTICS_PASSWORD) {
    res.status(401).json({ error: '密碼錯誤或未授權' })
    return
  }
  if (!title && !body) {
    res.status(400).json({ error: '標題與內文不可都空白' })
    return
  }

  try {
    const a = getAdmin()
    const db = a.firestore()
    const snap = await db.collection('push_tokens').get()
    const docs = snap.docs
    const tokens = docs.map((d) => d.data().token).filter(Boolean)

    if (tokens.length === 0) {
      res.status(200).json({ total: 0, sent: 0, failed: 0, note: '目前沒有已授權的裝置' })
      return
    }

    const resp = await a.messaging().sendEachForMulticast({
      tokens,
      notification: { title: title || '', body: body || '' },
    })

    // 清掉失效 token（裝置移除、重裝、token 過期）
    let pruned = 0
    const invalid = ['registration-token-not-registered', 'invalid-registration-token', 'invalid-argument']
    for (let i = 0; i < resp.responses.length; i++) {
      const r = resp.responses[i]
      if (!r.success) {
        const code = r.error?.code || ''
        if (invalid.some((c) => code.includes(c))) {
          try { await docs[i].ref.delete(); pruned++ } catch { /* ignore */ }
        }
      }
    }

    res.status(200).json({
      total: tokens.length,
      sent: resp.successCount,
      failed: resp.failureCount,
      pruned,
    })
  } catch (e) {
    res.status(500).json({ error: e?.message || '發送失敗' })
  }
}
