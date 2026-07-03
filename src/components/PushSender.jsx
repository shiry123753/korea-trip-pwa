import { useState } from 'react'
import { DAYS } from '../data/itinerary'
import { fetchWeatherForDate } from '../data/weatherApi'
import { useMeetingInfo } from '../hooks/useMeetingInfo'
import styles from './Backend.module.css'

const PW = import.meta.env.VITE_ANALYTICS_PASSWORD

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function md(s) {
  return `${Number(s.slice(5, 7))}/${Number(s.slice(8, 10))}`
}
function summarizeDay(day) {
  if (!day) return ''
  const acts = day.spots.filter((s) => !s.isTransit && !s.isHotel)
  const list = acts.length ? acts : day.spots
  return list.map((s) => `${s.timeSlot} ${s.name}`).join('、')
}

export default function PushSender() {
  const meeting = useMeetingInfo()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState('')

  async function quickTomorrow() {
    const t = new Date(); t.setDate(t.getDate() + 1)
    const ds = ymd(t)
    const day = DAYS.find((d) => d.date === ds)
    let text = day ? `明天 ${md(ds)}：${summarizeDay(day)}` : `明天 ${md(ds)} 沒有安排行程`
    try {
      const w = await fetchWeatherForDate(ds)
      if (w) {
        text += `（明天${w.label} ${w.min}~${w.max}°）`
        if (w.rain) text += ' ☔ 記得帶傘！'
      }
    } catch { /* 天氣抓不到就略過 */ }
    setTitle('📅 明日行程提醒')
    setBody(text)
  }

  function quickMeeting() {
    setTitle('🚌 集合提醒')
    if (meeting && (meeting.time || meeting.place)) {
      setBody(`${meeting.time || ''} 於 ${meeting.place || ''}集合，請大家準時到！`)
    } else {
      setBody('（尚未在上方「今日集合時間」設定，先設定後再帶入）')
    }
  }

  function quickCustom() { setTitle(''); setBody('') }

  async function send() {
    if (!title && !body) { setResult('⚠️ 標題與內文不可都空白'); return }
    setBusy(true); setResult('')
    try {
      const r = await fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: PW, title, body }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        setResult(`⚠️ ${data.error || `發送失敗（${r.status}）`}`)
      } else if (data.total === 0) {
        setResult(`ℹ️ ${data.note || '目前沒有已授權的裝置'}`)
      } else {
        const extra = `${data.failed ? `，失敗 ${data.failed} 台` : ''}${data.pruned ? `（清掉 ${data.pruned} 個失效 token）` : ''}`
        setResult(`✅ 成功送給 ${data.sent} 台${extra}`)
      }
    } catch (e) {
      setResult(`⚠️ ${e.message || '發送失敗'}（提醒：本機 npm run dev 無法測試發送，需部署到正式網站）`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.secTitle}>發送推播</div>
      <div className={styles.quickRow}>
        <button className={styles.quick} onClick={quickTomorrow}>明日行程提醒</button>
        <button className={styles.quick} onClick={quickMeeting}>集合提醒</button>
        <button className={styles.quick} onClick={quickCustom}>自訂訊息</button>
      </div>
      <input className={styles.input} placeholder="標題" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className={styles.textarea} placeholder="內文" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
      <button className={styles.btnPrimary} onClick={send} disabled={busy}>
        {busy ? '發送中…' : '發送給所有已授權裝置'}
      </button>
      {result && <div className={styles.msg}>{result}</div>}
      <div className={styles.hint}>提示：本機預覽無法測試發送，需部署到正式網站才會運作。</div>
    </section>
  )
}
