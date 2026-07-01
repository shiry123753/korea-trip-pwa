import { useWeather } from '../hooks/useWeather'
import styles from './WeatherCard.module.css'

const ICONS = { sun: '☀️', partly: '⛅', cloud: '☁️', rain: '🌧️' }

export default function WeatherCard() {
  const weather = useWeather()

  if (!weather) return <div className={styles.skeleton} />

  return (
    <div className={styles.card}>
      <span className={styles.icon}>{ICONS[weather.icon] ?? '🌡️'}</span>
      <div className={styles.info}>
        <div className={styles.label}>今日釜山天氣</div>
        <div className={styles.temp}>{weather.max}° <span style={{ fontWeight: 400, fontSize: 16 }}>/ {weather.min}°</span></div>
        <div className={styles.sub}>{weather.label}</div>
      </div>
    </div>
  )
}
