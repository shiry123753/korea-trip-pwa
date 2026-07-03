import { useState, useEffect, useRef } from 'react'
import { ROOMS } from '../data/rooms'
import { useRoomNumbers, saveRoomNumbers } from '../hooks/useRoomNumbers'
import styles from './Backend.module.css'

// 後台：check-in 後登錄各房門牌號，住宿頁即時更新（免重新部署）。
// 支援隨時修改／覆蓋：開頁時載入已存的房號，改完再存即覆蓋。
export default function RoomNumberEditor() {
  const saved = useRoomNumbers()
  const [nums, setNums] = useState({})
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const loaded = useRef(false)

  // 只在第一次拿到雲端資料時帶入輸入框，之後保留你正在編輯的內容（不被即時快照覆蓋）
  useEffect(() => {
    if (saved && !loaded.current) { setNums(saved); loaded.current = true }
  }, [saved])

  async function save() {
    setBusy(true); setMsg('')
    try {
      await saveRoomNumbers(nums)
      setMsg('✅ 已儲存，團員住宿頁會即時更新')
    } catch (e) {
      setMsg(`⚠️ ${e.message || '儲存失敗'}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.secTitle}>房號登錄（check-in 後填）</div>
      {ROOMS.map((r) => (
        <div key={r.id} className={styles.roomNumRow}>
          <span className={styles.roomNumLabel}>
            {r.label}<span className={styles.roomNumMembers}>{r.members.join('、')}</span>
          </span>
          <input
            className={styles.roomNumInput}
            placeholder="房號"
            value={nums[r.id] || ''}
            onChange={(e) => setNums((v) => ({ ...v, [r.id]: e.target.value }))}
          />
        </div>
      ))}
      <button className={styles.btn} onClick={save} disabled={busy}>
        {busy ? '儲存中…' : '儲存房號'}
      </button>
      {msg && <div className={styles.msg}>{msg}</div>}
    </section>
  )
}
