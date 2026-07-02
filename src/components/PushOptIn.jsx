import { useState, useEffect } from 'react'
import {
  enablePush, getNotificationPermission, pushCapability,
  initForegroundPush, getStoredToken,
} from '../push/push'
import styles from './PushOptIn.module.css'

export default function PushOptIn() {
  const [cap, setCap] = useState(null) // null = 尚未判斷
  const [registered, setRegistered] = useState(false)
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const c = pushCapability()
    setCap(c)
    const t = getStoredToken()
    if (t) { setToken(t); setRegistered(true) }
    if (c.basicOk && getNotificationPermission() === 'granted') initForegroundPush()
  }, [])

  async function handleEnable() {
    setBusy(true); setMsg('')
    try {
      const t = await enablePush()
      await initForegroundPush()
      setToken(t)
      setRegistered(true)
      setMsg('✅ 已成功寫入 Firestore push_tokens！可以去 Console 發測試訊息了。')
    } catch (e) {
      setMsg(`⚠️ ${e.message || '開啟失敗'}`)
    } finally {
      setBusy(false)
    }
  }

  if (cap === null) return null

  // 已成功註冊：綠色狀態 + 顯示 token 供測試
  if (registered) {
    return (
      <div className={styles.card}>
        <div className={styles.doneRow}>
          <span className={styles.icon}>🔔</span>
          <div className={styles.doneText}>已開啟並註冊此裝置</div>
        </div>
        <details className={styles.tokenBox}>
          <summary>顯示此裝置的推播 token（測試用）</summary>
          <textarea className={styles.tokenArea} readOnly value={token} onClick={(e) => e.target.select()} />
          <div className={styles.tokenHint}>把這串貼到 Firebase Console → Cloud Messaging → 傳送測試訊息。</div>
        </details>
        <button className={styles.linkBtn} onClick={handleEnable} disabled={busy}>
          {busy ? '重新註冊中…' : '重新註冊 / 更新 token'}
        </button>
        {msg && <div className={styles.msg}>{msg}</div>}
      </div>
    )
  }

  // iPhone 尚未加入主畫面：給引導（Safari 分頁無法授權）
  if (cap.isIos && !cap.standalone) {
    return (
      <div className={styles.card}>
        <div className={styles.head}>
          <span className={styles.icon}>🔔</span>
          <div className={styles.title}>開啟行程提醒通知</div>
        </div>
        <div className={styles.iosHint}>
          📱 iPhone 請先用 Safari 點「<b>分享</b> → <b>加入主畫面</b>」，
          再從主畫面圖示打開這個 App，才能開啟通知。
        </div>
      </div>
    )
  }

  // iPhone 已是 standalone 但系統太舊（沒有 PushManager = iOS < 16.4）
  if (cap.isIos && cap.standalone && !cap.basicOk) {
    return (
      <div className={styles.card}>
        <div className={styles.head}>
          <span className={styles.icon}>🔔</span>
          <div className={styles.title}>開啟行程提醒通知</div>
        </div>
        <div className={styles.iosHint}>
          你的 iPhone 需要 <b>iOS 16.4 以上</b> 才支援網頁通知。請更新系統後，再從主畫面圖示開啟。
        </div>
      </div>
    )
  }

  // 支援 → 顯示授權按鈕
  if (cap.basicOk) {
    return (
      <div className={styles.card}>
        <div className={styles.head}>
          <span className={styles.icon}>🔔</span>
          <div className={styles.title}>開啟行程提醒通知</div>
        </div>
        <div className={styles.desc}>開啟後可收到集合提醒、明日行程與天氣通知。</div>
        <button className={styles.btn} onClick={handleEnable} disabled={busy}>
          {busy ? '處理中…' : '開啟通知並註冊此裝置'}
        </button>
        {getNotificationPermission() === 'denied' && (
          <div className={styles.deniedHint}>
            目前是「封鎖」狀態。請到瀏覽器網站設定把「通知」改成允許，再試一次。
          </div>
        )}
        {msg && <div className={styles.msg}>{msg}</div>}
      </div>
    )
  }

  // 其他（桌機瀏覽器不支援通知）→ 不佔版面
  return null
}
