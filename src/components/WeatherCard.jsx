import { useWeather } from '../hooks/useWeather'
import { WeatherIcon } from './HandDrawn'
import styles from './WeatherCard.module.css'

export default function WeatherCard() {
  const { weather, status, errMsg, retry } = useWeather()

  // 有資料（含舊快取）→ 正常顯示
  if (weather) {
    return (
      <div className={styles.card}>
        <span className={styles.icon}><WeatherIcon icon={weather.icon} /></span>
        <div className={styles.info}>
          <div className={styles.label}>今日釜山天氣</div>
          <div className={styles.temp}>{weather.max}° <span style={{ fontWeight: 400, fontSize: 16 }}>/ {weather.min}°</span></div>
          <div className={styles.sub}>{weather.label}</div>
        </div>
      </div>
    )
  }

  // 沒資料時「絕不空白」：一定顯示一張可點的卡，載入中/失敗都有文字（失敗還會顯示原因，方便除錯）
  const sub = status === 'loading'
    ? '載入中…（點此重試）'
    : `暫時載不到天氣${errMsg ? `（${errMsg}）` : ''} · 點此重試`
  return (
    <button
      className={styles.card}
      onClick={retry}
      style={{ width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
    >
      <span className={styles.icon}>{status === 'loading' ? '⏳' : '🌫'}</span>
      <div className={styles.info}>
        <div className={styles.label}>今日釜山天氣</div>
        <div className={styles.sub}>{sub}</div>
      </div>
    </button>
  )
}
