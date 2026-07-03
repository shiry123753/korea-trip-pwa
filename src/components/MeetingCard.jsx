import { useState, useEffect } from 'react'
import { useMeetingInfo } from '../hooks/useMeetingInfo'
import { ymdLocal, addDaysYmd, mdLabel } from '../data/dateUtil'
import styles from './MeetingCard.module.css'

// 今日頁「集合時間」（唯讀）。標籤依「集合資料綁定的日期」對比「裝置當天日期」自動切換：
//  - 同一天 → 今日集合時間
//  - 集合是明天 → 明日集合時間（前一天就能提前看到）
//  - 更遠的未來 → 顯示日期
//  - 已過 → 不顯示
// overrideToday：預覽用（?preview=1 的日期），有值就用它當「今天」。
export default function MeetingCard({ overrideToday }) {
  const info = useMeetingInfo()
  const [today, setToday] = useState(() => overrideToday || ymdLocal())

  useEffect(() => {
    if (overrideToday) { setToday(overrideToday); return }
    // 實際使用：用真實裝置日期，每分鐘重算一次（跨午夜會自動翻成「今日」）
    setToday(ymdLocal())
    const id = setInterval(() => setToday(ymdLocal()), 60000)
    return () => clearInterval(id)
  }, [overrideToday])

  if (!info || (!info.time && !info.place)) return null

  const mdate = info.date
  let label
  if (!mdate) {
    label = '集合時間' // 舊資料沒綁日期 → 中性標籤
  } else if (mdate === today) {
    label = '今日集合時間'
  } else if (mdate === addDaysYmd(today, 1)) {
    label = '明日集合時間'
  } else if (mdate > today) {
    label = `${mdLabel(mdate)} 集合時間`
  } else {
    return null // 集合日期已過，不顯示
  }

  return (
    <div className={styles.card}>
      <span className={styles.icon}>🚌</span>
      <div className={styles.body}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>
          {info.time}{info.time && info.place ? ' · ' : ''}{info.place}
        </div>
      </div>
    </div>
  )
}
