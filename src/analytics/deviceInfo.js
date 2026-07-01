// 解析裝置資訊 — 只用瀏覽器能取得的資訊。
// 注意：網頁端無法取得精確手機型號（iOS Safari 一律回傳 "iPhone"，不分代數），
// 這裡只判斷「裝置類型 / OS / 瀏覽器 / 螢幕解析度」。

export function getDeviceInfo() {
  let ua = ''
  try { ua = navigator.userAgent || '' } catch { /* ignore */ }

  const isIPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)
  const isIPhone = /iPhone|iPod/.test(ua)
  const isAndroid = /Android/.test(ua)
  const isAndroidMobile = isAndroid && /Mobile/.test(ua)

  // OS
  let os = 'Other'
  if (isIPhone || isIPad) os = 'iOS'
  else if (isAndroid) os = 'Android'
  else if (/Windows/.test(ua)) os = 'Windows'
  else if (/Mac OS X|Macintosh/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  // 裝置類型
  let type = '桌機'
  if (isIPad) type = 'iPad'
  else if (isIPhone) type = 'iPhone'
  else if (isAndroidMobile) type = 'Android 手機'
  else if (isAndroid) type = 'Android 平板'
  else if (/Mobile/.test(ua)) type = '手機'

  // 瀏覽器（先判斷 App 內建 webview，再判斷一般瀏覽器）
  let browser = 'Other'
  if (/Line/i.test(ua)) browser = 'LINE'
  else if (/FBAN|FBAV/.test(ua)) browser = 'Facebook'
  else if (/Instagram/.test(ua)) browser = 'Instagram'
  else if (/Edg/.test(ua)) browser = 'Edge'
  else if (/CriOS/.test(ua)) browser = 'Chrome'
  else if (/FxiOS|Firefox/.test(ua)) browser = 'Firefox'
  else if (/Chrome/.test(ua)) browser = 'Chrome'
  else if (/Safari/.test(ua)) browser = 'Safari'

  // 螢幕解析度（CSS 像素，可粗略區分大小螢幕，非型號）
  let screenSize = ''
  try {
    if (typeof screen !== 'undefined') screenSize = `${screen.width}x${screen.height}`
  } catch { /* ignore */ }

  return { type, os, browser, screenSize }
}

// 顯示用：iPhone · Safari · 390x844
export function formatDeviceInfo(info) {
  if (!info) return ''
  return [info.type, info.browser, info.screenSize].filter(Boolean).join(' · ')
}
