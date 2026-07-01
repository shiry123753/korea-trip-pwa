import { useState } from 'react'
import { useSession, clearSession, getDisplayName } from '../hooks/useSession'
import { useGpsProgress } from '../hooks/useGpsProgress'
import { getTodayDayData, getCurrentAndNextSpot } from '../data/itinerary'
import WeatherCard from '../components/WeatherCard'
import SpotSheet from '../components/SpotSheet'
import { track } from '../analytics/analytics'
import styles from './HomePage.module.css'

export default function HomePage() {
  const session = useSession()
  const [sheetSpot, setSheetSpot] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  const todayDay = getTodayDayData()
  const { current, next } = getCurrentAndNextSpot(todayDay)

  const gps = useGpsProgress(next ?? null)

  const isTripDate = !!todayDay

  return (
    <div className={styles.root}>
      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroTop}>
          <span className={styles.dayTag}>
            嗨，{getDisplayName(session)}！
          </span>
          <button className={styles.profileBtn} onClick={() => { track('feature_click', { page: 'open_profile' }); setShowProfile(true) }}>
            <img src={session?.avatar} alt="avatar" className={styles.profileImg} />
          </button>
        </div>
        <div className={styles.heroTitle}>
<<<<<<< HEAD
          嘉義有個阿里山 全家一起去釜山
=======
          <span className={styles.heroLine}>嘉義有個阿里山</span>
          <span className={styles.heroLine}>全家一起去釜山</span>
>>>>>>> dev
        </div>
        {isTripDate && current && (
          <div className={styles.heroSub}>目前：{current.emoji} {current.name}</div>
        )}
      </div>

      {!isTripDate ? (
        <div className={styles.noTrip}>
          <div className={styles.noTripEmoji}>🗓</div>
          <div className={styles.noTripText}>今天不在行程日期內<br />7/4 – 7/8 見！</div>
        </div>
      ) : (
        <>
          {/* ── GPS 移動進度 ── */}
          {next && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>前往下一站</div>
              <GpsProgressCard gps={gps} current={current} next={next} />
            </div>
          )}

          {/* ── 天氣 ── */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>今日天氣</div>
            <WeatherCard />
          </div>

          {/* ── 今日景點列表 ── */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>今日行程</div>
            {todayDay.spots.map((spot) => (
              <SpotRow
                key={spot.id}
                spot={spot}
                isCurrent={spot.id === current?.id}
                onClick={() => { track('feature_click', { page: 'view_spot' }); setSheetSpot(spot) }}
              />
            ))}
          </div>
        </>
      )}

      {/* 景點詳情 Sheet */}
      <SpotSheet spot={sheetSpot} onClose={() => setSheetSpot(null)} />

      {/* Profile sheet */}
      {showProfile && (
        <ProfileSheet session={session} onClose={() => setShowProfile(false)} />
      )}
    </div>
  )
}

/* ── GPS 進度卡片 ─────────────────────── */
function GpsProgressCard({ gps, current, next }) {
  const { status, progress, durationText, distanceText, errorMsg } = gps

  if (status === 'error') {
    return (
      <div className={styles.progressCard}>
        <div className={styles.progressTo}>{next.emoji} {next.name}</div>
        <div className={styles.progressHint}>⚠️ {errorMsg ?? '定位失敗，請確認已開啟 GPS'}</div>
      </div>
    )
  }

  const arriving = status === 'arriving'
  const pct = Math.round(progress * 100)

  return (
    <div className={styles.progressCard}>
      <div className={styles.progressFrom}>
        {current?.name ?? '目前位置'} →
      </div>
      <div className={styles.progressTo}>
        {next.emoji} {next.name}
      </div>
      <div className={styles.bar}>
        <div
          className={`${styles.barFill}${arriving ? ` ${styles.barFillArriving}` : ''}`}
          style={{ width: status === 'locating' ? '0%' : `${pct}%` }}
        />
      </div>
      <div className={styles.progressMeta}>
        <span>
          {status === 'locating'
            ? '定位中…'
            : arriving
            ? '🎉 快到了！'
            : durationText
            ? `約 ${durationText}`
            : `${pct}%`}
        </span>
        {distanceText && <span>{distanceText}</span>}
      </div>
    </div>
  )
}

/* ── 景點列表列 ──────────────────────── */
function SpotRow({ spot, isCurrent, onClick }) {
  return (
    <button
      className={styles.spotCard}
      onClick={onClick}
      style={isCurrent ? { border: '2px solid #1a1410' } : {}}
    >
      <span className={styles.spotEmoji}>{spot.emoji}</span>
      <div className={styles.spotInfo}>
        <div className={styles.spotName}>{spot.name}</div>
        <div className={styles.spotMeta}>
          {spot.timeSlot}
          {spot.durationMin > 0 && ` · 約 ${spot.durationMin} 分鐘`}
          {isCurrent && ' · 📍 現在在這裡'}
        </div>
      </div>
      <span className={styles.spotChevron}>›</span>
    </button>
  )
}

/* ── Profile 小抽屜 ──────────────────── */
function ProfileSheet({ session, onClose }) {
  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:400, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background:'#faf8f5', borderRadius:'24px 24px 0 0', padding:'24px 24px calc(40px + env(safe-area-inset-bottom))' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
          <img src={session?.avatar} alt="" style={{ width:60, height:60, borderRadius:'50%', objectFit:'contain', border:'2px solid rgba(0,0,0,0.08)' }} />
          <div>
            <div style={{ fontSize:20, fontWeight:800 }}>{getDisplayName(session)}</div>
            <div style={{ fontSize:14, color:'#8a7f76', marginTop:2 }}>釜山旅行 7/4 – 7/8</div>
          </div>
        </div>
        <button
          onClick={() => { clearSession(); onClose() }}
          style={{ width:'100%', padding:14, borderRadius:14, border:'1.5px solid rgba(0,0,0,0.12)', background:'#fff', fontSize:15, fontWeight:700, color:'#c0392b', cursor:'pointer', fontFamily:'inherit' }}
        >
          重新設定姓名 / 頭像
        </button>
      </div>
    </div>
  )
}
