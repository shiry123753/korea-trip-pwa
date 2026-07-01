import { useState } from 'react'
import { DAYS } from '../data/itinerary'
import SpotSheet from '../components/SpotSheet'
import styles from './ItineraryPage.module.css'

const DAY_LABELS = ['日','一','二','三','四','五','六']
function dow(dateStr) {
  return DAY_LABELS[new Date(dateStr + 'T00:00:00').getDay()]
}
function fmtTab(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function ItineraryPage() {
  const [activeDayId, setActiveDayId] = useState(DAYS[0].id)
  const [sheetSpot, setSheetSpot]     = useState(null)

  const activeDay = DAYS.find((d) => d.id === activeDayId) ?? DAYS[0]

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>5 日行程</div>
        <div className={styles.headerSub}>釜山 2026/07/04 – 07/08</div>
      </div>

      {/* Day tabs */}
      <div className={styles.tabs}>
        {DAYS.map((day) => (
          <button
            key={day.id}
            className={`${styles.tab}${day.id === activeDayId ? ` ${styles.tabActive}` : ''}`}
            onClick={() => setActiveDayId(day.id)}
          >
            {day.label}<br />
            <span style={{ fontWeight: 500, opacity: 0.7 }}>
              {fmtTab(day.date)}（{dow(day.date)}）
            </span>
          </button>
        ))}
      </div>

      {/* Day header */}
      <div className={styles.dayHeader}>
        <div className={styles.dayLabel}>{activeDay.label}・{activeDay.subtitle}</div>
        {activeDay.hotel && (
          <div className={styles.dayHotel}>
            🏨 {activeDay.hotel.name}
            <span style={{ color: '#a09890' }}>｜{activeDay.hotel.phone}</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className={styles.timeline}>
        {activeDay.spots.map((spot, i) => {
          const isLast = i === activeDay.spots.length - 1
          return (
            <div key={spot.id} className={styles.timelineRow}>
              <div className={styles.timelineLeft}>
                <div className={`${styles.dot}${spot.isHotel || spot.isTransit ? ` ${styles.dotMuted}` : ''}`} />
                {!isLast && <div className={styles.line} />}
                <div className={styles.timelineTime}>{spot.timeSlot}</div>
              </div>
              <button
                className={styles.timelineCard}
                onClick={() => setSheetSpot(spot)}
              >
                <span className={styles.cardEmoji}>{spot.emoji}</span>
                <div className={styles.cardBody}>
                  <div className={styles.cardName}>{spot.name}</div>
                  {(spot.durationMin > 0 || spot.note) && (
                    <div className={styles.cardMeta}>
                      {spot.durationMin > 0 && `約 ${spot.durationMin} 分鐘`}
                      {spot.note && (spot.durationMin > 0 ? '・' : '') + spot.note}
                    </div>
                  )}
                </div>
                <span className={styles.cardChevron}>›</span>
              </button>
            </div>
          )
        })}
      </div>

      <SpotSheet spot={sheetSpot} onClose={() => setSheetSpot(null)} />
    </div>
  )
}
