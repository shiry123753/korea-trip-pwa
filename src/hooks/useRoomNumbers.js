import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

// 房號（門牌）：check-in 後由後台登錄，存 Firestore room_numbers/current。
// 格式 { numbers: { 'room-A': '301', ... } }，住宿頁即時讀取、免重新部署。
const ref = () => doc(db, 'room_numbers', 'current')

export function useRoomNumbers() {
  const [nums, setNums] = useState(null) // null=讀取中，{}=尚未登錄
  useEffect(() => {
    const unsub = onSnapshot(
      ref(),
      (snap) => setNums(snap.exists() ? (snap.data().numbers || {}) : {}),
      () => setNums({}),
    )
    return unsub
  }, [])
  return nums
}

export async function saveRoomNumbers(numbers) {
  await setDoc(ref(), { numbers: numbers || {}, updatedAt: serverTimestamp() }, { merge: true })
}
