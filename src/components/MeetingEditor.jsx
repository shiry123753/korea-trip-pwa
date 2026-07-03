import { useState, useEffect } from 'react'
import { useMeetingInfo, saveMeetingInfo, meetingReminderText } from '../hooks/useMeetingInfo'
import { sendPush, formatSendResult } from '../data/pushClient'
import styles from './Backend.module.css'

function hmToMin(hm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec((hm || '').trim())
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}

// 後台：設定/修改今日集合時間，並提供倒數 + 一鍵發送集合提醒（方案二）
export default function MeetingEditor() {
  const info = useMeetingInfo()
  const [time, setTime] = useState('')
  const [place, setPlace] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const [now, setNow] = useState(() => new Date())
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState('')

  useEffect(() => {
    if (info) { setTime(info.time || ''); setPlace(info.place || '') }
  }, [info?.time, info?.place])

  // 每 15 秒更新一次倒數（用現場裝置的當地時間，到韓國會自動是韓國時間）
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(id)
  }, [])

  async function save() {
    setBusy(true); setMsg('')
    try {
      await saveMeetingInfo({ time, place })
      setMsg('✅ 已儲存，團員今日頁會即時更新')
    } catch (e) {
      setMsg(`⚠️ ${e.message || '儲存失敗'}`)
    } finally {
      setBusy(false)
    }
  }

  async function sendReminder() {
    setSending(true); setSendMsg('')
    const res = await sendPush({ title: '🚌 集合提醒', body: meetingReminderText(info) })
    setSendMsg(formatSendResult(res))
    setSending(false)
  }

  // 倒數計算（依已儲存的集合時間）
  const meetMin = hmToMin(info?.time)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const diff = meetMin != null ? meetMin - nowMin : null
  const hasMeeting = !!(info && info.time)

  let countdown = null
  if (hasMeeting) {
    if (diff > 0) {
      countdown = { text: `還有 ${diff} 分鐘到集合時間（${info.time}${info.place ? ` · ${info.place}` : ''}）`, hot: diff <= 15 }
    } else if (diff > -90) {
      countdown = { text: `⏰ 集合時間到了！（${info.time}${info.place ? ` · ${info.place}` : ''}）`, hot: true }
    } else {
      countdown = { text: `集合時間：${info.time}${info.place ? ` · ${info.place}` : ''}`, hot: false }
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.secTitle}>今日集合時間</div>
      <div className={styles.row}>
        <input className={styles.input} placeholder="08:30" value={time} onChange={(e) => setTime(e.target.value)} />
        <input className={styles.input} placeholder="大廳集合" value={place} onChange={(e) => setPlace(e.target.value)} />
      </div>
      <button className={styles.btn} onClick={save} disabled={busy}>
        {busy ? '儲存中…' : '儲存集合時間'}
      </button>
      {msg && <div className={styles.msg}>{msg}</div>}

      {hasMeeting && (
        <div className={styles.countdownBox}>
          <div className={`${styles.countdown}${countdown.hot ? ` ${styles.countdownHot}` : ''}`}>
            {countdown.text}
          </div>
          <button className={styles.btnPrimary} onClick={sendReminder} disabled={sending}>
            {sending ? '發送中…' : '📣 發送集合提醒給所有人'}
          </button>
          {sendMsg && <div className={styles.msg}>{sendMsg}</div>}
        </div>
      )}
    </section>
  )
}
