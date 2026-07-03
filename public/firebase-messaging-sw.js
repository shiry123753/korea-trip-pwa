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

// 我們送的是含 notification 欄位的訊息，FCM 在背景會「自動顯示一則」通知。
// 若在這裡再呼叫 showNotification，就會變成兩則（重複）。
// 因此這裡不再手動顯示，交給 FCM 自動顯示，確保只有一則。
messaging.onBackgroundMessage(() => {
  // no-op：避免與 FCM 自動顯示重複
})
