import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

// 集合時間/地點：存 Firestore meeting_info/current，全團即時共用。
const ref = () => doc(db, 'meeting_info', 'current')

export function useMeetingInfo() {
  const [info, setInfo] = useState(undefined) // undefined=讀取中, null=尚未設定, obj=資料
  useEffect(() => {
    const unsub = onSnapshot(
      ref(),
      (snap) => setInfo(snap.exists() ? snap.data() : null),
      () => setInfo(null),
    )
    return unsub
  }, [])
  return info
}

export async function saveMeetingInfo({ time, place, date }) {
  await setDoc(
    ref(),
    { time: time || '', place: place || '', date: date || '', updatedAt: serverTimestamp() },
    { merge: true },
  )
}

// 集合提醒的內文（發送與快捷鈕共用，避免文字各寫一份）
export function meetingReminderText(info) {
  const time = info?.time || ''
  const place = info?.place || ''
  if (!time && !place) return ''
  return `${time} 於 ${place}集合，請大家準時到！`
}
