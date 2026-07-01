// 隱藏後台分析頁 /analytics
// - 密碼保護（VITE_ANALYTICS_PASSWORD）
// - 打開即時撈 Firestore analytics_events
// - 可選「每 30 秒自動刷新」
// - 圖表用純 SVG / CSS 手刻，維持日系雜誌風，不引入額外套件

import { useState, useEffect, useCallback, useRef } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { computeMetrics, fmtDuration, fmtDateTime } from '../analytics/metrics'
import styles from './AnalyticsPage.module.css'

const PASSWORD = import.meta.env.VITE_ANALYTICS_PASSWORD
const UNLOCK_KEY = 'analytics_unlocked'

export default function AnalyticsPage() {
  const [unlocked, setUnlocked] = useState(() => {
    try { return sessionStorage.getItem(UNLOCK_KEY) === '1' } catch { return false }
  })

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />
  return <Dashboard />
}

/* ── 密碼閘門 ─────────────────────────── */
function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!PASSWORD) {
      setError('尚未設定密碼（VITE_ANALYTICS_PASSWORD）')
      return
    }
    if (value === PASSWORD) {
      try { sessionStorage.setItem(UNLOCK_KEY, '1') } catch { /* ignore */ }
      onUnlock()
    } else {
      setError('密碼錯誤')
    }
  }

  return (
    <div className={styles.gate}>
      <form className={styles.gateCard} onSubmit={submit}>
        <div className={styles.gateTitle}>使用數據後台</div>
        <div className={styles.gateSub}>請輸入密碼</div>
        <input
          className={styles.gateInput}
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError('') }}
          placeholder="密碼"
          autoFocus
        />
        {error && <div className={styles.gateError}>{error}</div>}
        <button className={styles.gateBtn} type="submit">進入</button>
      </form>
    </div>
  )
}

/* ── 主儀表板 ─────────────────────────── */
function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const timerRef = useRef(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const snap = await getDocs(collection(db, 'analytics_events'))
      const rows = snap.docs.map((d) => d.data())
      setMetrics(computeMetrics(rows))
      setUpdatedAt(Date.now())
    } catch (e) {
      setError(e?.message || '讀取失敗，請確認 Firestore 安全性規則允許讀取 analytics_events')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(load, 30000)
      return () => clearInterval(timerRef.current)
    }
  }, [autoRefresh, load])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.title}>使用數據分析</div>
          <div className={styles.subtitle}>釜山旅行 · 後台</div>
        </div>
        <div className={styles.controls}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>每 30 秒自動刷新</span>
          </label>
          <button className={styles.refreshBtn} onClick={load}>↻ 立即刷新</button>
        </div>
      </header>

      {updatedAt && (
        <div className={styles.updatedAt}>最後更新：{fmtDateTime(updatedAt)}</div>
      )}

      {error && <div className={styles.errorBox}>⚠️ {error}</div>}
      {loading && !metrics && <div className={styles.loading}>讀取中…</div>}

      {metrics && (
        <>
          {/* 總覽數字 */}
          <div className={styles.statGrid}>
            <StatCard label="不重複使用人數" value={metrics.uniqueUsers} unit="人" />
            <StatCard label="總開啟次數" value={metrics.totalSessions} unit="次" />
            <StatCard label="平均每人停留" value={fmtDuration(metrics.avgStayPerPerson)} />
          </div>

          {metrics.totalEvents === 0 && (
            <div className={styles.emptyHint}>
              目前還沒有任何事件資料。等團員開始使用 App 後，這裡就會出現數據。
            </div>
          )}

          {/* 每個人的使用情況 */}
          <Section title="每個人的使用情況">
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>成員</th>
                    <th className={styles.num}>開啟次數</th>
                    <th className={styles.num}>總停留</th>
                    <th className={styles.num}>最後使用</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.devices.map((d) => (
                    <tr key={d.deviceId}>
                      <td>{d.name || <span className={styles.muted}>未命名（{d.deviceId.slice(0, 6)}）</span>}</td>
                      <td className={styles.num}>{d.sessions}</td>
                      <td className={styles.num}>{fmtDuration(d.totalStay)}</td>
                      <td className={styles.num}>{fmtDateTime(d.lastSeen)}</td>
                    </tr>
                  ))}
                  {metrics.devices.length === 0 && (
                    <tr><td colSpan={4} className={styles.muted}>尚無資料</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 觸擊最高的功能 */}
          <Section title="觸擊最高的功能">
            <BarList items={metrics.topFeatures.map((f) => ({ label: f.name, value: f.count }))} suffix="次" />
          </Section>

          {/* 最常看的頁面 */}
          <Section title="最常看的頁面">
            <BarList
              items={metrics.topPages.map((p) => ({
                label: p.name,
                value: p.count,
                sub: `平均停留 ${fmtDuration(p.avgDwell)}`,
              }))}
              suffix="次"
            />
          </Section>

          {/* 每日活躍趨勢 */}
          <Section title="每日活躍趨勢（不重複人數）">
            <LineChart data={metrics.daily} />
          </Section>
        </>
      )}

      <footer className={styles.footer}>只記錄 deviceId 與操作行為，姓名為 App 既有資料。</footer>
    </div>
  )
}

/* ── 小元件 ──────────────────────────── */
function StatCard({ label, value, unit }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>
        {value}{unit && <span className={styles.statUnit}> {unit}</span>}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      {children}
    </section>
  )
}

function BarList({ items, suffix = '' }) {
  if (!items || items.length === 0) return <div className={styles.muted}>尚無資料</div>
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <div className={styles.barList}>
      {items.map((i) => (
        <div key={i.label} className={styles.barRow}>
          <div className={styles.barHead}>
            <span className={styles.barLabel}>{i.label}</span>
            <span className={styles.barValue}>{i.value}{suffix}</span>
          </div>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
          {i.sub && <div className={styles.barSub}>{i.sub}</div>}
        </div>
      ))}
    </div>
  )
}

function LineChart({ data }) {
  if (!data || data.length === 0) return <div className={styles.muted}>尚無資料</div>

  const W = 640, H = 220, PAD = 32
  const max = Math.max(...data.map((d) => d.count), 1)
  const n = data.length
  const x = (i) => (n === 1 ? W / 2 : PAD + (i * (W - PAD * 2)) / (n - 1))
  const y = (v) => H - PAD - (v / max) * (H - PAD * 2)

  const points = data.map((d, i) => `${x(i)},${y(d.count)}`).join(' ')
  const areaPath =
    `M ${x(0)},${H - PAD} ` +
    data.map((d, i) => `L ${x(i)},${y(d.count)}`).join(' ') +
    ` L ${x(n - 1)},${H - PAD} Z`

  return (
    <div className={styles.chartWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chartSvg} preserveAspectRatio="xMidYMid meet">
        {/* Y 軸基準線 */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
        <path d={areaPath} fill="rgba(192,57,43,0.08)" />
        <polyline points={points} fill="none" stroke="#c0392b" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={d.date}>
            <circle cx={x(i)} cy={y(d.count)} r="3.5" fill="#c0392b" />
            <text x={x(i)} y={y(d.count) - 10} textAnchor="middle" className={styles.chartValue}>{d.count}</text>
            <text x={x(i)} y={H - PAD + 18} textAnchor="middle" className={styles.chartLabel}>
              {d.date.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
