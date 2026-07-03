import { useState, useRef } from 'react'
import styles from './HandDrawn.module.css'

// 手繪風插畫圖示（暖色調：鐵鏽紅 / 芥末黃 / 墨黑 / 米白）
// 待機：輕微浮動/呼吸；點擊：小彈跳回饋。取代生硬 emoji。
// 扁平森林綠視覺語言（全站統一）
const GOLD = '#e0b24a', CREAM = '#ece7db', RAIN = '#6f93a6'
const GREEN = '#356b4e', GREEN2 = '#2a5540', SAGE = '#7ea888', WIN = '#e7e2ad', WINLIT = '#f4ea8f', MIST = '#d8d4c6'

function Poke({ children, alt, extraClass = '' }) {
  const [poke, setPoke] = useState(false)
  const t = useRef()
  function tap(e) {
    if (e && e.stopPropagation) e.stopPropagation()
    setPoke(true)
    clearTimeout(t.current)
    t.current = setTimeout(() => setPoke(false), 450)
  }
  return (
    <span className={`${styles.wrap} ${poke ? styles.poke : ''} ${extraClass}`} onClick={tap} role="img" aria-label={alt}>
      {children}
    </span>
  )
}

function Cloud() {
  return (
    <path d="M13 33 C7 33 6 25 12 24 C12 16 23 14 26 20 C30 15 40 18 38 25 C44 25 44 33 38 33 Z"
      fill={CREAM} />
  )
}

function Sun({ cx = 24, cy = 22, r = 8 }) {
  const rays = []
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4
    rays.push(
      <line key={i}
        x1={cx + Math.cos(a) * (r + 2)} y1={cy + Math.sin(a) * (r + 2)}
        x2={cx + Math.cos(a) * (r + 6)} y2={cy + Math.sin(a) * (r + 6)}
        stroke={GOLD} strokeWidth="2" strokeLinecap="round" />,
    )
  }
  return <g>{rays}<circle cx={cx} cy={cy} r={r} fill={GOLD} /></g>
}

// 共用金色星星（可加閃爍 class）
function Star({ cx, cy, s = 1.4, cls }) {
  const n = (v) => Number(v.toFixed(2))
  const d = `M${cx} ${n(cy - 3 * s)} l${n(0.9 * s)} ${n(2 * s)} ${n(2 * s)} ${n(0.6 * s)} `
    + `-${n(1.6 * s)} ${n(1.4 * s)} ${n(0.5 * s)} ${n(2.1 * s)} -${n(1.8 * s)} -${n(1.1 * s)} `
    + `-${n(1.8 * s)} ${n(1.1 * s)} ${n(0.5 * s)} -${n(2.1 * s)} -${n(1.6 * s)} -${n(1.4 * s)} ${n(2 * s)} -${n(0.6 * s)} Z`
  return <path className={cls} d={d} fill={GOLD} />
}

export function WeatherIcon({ icon = 'cloud', size = 46 }) {
  return (
    <Poke alt="天氣" extraClass={styles.floatWrap}>
      <svg className={styles.floaty} width={size} height={size} viewBox="0 0 48 48" fill="none">
        {icon === 'sun' && <Sun cx={24} cy={24} r={9} />}
        {icon === 'partly' && (<>
          <Sun cx={17} cy={17} r={6} />
          <g transform="translate(4,6)"><Cloud /></g>
        </>)}
        {icon === 'cloud' && <Cloud />}
        {icon === 'rain' && (<>
          <Cloud />
          <g className={styles.rain} stroke={RAIN} strokeWidth="2.4" strokeLinecap="round">
            <line x1="16" y1="36" x2="14" y2="42" />
            <line x1="24" y1="36" x2="22" y2="42" />
            <line x1="32" y1="36" x2="30" y2="42" />
          </g>
        </>)}
      </svg>
    </Poke>
  )
}

