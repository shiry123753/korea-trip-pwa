import { useEffect, useCallback, useState } from 'react'
import { useModalChrome } from '../hooks/useModalChrome'
import { buildNavLink } from '../utils/mapsLinks'
import styles from './SpotSheet.module.css'

export default function SpotSheet({ spot, onClose }) {
  const open = !!spot
  useModalChrome(open)

  // 「附近找吃的」GPS 狀態
  const [foodLoading, setFoodLoading] = useState(false)

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  // ESC 關閉
  useEffect(() => {
    if (!open) return
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  async function handleFindFood() {
    setFoodLoading(true)
    try {
      await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 }),
      ).then((pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        window.open(`https://www.google.com/maps/search/맛집/@${lat},${lng},16z`, '_blank', 'noopener')
      })
    } catch { /* ignore */ }
    setFoodLoading(false)
  }

  if (!spot) return null

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <div className={styles.header} style={{ position: 'relative' }}>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
          <div className={styles.emoji}>{spot.emoji}</div>
          <h2 className={styles.name}>{spot.name}</h2>
          <div className={styles.meta}>
            {spot.timeSlot && <span className={styles.badge}>🕐 {spot.timeSlot}</span>}
            {spot.durationMin > 0 && <span className={styles.badge}>⏱ 約 {spot.durationMin} 分鐘</span>}
          </div>
        </div>

        {spot.note && <p className={styles.note}>📌 {spot.note}</p>}
        <div className={styles.divider} />

        {spot.desc && <p className={styles.desc}>{spot.desc}</p>}

        {!spot.isTransit && !spot.isHotel && (
          <div className={styles.actions}>
            <a
              className={`${styles.btn} ${styles.btnPrimary}`}
              href={buildNavLink(spot.address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              🗺 導航過來
            </a>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary} ${foodLoading ? styles.btnDisabled : ''}`}
              onClick={handleFindFood}
              disabled={foodLoading}
            >
              {foodLoading ? '定位中…' : '🍜 附近找吃的'}
            </button>
          </div>
        )}

        {spot.isHotel && spot.address && (
          <div className={styles.actions}>
            <a
              className={`${styles.btn} ${styles.btnPrimary}`}
              href={buildNavLink(spot.address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              🏨 導航回飯店
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
