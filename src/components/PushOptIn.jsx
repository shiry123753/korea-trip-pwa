import { useState, useEffect } from 'react'
import {
  enablePush, isPushSupported, getNotificationPermission,
  isIosNeedingHomeScreen, initForegroundPush, getStoredToken,
} from '../push/push'
import styles from './PushOptIn.module.css'

export default function PushOptIn() {
  const [supported, setSupported] = useState(null) // null=檢查中
  const [iosHint, setIosHint] = useState(false)
  const [registered, setRegistered] = useState(false) // 是否已成功寫進 Firestore
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let alive = true
    isPushSupported().then((ok) => {
      if (!alive) return
      setSupported(ok)
      setIosHint(isIosNeedingHomeScreen())
      const t = getStoredToken()
      if (t) { setToken(t); setRegistered(true) }
      if (ok && getNotificationPermission() === 'granted') initForegroundPush()
    })
    return () => { alive = false }
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

  if (supported === null) return null
  if (!supported && !iosHint) return null

  // iPhone 尚未加入主畫面：只能給說明，無法在此授權
  if (iosHint && !registered) {
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

  // 已成功註冊：綠色狀態 + 顯示 token 供你複製去 Console 測試
  if (registered) {
    return (
      <div className={styles.card}>
        <div className={`${styles.doneRow}`}>
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

  // 尚未註冊（含「通知已授權但 token 沒寫進去」的情況）
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
