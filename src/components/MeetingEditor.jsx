import { useState, useEffect } from 'react'
import { useMeetingInfo, saveMeetingInfo } from '../hooks/useMeetingInfo'
import styles from './Backend.module.css'

// 後台：設定/修改今日集合時間與地點（存 meeting_info/current）
export default function MeetingEditor() {
  const info = useMeetingInfo()
  const [time, setTime] = useState('')
  const [place, setPlace] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (info) { setTime(info.time || ''); setPlace(info.place || '') }
  }, [info?.time, info?.place])

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
    </section>
  )
}
