import { useState, useEffect } from 'react'

const KEY = 'korea_trip_session'
const listeners = new Set()

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null }
}
let session = load()

export function getSession() { return session }

// 全站統一的「顯示名稱」邏輯：有暱稱優先用暱稱，否則用真實姓名。
// （name 為舊資料相容用途）真實姓名本身不對外顯示，只作房間對應等背景用途。
export function getDisplayName(user) {
  if (!user) return ''
  return user.nickname || user.realName || user.name || ''
}

export function setSession(s) {
  session = s
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ }
  listeners.forEach((l) => l(s))
}

export function clearSession() {
  session = null
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  listeners.forEach((l) => l(null))
}

export function useSession() {
  const [s, setS] = useState(getSession)
  useEffect(() => {
    listeners.add(setS)
    return () => listeners.delete(setS)
  }, [])
  return s
}
