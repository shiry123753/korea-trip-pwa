import { useState, useRef } from 'react'
import styles from './BusIcon.module.css'

// 統一的巴士圖示（去背手繪風 bus-icon.png）
// - 待機：輕微搖晃/呼吸（純 CSS）
// - 點擊：跳出提示氣泡（傳 tip 才有），2.2 秒自動收起
export default function BusIcon({ tip, alt = '巴士', className = '', size = 42 }) {
  const [show, setShow] = useState(false)
  const timer = useRef()

  function tap(e) {
    if (e && e.stopPropagation) e.stopPropagation()
    if (!tip) return
    setShow(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setShow(false), 2200)
  }

  return (
    <span className={`${styles.busWrap} ${className}`} onClick={tap} role="img" aria-label={alt}>
      <img src="/bus-icon.png" alt={alt} className={styles.busImg} style={{ width: size }} draggable="false" />
      {tip && show && <span className={styles.busTip}>{tip}</span>}
    </span>
  )
}
