import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

// 行程狀態手動覆蓋：後台可手動把今日頁切成「移動中 → 某站」，不完全依賴時間表/GPS。
// trip_status/current = { mode: 'auto' | 'moving', destId, departAtMs }
const ref = () => doc(db, 'trip_status', 'current')

export function useTripStatus() {
  const [st, setSt] = useState(null)
  useEffect(() => {
    const unsub = onSnapshot(
      ref(),
      (snap) => setSt(snap.exists() ? snap.data() : { mode: 'auto' }),
      () => setSt({ mode: 'auto' }),
    )
    return unsub
  }, [])
  return st
}

export async function saveTripStatus({ mode, destId }) {
  await setDoc(
    ref(),
    { mode: mode || 'auto', destId: destId || '', departAtMs: Date.now(), updatedAt: serverTimestamp() },
    { merge: true },
  )
}
