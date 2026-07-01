// 自動埋點：掛在主 App 裡（後台頁 /analytics 不會掛，避免污染數據）
// - session_start：每次開啟記一次
// - page_view：每次切換主要畫面記一次
// - heartbeat：每 60 秒（畫面可見時）記一次，用來推算停留時間
// - session_end：離開 / 關閉頁面時盡力記一次

import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { track, trackSessionStart } from './analytics'

const PAGE_NAMES = {
  '/': 'home',
  '/itinerary': 'itinerary',
  '/rooms': 'rooms',
}

function resolvePage(pathname, hasName) {
  if (!hasName) return 'onboarding' // 還沒設定姓名 = onboarding 畫面
  if (PAGE_NAMES[pathname]) return PAGE_NAMES[pathname]
  return pathname.replace(/^\//, '') || 'home'
}

export default function RouteTracker() {
  const location = useLocation()
  const session = useSession()
  const hasName = !!session?.name
  const lastPage = useRef(null)

  // session_start（只一次）
  useEffect(() => { trackSessionStart() }, [])

  // page_view（畫面改變時）
  useEffect(() => {
    const page = resolvePage(location.pathname, hasName)
    if (page !== lastPage.current) {
      lastPage.current = page
      track('page_view', { page })
    }
  }, [location.pathname, hasName])

  // heartbeat + session_end
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        track('heartbeat', { page: lastPage.current || 'home' })
      }
    }, 60000)
    const onHide = () => { track('session_end', { page: lastPage.current || 'home' }) }
    window.addEventListener('pagehide', onHide)
    return () => {
      clearInterval(id)
      window.removeEventListener('pagehide', onHide)
    }
  }, [])

  return null
}
