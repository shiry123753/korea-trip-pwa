import { useState } from 'react'
import { getTodayDayData } from '../data/itinerary'
import { useTripStatus, saveTripStatus } from '../hooks/useTripStatus'
import styles from './Backend.module.css'

// 後台：手動切換今日頁行程狀態（GPS 失靈/誤判時用）
export default function TripStatusEditor() {
  const status = useTripStatus()
  const today = getTodayDayData()
  const spots = today?.spots ?? []
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function go(mode, destId) {
    setBusy(true); setMsg('')
    try {
      await saveTripStatus({ mode, destId })
      setMsg(mode === 'moving'
        ? `✅ 已設為「移動中 → ${spots.find((s) => s.id === destId)?.name ?? ''}」`
        : '✅ 已恢復自動（依時間表）')
    } catch (e) {
      setMsg(`⚠️ ${e.message || '儲存失敗'}`)
    } finally {
      setBusy(false)
    }
  }

  const cur = status?.mode === 'moving'
    ? `手動移動中 → ${spots.find((s) => s.id === status.destId)?.name ?? status.destId}`
    : '自動（依時間表）'

  return (
    <section className={styles.section}>
      <div className={styles.secTitle}>行程狀態（手動切換）</div>
      <div className={styles.msg}>目前：{cur}</div>
      {today ? (
        <>
          <div className={styles.hint}>手動設為「出發前往某站」，所有團員今日頁會立刻顯示移動中：</div>
          <div className={styles.quickRow}>
            {spots.map((s) => (
              <button key={s.id} className={styles.quick} disabled={busy} onClick={() => go('moving', s.id)}>
                ▶ 前往 {s.name}
              </button>
            ))}
          </div>
          <button className={styles.btn} disabled={busy} onClick={() => go('auto')}>
            ↩ 恢復自動（抵達後或誤觸時）
          </button>
        </>
      ) : (
        <div className={styles.hint}>今天不在行程日期內，無法設定移動狀態。</div>
      )}
      {msg && <div className={styles.msg}>{msg}</div>}
    </section>
  )
}
