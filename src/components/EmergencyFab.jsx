import { useState, useCallback } from 'react'
import { useModalChrome } from '../hooks/useModalChrome'
import { EMERGENCY } from '../data/emergency'
import styles from './EmergencyFab.module.css'

export default function EmergencyFab() {
  const [open, setOpen] = useState(false)
  useModalChrome(open)

  const close = useCallback((e) => {
    if (e.target === e.currentTarget) setOpen(false)
  }, [])

  return (
    <>
      <button className={styles.fab} onClick={() => setOpen(true)} aria-label="緊急聯絡">
        🆘
      </button>

      {open && (
        <div className={styles.overlay} onClick={close}>
          <div className={styles.sheet}>
            <div className={styles.handle} />
            <div className={styles.title}>緊急聯絡</div>

            <div className={styles.section}>
              <div className={styles.sectionLabel}>領隊聯絡</div>
              {EMERGENCY.contacts.map((c) => (
                <div key={c.phone} className={styles.row}>
                  <div className={styles.rowLeft}>
                    <div className={styles.rowLabel}>{c.flag} {c.label}</div>
                  </div>
                  <a className={styles.callBtn} href={`tel:${c.phone}`}>📞 {c.phone}</a>
                </div>
              ))}
            </div>

            <div className={styles.section}>
              <div className={styles.sectionLabel}>今晚飯店（給計程車司機看）</div>
              {EMERGENCY.hotels.map((h) => (
                <div key={h.name} className={styles.row} style={{ flexDirection: 'column', gap: 8 }}>
                  <div className={styles.rowLeft}>
                    <div className={styles.rowLabel}>{h.name}</div>
                    <div className={styles.rowSub}>{h.nights}</div>
                  </div>
                  <div className={styles.addrKr}>{h.addressKr}</div>
                  <a className={styles.callBtn} href={`tel:${h.phone}`} style={{ alignSelf: 'flex-start' }}>
                    📞 {h.phone}
                  </a>
                </div>
              ))}
            </div>

            <div className={styles.section}>
              <div className={styles.sectionLabel}>緊急電話</div>
              {EMERGENCY.numbers.map((n) => (
                <div key={n.number} className={styles.row}>
                  <div className={styles.rowLeft}>
                    <div className={styles.rowLabel}>{n.icon} {n.label}</div>
                  </div>
                  <a className={styles.callBtn} href={`tel:${n.number}`}>{n.number}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
