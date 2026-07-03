import { useEffect, useCallback, useState, useRef } from 'react'
import { useModalChrome } from '../hooks/useModalChrome'
import { buildNavLink } from '../utils/mapsLinks'
import { track } from '../analytics/analytics'
import { getStory } from '../data/stories'
import styles from './SpotSheet.module.css'

export default function SpotSheet({ spot, onClose }) {
  const open = !!spot
  useModalChrome(open)

  const [foodLoading, setFoodLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const drag = useRef({ y: 0, moved: 0, active: false })

  const story = spot ? getStory(spot.id) : null

  // 每次開新景點：收合、歸零
  useEffect(() => { setExpanded(false); setDragY(0) }, [spot?.id])

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // 把手拖曳：上拉展開、下拉收合 / 關閉、輕點切換
  function onDown(e) {
    drag.current = { y: e.clientY, moved: 0, active: true }
    setDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  function onMove(e) {
    if (!drag.current.active) return
    const dy = e.clientY - drag.current.y
    drag.current.moved = dy
    setDragY(dy > 0 ? dy : dy * 0.25) // 往下跟手，往上輕微回彈
  }
  function onUp() {
    if (!drag.current.active) return
    const dy = drag.current.moved
    drag.current.active = false
    setDragging(false)
    setDragY(0)
    if (dy < -40) setExpanded(true)
    else if (dy > 110) onClose()
    else if (dy > 40) { if (expanded) setExpanded(false); else onClose() }
    else setExpanded((v) => !v) // 輕點
  }

  async function handleFindFood() {
    track('feature_click', { page: 'find_restaurant' })
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

  const sheetStyle = dragY ? { transform: `translateY(${Math.max(0, dragY)}px)` } : undefined

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={`${styles.sheet}${expanded ? ` ${styles.expanded}` : ''}${dragging ? ` ${styles.dragging}` : ''}`}
        style={sheetStyle}
      >
        {/* 可拖曳把手 */}
        <div
          className={styles.grip}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <div className={styles.handle} />
          {story && (
            <div className={styles.pullHint}>{expanded ? '下拉收合' : '↑ 上拉看歷史故事'}</div>
          )}
        </div>

        <div className={styles.content}>
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
                onClick={() => track('feature_click', { page: 'open_navigation' })}
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
                onClick={() => track('feature_click', { page: 'open_navigation' })}
              >
                🏨 導航回飯店
              </a>
            </div>
          )}

          {/* 歷史故事（上拉展開後閱讀） */}
          {story && (
            <div className={styles.story}>
              <div className={styles.storyTitle}>📖 歷史故事</div>
              {story.image && (
                <img className={styles.storyImg} src={story.image} alt={spot.name} loading="lazy" />
              )}
              {story.blocks.map((b, i) => (
                b.h
                  ? <h3 key={i} className={styles.storyH}>{b.h}</h3>
                  : <p key={i} className={styles.storyP}>{b.p}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
