// 前端呼叫後端發送函式的共用入口（後台密碼一起帶上，供伺服器驗證）。
const PW = import.meta.env.VITE_ANALYTICS_PASSWORD

export async function sendPush({ title, body }) {
  try {
    const r = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: PW, title, body }),
    })
    const data = await r.json().catch(() => ({}))
    return { ok: r.ok, status: r.status, ...data }
  } catch (e) {
    return { ok: false, error: e?.message || '發送失敗（本機預覽無法測試發送，需正式網站）' }
  }
}

// 把發送結果整理成一句中文訊息
export function formatSendResult(res) {
  if (!res) return ''
  if (!res.ok) return `⚠️ ${res.error || `發送失敗（${res.status || ''}）`}`
  if (res.total === 0) return `ℹ️ ${res.note || '目前沒有已授權的裝置'}`
  const extra = `${res.failed ? `，失敗 ${res.failed} 台` : ''}${res.pruned ? `（清掉 ${res.pruned} 個失效 token）` : ''}`
  return `✅ 成功送給 ${res.sent} 台${extra}`
}
