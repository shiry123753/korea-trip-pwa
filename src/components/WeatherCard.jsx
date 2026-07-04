import { useWeather } from '../hooks/useWeather'
import { WeatherIcon } from './HandDrawn'
import styles from './WeatherCard.module.css'

export default function WeatherCard() {
  const { weather, status, retry } = useWeather()

  // 有資料（含舊快取）就正常顯示
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

  // 抓不到且無快取：顯示可重試，而不是永遠空白
  if (status === 'error') {
    return (
      <button className={styles.card} onClick={retry} style={{ width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
        <span className={styles.icon}>🌫</span>
        <div className={styles.info}>
          <div className={styles.label}>今日釜山天氣</div>
          <div className={styles.sub}>天氣暫時載不到（可能網路不穩）· 點此重試</div>
        </div>
      </button>
    )
  }

  // 載入中
  return <div className={styles.skeleton} />
}