export function PlaneIcon({ mode = 'takeoff', size = 42 }) {
  const landing = mode === 'landing'
  const rot = landing ? 10 : -10
  return (
    <Poke alt={landing ? '降落' : '起飛'} extraClass={styles.floatWrap}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        {/* 動態虛線尾流 + 雲朵 */}
        <line className={styles.dash} x1="3" y1="26" x2="16" y2="26" stroke={MIST} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="4 5" />
        <ellipse className={styles.cloudA} cx="12" cy="16" rx="5" ry="3" fill={CLOUD} />
        <ellipse className={styles.cloudB} cx="15" cy="34" rx="4" ry="2.5" fill={CLOUD} />
        <g className={styles.floaty}>
          <g transform={`rotate(${rot} 28 25)`}>
            <path d="M20 25 L14 34 L30 26 Z" fill={GREEN2} />
            <path d="M23 25 L19 31 L32 25 Z" fill={SAGE} />
            <path d="M16 24 L12 15 L23 23 Z" fill={GREEN2} />
            <path d="M12 26 L40 22 Q46 23 46 25 Q46 27 40 27 L12 27 Z" fill={GREEN} />
            <circle cx="39" cy="24.5" r="1.6" fill={WIN} />
            <circle cx="45" cy="25" r="1.3" fill={GOLD} />
          </g>
        </g>
      </svg>
    </Poke>
  )
}

export function HotelIcon({ size = 42 }) {
  return (
    <Poke alt="飯店" extraClass={styles.breathWrap}>
      <svg className={styles.breath} width={size} height={size} viewBox="0 0 48 48" fill="none">
        {/* 月亮 + 星星 */}
        <path className={styles.moon} d="M11 7 A6 6 0 1 0 11 19 A4.5 4.5 0 1 1 11 7 Z" fill={GOLD} />
        <path className={styles.star} d="M37 9 l1 2 2 1 -2 1 -1 2 -1 -2 -2 -1 2 -1 Z" fill={GOLD} />
        <path className={styles.star2} d="M42.5 17 l0.7 1.5 1.5 0.7 -1.5 0.7 -0.7 1.5 -0.7 -1.5 -1.5 -0.7 1.5 -0.7 Z" fill={GOLD} />
        {/* 建築 */}
        <rect x="15" y="17" width="19" height="27" rx="1" fill={GREEN} />
        <rect x="20" y="12" width="9" height="6" rx="1" fill={GREEN} />
        {/* 窗戶（部分會閃爍） */}
        <g>
          <rect x="18" y="21" width="3.5" height="3.5" rx="0.5" fill={WINLIT} />
          <rect x="23" y="21" width="3.5" height="3.5" rx="0.5" fill={WIN} />
          <rect className={styles.winLit} x="28" y="21" width="3.5" height="3.5" rx="0.5" fill={WIN} />
          <rect x="18" y="27" width="3.5" height="3.5" rx="0.5" fill={WIN} />
          <rect className={styles.winLit2} x="23" y="27" width="3.5" height="3.5" rx="0.5" fill={WIN} />
          <rect x="28" y="27" width="3.5" height="3.5" rx="0.5" fill={WIN} />
          <rect className={styles.winLit} x="18" y="33" width="3.5" height="3.5" rx="0.5" fill={WIN} />
          <rect x="23" y="33" width="3.5" height="3.5" rx="0.5" fill={WIN} />
          <rect x="28" y="33" width="3.5" height="3.5" rx="0.5" fill={WINLIT} />
        </g>
        <rect x="22" y="39" width="5" height="5" rx="0.5" fill={WINLIT} />
        {/* 樹叢 */}
        <circle cx="13" cy="45" r="5" fill={GREEN2} />
        <circle cx="36" cy="45" r="5.5" fill={SAGE} />
      </svg>
    </Poke>
  )
}

