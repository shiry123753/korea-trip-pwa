import { Component } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useSession } from './hooks/useSession'
import SetupScreen from './pages/SetupScreen'
import HomePage from './pages/HomePage'
import ItineraryPage from './pages/ItineraryPage'
import RoomsPage from './pages/RoomsPage'
import BottomNav from './components/Layout/BottomNav'
import EmergencyFab from './components/EmergencyFab'
import './styles/global.css'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(e) { return { error: e } }
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

function Inner() {
  const session = useSession()
  if (!session?.name) return <SetupScreen />

  return (
    <>
      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/itinerary" element={<ItineraryPage />} />
        <Route path="/rooms"     element={<RoomsPage />} />
      </Routes>
      <BottomNav />
      <EmergencyFab />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="appWrap">
          <Inner />
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
