/* Firebase Cloud Messaging — 背景通知 Service Worker
 * 這裡的設定值是「網頁公開設定」（apiKey 等本來就會出現在前端），非機密。
 * FCM 會把這支 SW 註冊在自己的 scope（/firebase-cloud-messaging-push-scope），
 * 不會跟 PWA 既有的 Service Worker 衝突。
 */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyBX7U-9evPhCumQxN2YQxeVT1j--P-vDSw',
  authDomain: 'korea-trip-13c7a.firebaseapp.com',
  projectId: 'korea-trip-13c7a',
  storageBucket: 'korea-trip-13c7a.firebasestorage.app',
  messagingSenderId: '405187391855',
  appId: '1:405187391855:web:709c22101d724fa264389a',
})

const messaging = firebase.messaging()

// App 在背景 / 關閉時收到推播 → 顯示系統通知
messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || '釜山之旅'
  const body = payload?.notification?.body || ''
  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
  })
})
