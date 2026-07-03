import { useMeetingInfo } from '../hooks/useMeetingInfo'
import styles from './MeetingCard.module.css'

// 今日頁「集合時間」（唯讀顯示；由後台 /analytics 設定）
export default function MeetingCard() {
  const info = useMeetingInfo()
  if (!info || (!info.time && !info.place)) return null
  return (
    <div className={styles.card}>
      <span className={styles.icon}>🚌</span>
      <div className={styles.body}>
        <div className={styles.label}>今日集合</div>
        <div className={styles.value}>
          {info.time}{info.time && info.place ? ' · ' : ''}{info.place}
        </div>
      </div>
    </div>
  )
}
