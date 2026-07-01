import { NavLink } from 'react-router-dom'
import { useNavHidden } from '../../hooks/useModalChrome'
import styles from './BottomNav.module.css'

const TABS = [
  { to: '/',          label: '今日', icon: '/nav_home.png' },
  { to: '/itinerary', label: '行程', icon: '/nav_trip.png' },
  { to: '/rooms',     label: '住宿', emoji: '🏨' },
]

export default function BottomNav() {
  const hidden = useNavHidden()
  if (hidden) return null

  return (
    <nav className={styles.nav}>
      {TABS.map(({ to, label, icon, emoji }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `${styles.tab}${isActive ? ` ${styles.active}` : ''}`}
        >
          {icon
            ? <img src={icon} alt="" className={styles.iconImg} />
            : <span className={styles.emoji}>{emoji}</span>}
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
