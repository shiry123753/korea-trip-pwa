import { useState } from 'react'
import { setSession } from '../hooks/useSession'
import styles from './SetupScreen.module.css'

const AVATARS = [
  '/av1.png','/av2.png','/av3.png','/av4.png','/av5.png','/av6.png',
  '/av7.png','/av8.png','/av9.png','/av10.png',
  '/av_p8313.png','/av_p8316.png','/av_p8319.png','/av_p8315.png',
  '/av_p4859.png','/av_p8318.png','/av_p8317.png','/av_p4776.png',
]

export default function SetupScreen() {
  const [realName, setRealName] = useState('')
  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar]     = useState(AVATARS[0])

  function handleStart() {
    if (!realName.trim()) return
    setSession({ realName: realName.trim(), nickname: nickname.trim(), avatar })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img className={styles.cover} src="/IMG_6353.jpg" alt="釜山旅行封面" />
        <div className={styles.title}>釜山旅行 🇰🇷</div>
        <div className={styles.sub}>先設定一下你自己</div>

        <label className={styles.label}>真實姓名（必填）</label>
        <input
          className={styles.input}
          placeholder="請輸入姓名"
          value={realName}
          onChange={(e) => setRealName(e.target.value)}
          maxLength={10}
          autoFocus
        />

        <label className={styles.label}>暱稱（選填）</label>
        <input
          className={styles.input}
          placeholder="請輸入暱稱"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={12}
        />

        <label className={styles.label}>選擇頭像</label>
        <div className={styles.preview}>
          <img src={avatar} alt="頭像預覽" className={styles.previewImg} />
        </div>
        <div className={styles.grid}>
          {AVATARS.map((a) => (
            <button
              key={a}
              className={`${styles.avatarBtn}${avatar === a ? ` ${styles.on}` : ''}`}
              onClick={() => setAvatar(a)}
            >
              <img src={a} alt="" className={styles.avatarImg} />
            </button>
          ))}
        </div>

        <button
          className={styles.primary}
          disabled={!realName.trim()}
          onClick={handleStart}
        >
          開始旅行 ✈️
        </button>
      </div>
    </div>
  )
}
