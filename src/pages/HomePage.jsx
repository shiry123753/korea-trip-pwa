import { useState, useRef } from 'react'
import { useSession, clearSession, getDisplayName } from '../hooks/useSession'
// 第二階段（真實 GPS）再啟用： import { useGpsProgress } from '../hooks/useGpsProgress'
import { getTodayDayData, DAYS } from '../data/itinerary'
import { useScheduleProgress, getDayLegs } from '../hooks/useScheduleProgress'
import WeatherCard from '../components/WeatherCard'
import SpotSheet from '../components/SpotSheet'
import PushOptIn from '../components/PushOptIn'
import MeetingCard from '../components/MeetingCard'
import BusIcon from '../components/BusIcon'
import { SpotIcon } from '../components/HandDrawn'
import { track } from '../analytics/analytics'
import styles from './HomePage.module.css'

export default function HomePage() {
  const session = useSession()
  const [sheetSpot, setSheetSpot] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  // 隱藏「日期預覽」：只有網址帶 ?preview=1 才出現，團員看不到，也不會寫入任何資料
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const previewOn = search.get('preview') === '1'
  const [previewDate, setPreviewDate] = useState(null) // null = 真實今天

  // 推播除錯卡：預設隱藏；?push=1 或「連點問候語 5 下」才顯示（一般團員不會看到）
  const [pushDebug, setPushDebug] = useState(false)
  const tapRef = useRef({ n: 0, t: 0 })
  function secretTap() {
    const nowT = Date.now()
    const s = tapRef.current
    if (nowT - s.t > 1500) s.n = 0
    s.n += 1; s.t = nowT
    if (s.n >= 5) { s.n = 0; setPushDebug(true) }
  }
  const showPushDebug = pushDebug || search.get('push') === '1'
  const [previewMin, setPreviewMin]   = useState(null) // 預覽用「模擬時間」（當日分鐘）；null = 用真實時間

  const todayDay = getTodayDayData(previewDate)

  // 進度來源（第一階段：時間表推算，零成本、不需定位）。
  // 預覽時用模擬時間覆蓋「現在幾點」；第二階段可在這層之上用真實 GPS 覆蓋。
  const simulating = previewOn && !!previewDate && previewMin != null
  const prog = useScheduleProgress(todayDay, simulating ? previewMin : undefined)

  const isTripDate = !!todayDay
  const spots = todayDay?.spots ?? []
  // 目前聚焦的景點（給 Hero 副標）
  const currentSpot = prog.phase === 'moving'
    ? prog.destSpot
    : (prog.atSpotIndex >= 0 ? spots[prog.atSpotIndex] : null)

  return (
    <div className={styles.root}>
      {/* ── 隱藏日期預覽切換器（僅 ?preview=1 顯示，團員看不到）── */}
      {previewOn && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 500,
          display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center',
          padding: '8px 12px', background: '#1a1410',
          paddingTop: 'calc(8px + env(safe-area-inset-top))',
        }}>
          <span style={{ color: '#faf8f5', fontSize: 12, fontWeight: 800, marginRight: 2 }}>預覽</span>
          {DAYS.map((d) => {
            const md = `${Number(d.date.slice(5, 7))}/${Number(d.date.slice(8, 10))}`
            const active = previewDate === d.date
            return (
              <button
                key={d.id}
                onClick={() => {
                  setPreviewDate(d.date)
                  // 預設把模擬時間放到「第一段路程的中間」，一選日期就直接看到巴士在路上
                  const legs = getDayLegs(d)
                  setPreviewMin(legs.length ? Math.round(legs[0].depart + legs[0].travel / 2) : null)
                }}
                style={{
                  padding: '5px 11px', borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.35)',
                  background: active ? '#faf8f5' : 'transparent',
                  color: active ? '#1a1410' : '#faf8f5',
                  fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                }}
              >
                {md}
              </button>
            )
          })}
          <button
            onClick={() => { setPreviewDate(null); setPreviewMin(null) }}
            style={{
              padding: '5px 11px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.35)',
              background: previewDate === null ? '#faf8f5' : 'transparent',
              color: previewDate === null ? '#1a1410' : '#faf8f5',
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            今天
          </button>

          {/* 模擬時間滑桿：拖曳即可看巴士沿著時間表往前跑 */}
          {simulating && (() => {
            const legs = getDayLegs(todayDay)
            const lo = legs.length ? legs[0].depart : 0
            const hi = legs.length ? legs[legs.length - 1].arrive : 1439
            return (
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ color: '#faf8f5', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>
                  模擬 {minToHHMM(previewMin)}
                </span>
                <input
                  type="range" min={lo} max={hi} step={1} value={previewMin}
                  onChange={(e) => setPreviewMin(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#c0392b' }}
                />
              </div>
            )
          })()}
        </div>
      )}

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroTop}>
          <span className={styles.dayTag} onClick={secretTap}>
            嗨，{getDisplayName(session)}！
          </span>
          <button className={styles.profileBtn} onClick={() => { track('feature_click', { page: 'open_profile' }); setShowProfile(true) }}>
            <img src={session?.avatar} alt="avatar" className={styles.profileImg} />
          </button>
        </div>
        <div className={styles.heroTitle}>
          <span className={styles.heroLine}>嘉義有個阿里山</span>
          <span className={styles.heroLine}>全家一起去釜山</span>
        </div>
        {isTripDate && (prog.phase === 'moving'
          ? <div className={styles.heroSub}>🚌 移動中 → {prog.destSpot?.name}</div>
          : currentSpot && <div className={styles.heroSub}>目前：{currentSpot.emoji} {currentSpot.name}</div>
        )}
      </div>

      {/* 推播授權：未註冊者看得到（可授權）；註冊完成後自動隱藏。
          除錯卡只有 ?push=1 或連點問候語 5 下才會出現。 */}
      <PushOptIn debug={showPushDebug} onHide={() => setPushDebug(false)} />

      {!isTripDate ? (
        <div className={styles.noTrip}>
          <div className={styles.noTripEmoji}>🗓</div>
          <div className={styles.noTripText}>今天不在行程日期內<br />7/4 – 7/8 見！</div>
        </div>
      ) : (
        <>
          {/* 第二階段（真實 GPS「前往下一站」卡片）暫時停用，改由下方巴士時間軸顯示，
              避免第一階段就要求定位授權。程式碼保留在檔案下方 GpsProgressCard，之後可再啟用。 */}

          {/* ── 今日/明日集合（後台設定，唯讀；標籤依日期自動切換）── */}
          <MeetingCard overrideToday={previewDate || undefined} />

          {/* ── 天氣 ── */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>今日天氣</div>
            <WeatherCard />
          </div>

          {/* ── 今日景點列表（左側巴士時間軸，依時間表自動推進）── */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>今日行程</div>
            <div className={styles.timeline}>
              {spots.map((spot, i) => {
                const isLast   = i === spots.length - 1
                const moving   = prog.phase === 'moving'
                const isActive = moving && i === prog.movingLegIndex   // 正在走的這一段（第 i → i+1）

                // 這一段（第 i 站 → 第 i+1 站）的填充比例
                let legPct = 0
                if (moving) {
                  legPct = i < prog.movingLegIndex ? 100
                    : i === prog.movingLegIndex ? Math.round(prog.legProgress * 100) : 0
                } else {
                  legPct = i < prog.atSpotIndex ? 100 : 0
                }

                // 節點狀態：已過=實心、目前停留=脈動、未到=空心
                let nodeCls = ''
                if (moving) {
                  nodeCls = i <= prog.movingLegIndex ? styles.nodeDone : ''
                } else if (prog.phase === 'done') {
                  nodeCls = styles.nodeDone
                } else {
                  nodeCls = i < prog.atSpotIndex ? styles.nodeDone
                    : i === prog.atSpotIndex ? styles.nodeCurrent : ''
                }

                // 這一列要不要顯示狀態小字（剩餘時間 / 已抵達…）
                const showStatus = moving ? i === prog.movingLegIndex : i === prog.atSpotIndex

                return (
                  <div key={spot.id} className={`${styles.tlRow}${isActive ? ` ${styles.tlRowActive}` : ''}`}>
                    <div className={styles.rail}>
                      {!isLast && (
                        <div className={`${styles.legTrack}${isActive ? ` ${styles.legTrackActive}` : ''}`}>
                          <div className={styles.legFill} style={{ height: `${legPct}%` }} />
                          {isActive && (
                            <div className={styles.busOnTrack} style={{ top: `${legPct}%` }}>
                              <BusIcon
                                size={40}
                                tip={prog.remainingMin != null
                                  ? `還有 ${prog.remainingMin} 分抵達 ${prog.destSpot?.name ?? ''}`
                                  : undefined}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      <div className={`${styles.node} ${nodeCls}`} />
                    </div>
                    <div className={styles.tlRight}>
                      <SpotRow
                        spot={spot}
                        isCurrent={showStatus}
                        onClick={() => { track('feature_click', { page: 'view_spot' }); setSheetSpot(spot) }}
                      />
                      {showStatus && <StatusLine prog={prog} spot={spot} />}
                    </div>
                  </div>
                )
              })}
            </div>
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

/* 分鐘 → HH:MM（預覽模擬時間顯示用） */
function minToHHMM(min) {
  const m = ((Math.round(min) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/* ── 時間軸上「目前狀態」小字（剩餘時間 / 已抵達 / 尚未出發…）── */
function StatusLine({ prog, spot }) {
  let text
  if (prog.phase === 'moving') {
    text = prog.remainingMin > 0
      ? `🚌 預計還有 ${prog.remainingMin} 分鐘抵達 ${prog.destSpot?.name ?? ''}`
      : `🚌 即將抵達 ${prog.destSpot?.name ?? ''}`
  } else if (prog.phase === 'before') {
    text = '🕐 尚未出發'
  } else if (prog.phase === 'done') {
    text = '🏁 今日行程結束'
  } else {
    text = `✅ 已抵達 ${spot?.name ?? ''}`
  }
  return <div className={styles.legInfo}>{text}</div>
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
      <span className={styles.spotEmoji}><SpotIcon spot={spot} /></span>
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
