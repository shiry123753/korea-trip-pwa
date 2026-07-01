// 使用數據分析 — 事件記錄核心
// 全部用既有的 Firebase Firestore 完成，不引入第三方分析服務。
// track() 一律 fire-and-forget，任何失敗都不能影響 App 使用體驗。

import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { getSession, getDisplayName } from '../hooks/useSession'
import { getDeviceInfo } from './deviceInfo'

const DEVICE_KEY = 'korea_trip_device_id' // 每支手機唯一 ID，存 localStorage，重複開啟同一 ID
const COLLECTION = 'analytics_events'

function uuid() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch { /* ignore */ }
  // 舊瀏覽器 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ── deviceId：持久，同一支手機永遠同一個 ──
export function getDeviceId() {
  let id = null
  try { id = localStorage.getItem(DEVICE_KEY) } catch { /* ignore */ }
  if (!id) {
    id = uuid()
    try { localStorage.setItem(DEVICE_KEY, id) } catch { /* ignore */ }
  }
  return id
}

// ── sessionId：這次開啟 App 產生一次，同一次開啟共用 ──
const SESSION_ID = uuid()
export function getSessionId() { return SESSION_ID }

// ── 寫入一筆事件 ──
export async function track(type, { page = '', ...extra } = {}) {
  try {
    const session = getSession()
    await addDoc(collection(db, COLLECTION), {
      deviceId: getDeviceId(),
      sessionId: SESSION_ID,
      type,                        // session_start / page_view / feature_click / heartbeat / session_end
      page,                        // 頁面名稱 或 功能名稱
      userName: getDisplayName(session), // 顯示名稱（暱稱優先，否則真實姓名）
      timestamp: serverTimestamp(), // 伺服器時間（後台計算用）
      clientTime: Date.now(),       // client 時間 fallback
      ...extra,
    })
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[analytics] track failed:', e)
  }
}

// session_start 每次開啟只記一筆（避免 StrictMode / 重複掛載重複送）
// deviceInfo 只在 session_start 記一次，避免每個事件都存造成資料量暴增。
let sessionStarted = false
export function trackSessionStart() {
  if (sessionStarted) return
  sessionStarted = true
  const s = getSession()
  return track('session_start', {
    deviceInfo: getDeviceInfo(),
    realName: s?.realName || s?.name || '', // 背景資料：日後住宿房間對應用
    nickname: s?.nickname || '',
  })
}

// ── 目前所在頁面：給錯誤追蹤用（錯誤發生時不一定拿得到 router 狀態） ──
let currentPage = 'home'
export function setCurrentPage(page) { currentPage = page || 'home' }
export function getCurrentPage() { return currentPage }

// ── 記錄一筆錯誤事件 ──
export function trackError(message, page) {
  const msg = String(message || 'Unknown error').slice(0, 300) // 只存簡短訊息，不存完整 stack
  return track('error', { page: page || currentPage, message: msg })
}

// ── 全域錯誤攔截（React 以外的未捕捉錯誤）──
let errorTrackingInit = false
export function initErrorTracking() {
  if (errorTrackingInit || typeof window === 'undefined') return
  errorTrackingInit = true
  window.addEventListener('error', (e) => {
    trackError(e?.message || e?.error?.message || 'window.onerror')
  })
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e?.reason
    trackError(reason?.message || String(reason) || 'unhandledrejection')
  })
}