// 景點/自然/地標：綠色定位標 + 閃爍金星
export function LandmarkIcon({ size = 40 }) {
  return (
    <Poke alt="景點" extraClass={styles.floatWrap}>
      <svg className={styles.floaty} width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M24 6 C15 6 9 12 9 21 C9 30 24 42 24 42 C24 42 39 30 39 21 C39 12 33 6 24 6 Z" fill={GREEN} />
        <circle cx="24" cy="20" r="7" fill={GREEN2} />
        <Star cx={24} cy={20} s={1.5} cls={styles.star} />
      </svg>
    </Poke>
  )
}

// 遊樂/表演：綠色票券 + 閃爍金星
export function FunIcon({ size = 40 }) {
  return (
    <Poke alt="娛樂" extraClass={styles.floatWrap}>
      <svg className={styles.floaty} width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="9" y="16" width="30" height="16" rx="3" fill={GREEN} />
        <circle cx="9" cy="24" r="2.6" fill={CREAM} />
        <circle cx="39" cy="24" r="2.6" fill={CREAM} />
        <Star cx={24} cy={24} s={1.7} cls={styles.star} />
      </svg>
    </Poke>
  )
}

// 購物：綠色購物袋 + 金色提把
export function ShopIcon({ size = 40 }) {
  return (
    <Poke alt="購物" extraClass={styles.floatWrap}>
      <svg className={styles.floaty} width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M13 19 L35 19 L37 42 L11 42 Z" fill={GREEN} />
        <path d="M18 19 C18 11 30 11 30 19" stroke={GOLD} strokeWidth="2.4" fill="none" />
        <Star cx={24} cy={30} s={1.3} cls={styles.star} />
      </svg>
    </Poke>
  )
}

// 交通-纜車：懸吊纜車 + 擺動 + 窗燈
export function TramIcon({ size = 40 }) {
  return (
    <Poke alt="纜車" extraClass={styles.floatWrap}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <line x1="6" y1="10" x2="42" y2="14" stroke={SAGE} strokeWidth="2" />
        <g className={styles.sway}>
          <line x1="24" y1="12" x2="24" y2="18" stroke={GREEN2} strokeWidth="2" />
          <rect x="13" y="18" width="22" height="16" rx="5" fill={GREEN} />
          <rect x="16" y="22" width="6" height="5" rx="1" fill={WIN} />
          <rect className={styles.winLit} x="26" y="22" width="6" height="5" rx="1" fill={WIN} />
        </g>
      </svg>
    </Poke>
  )
}

// 行李/退房：綠色行李箱 + 金色吊牌
export function LuggageIcon({ size = 40 }) {
  return (
    <Poke alt="行李" extraClass={styles.floatWrap}>
      <svg className={styles.floaty} width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="14" y="17" width="20" height="25" rx="3" fill={GREEN} />
        <path d="M19 17 C19 12 29 12 29 17" stroke={GREEN2} strokeWidth="2.4" fill="none" />
        <rect x="14" y="25" width="20" height="3" fill={SAGE} />
        <rect className={styles.moon} x="30" y="20" width="4" height="3" rx="1" fill={GOLD} />
      </svg>
    </Poke>
  )
}

// 依景點資料挑對應圖示（同類別共用，集中管理，方便維護）
export function SpotIcon({ spot }) {
  if (!spot) return null
  if (spot.isHotel) return <HotelIcon />
  const e = spot.emoji
  if (e === '✈️') return <PlaneIcon mode="takeoff" />
  if (e === '🛬') return <PlaneIcon mode="landing" />
  if (e === '🧳') return <LuggageIcon />
  if (e === '🚋') return <TramIcon />
  if (e === '🛍️' || e === '🛒') return <ShopIcon />
  if (e === '🎢' || e === '🎭' || e === '🍬') return <FunIcon />
  if (['🏯', '🌊', '🗼', '🌃', '🎨', '🌁'].includes(e)) return <LandmarkIcon />
  return <>{e}</>
}
