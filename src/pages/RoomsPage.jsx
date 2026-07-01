import { useSession } from '../hooks/useSession'
import { ROOMS, HOTELS, findMyRoom } from '../data/rooms'
import styles from './RoomsPage.module.css'

export default function RoomsPage() {
  const session = useSession()
  // 住宿房間用「真實姓名」對應（暱稱只是顯示用，不影響房間分配）
  const myName  = session?.realName ?? session?.name ?? ''
  const myRoom  = findMyRoom(myName)

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>住宿分配</div>
        <div className={styles.headerSub}>23 位團員 · 11 個房間</div>
      </div>

      {/* 飯店資訊 */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>本次飯店</div>
        {HOTELS.map((h) => (
          <div key={h.name} className={styles.hotelCard}>
            <div className={styles.hotelNights}>{h.nights}</div>
            <div className={styles.hotelName}>{h.name}</div>
            <div className={styles.hotelAddr}>{h.addressKr}</div>
            <a className={styles.hotelPhone} href={`tel:${h.phone}`}>{h.phone}</a>
          </div>
        ))}
      </div>

      {/* 我的房間 */}
      {myRoom && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>我的房間</div>
          <div className={`${styles.roomCard} ${styles.myRoom}`}>
            <div className={styles.roomLabel}>{myRoom.label}</div>
            <div className={styles.roomNote}>{myRoom.note}</div>
            <div className={styles.members}>
              {myRoom.members.map((m) => (
                <span key={m} className={`${styles.member} ${m === myName ? styles.memberMe : ''}`}>
                  {m === myName ? `${m} 👈` : m}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 所有房間 */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>全部房間</div>
        {ROOMS.map((room) => {
          const isMyRoom = room.id === myRoom?.id
          return (
            <div key={room.id} className={`${styles.roomCard}${isMyRoom ? ` ${styles.myRoom}` : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className={styles.roomLabel}>{room.label}</div>
                <div className={styles.roomNote}>{room.note}</div>
              </div>
              <div className={styles.members}>
                {room.members.map((m) => (
                  <span key={m} className={`${styles.member} ${m === myName ? styles.memberMe : ''}`}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
