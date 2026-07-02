// 推播（FCM）客戶端邏輯 —— 第一階段：授權、取得 token、存到 Firestore、前景顯示。
// token 只允許寫入、不開放讀取（見 Firestore 規則），避免個資外流。

import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { app, db } from '../firebase/config'
import { getDeviceId } from '../analytics/analytics'
import { getSession, getDisplayName } from '../hooks/useSession'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

// 這個瀏覽器 / 裝置是否支援 Web 推播
export async function isPushSupported() {
  try {
    if (typeof Notification === 'undefined' || !('serviceWorker' in navigator)) return false
    return await isSupported()
  } catch {
    return false
  }
}

// 目前通知授權狀態：'default' | 'granted' | 'denied' | 'unsupported'
export function getNotificationPermission() {
  return typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
}

// iPhone 判斷：iOS 且尚未「加到主畫面」時，Safari 無法授權通知
export function isIosNeedingHomeScreen() {
  const ua = navigator.userAgent || ''
  const isIos = /iPhone|iPad|iPod/.test(ua)
  const standalone = window.navigator.standalone === true
    || window.matchMedia?.('(display-mode: standalone)').matches
  return isIos && !standalone
}

// 點「開啟通知」時呼叫：要求授權 → 取得 token → 存 Firestore
export async function enablePush() {
  if (!VAPID_KEY) {
    throw new Error('尚未設定推播金鑰（VITE_FIREBASE_VAPID_KEY）')
  }
  if (isIosNeedingHomeScreen()) {
    throw new Error('iPhone 請先用 Safari「分享 → 加入主畫面」，再從主畫面圖示開啟並開通知')
  }
  if (!(await isPushSupported())) {
    throw new Error('這個裝置或瀏覽器不支援推播通知')
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('尚未允許通知（請在瀏覽器選「允許」）')
  }

  const messaging = getMessaging(app)
  let token
  try {
    token = await getToken(messaging, { vapidKey: VAPID_KEY })
  } catch (e) {
    throw new Error(`取得推播 token 失敗：${e?.message || e}`)
  }
  if (!token) throw new Error('取得推播 token 失敗（token 是空的），請確認網路與 VAPID 金鑰正確')

  try {
    const session = getSession()
    await setDoc(
      doc(db, 'push_tokens', getDeviceId()),
      {
        token,
        deviceId: getDeviceId(),
        name: getDisplayName(session),
        platform: navigator.userAgent,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  } catch (e) {
    const code = e?.code || ''
    if (code.includes('permission-denied') || /permission|insufficient/i.test(e?.message || '')) {
      throw new Error('Firestore 拒絕寫入 push_tokens —— 請到 Firebase Console 加上 push_tokens 的寫入規則並按「發布」，再試一次')
    }
    throw new Error(`寫入 Firestore 失敗：${e?.message || e}`)
  }
  try { localStorage.setItem('push_token', token) } catch { /* ignore */ }
  return token
}

// 已註冊到 Firestore 的 token（供 UI 顯示、複製去 Console 測試）
export function getStoredToken() {
  try { return localStorage.getItem('push_token') || '' } catch { return '' }
}

// App 在前景（開著）時也把收到的推播顯示出來
let foregroundInit = false
export async function initForegroundPush() {
  if (foregroundInit) return
  if (!(await isPushSupported())) return
  if (getNotificationPermission() !== 'granted') return
  foregroundInit = true
  const messaging = getMessaging(app)
  onMessage(messaging, (payload) => {
    const title = payload?.notification?.title || '釜山之旅'
    const body = payload?.notification?.body || ''
    try {
      new Notification(title, { body, icon: '/icons/icon-192.png' })
    } catch { /* 忽略 */ }
  })
}
