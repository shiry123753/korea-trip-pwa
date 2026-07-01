import { Component } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useSession, getDisplayName } from './hooks/useSession'
import SetupScreen from './pages/SetupScreen'
import HomePage from './pages/HomePage'
import ItineraryPage from './pages/ItineraryPage'
import RoomsPage from './pages/RoomsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import BottomNav from './components/Layout/BottomNav'
import EmergencyFab from './components/EmergencyFab'
import RouteTracker from './analytics/RouteTracker'
import { trackError } from './analytics/analytics'
import './styles/global.css'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(e) { return { error: e } }
  componentDidCatch(error) {
    try { trackError(error?.message || String(error)) } catch { /* ignore */ }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', color: '#1a1410' }}>
          <h2 style={{ color: '#c0392b' }}>App Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, marginTop: 12 }}>
            {this.state.error.message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

function MainApp() {
  const session = useSession()

  return (
    <div className="appWrap">
      {/* 埋點：session_start / page_view / heartbeat（後台頁不會掛到） */}
      <RouteTracker />
      {!getDisplayName(session) ? (
        <SetupScreen />
      ) : (
        <>
          <Routes>
            <Route path="/"          element={<HomePage />} />
            <Route path="/itinerary" element={<ItineraryPage />} />
            <Route path="/rooms"     element={<RoomsPage />} />
          </Routes>
          <BottomNav />
          <EmergencyFab />
        </>
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* 隱藏後台：獨立於 onboarding 與手機版型之外 */}
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
