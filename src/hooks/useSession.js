import { useState, useEffect } from 'react'

const KEY = 'korea_trip_session'
const listeners = new Set()

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null }
}
let session = load()

export function getSession() { return session }

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
