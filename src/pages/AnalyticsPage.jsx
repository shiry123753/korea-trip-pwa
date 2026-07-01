// 隱藏後台分析頁 /analytics
// - 密碼保護（VITE_ANALYTICS_PASSWORD）
// - 打開即時撈 Firestore analytics_events
// - 可選「每 30 秒自動刷新」
// - 圖表用純 SVG / CSS 手刻，維持日系雜誌風，不引入額外套件

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { computeMetrics, fmtDuration, fmtDateTime } from '../analytics/metrics'
import { formatDeviceInfo } from '../analytics/deviceInfo'
import styles from './AnalyticsPage.module.css'

const PASSWORD = import.meta.env.VITE_ANALYTICS_PASSWORD
const UNLOCK_KEY = 'analytics_unlocked'

const RANGE_OPTS = [
  { key: 'today', label: '今天' },
  { key: '7d', label: '最近 7 天' },
  { key: 'all', label: '全部' },
]

function rowMs(r) {
  if (r.timestamp && typeof r.timestamp.toMillis === 'function') return r.timestamp.toMillis()
  if (typeof r.clientTime === 'number') return r.clientTime
  return 0
}

function filterByRange(rows, range) {
  if (range === 'all') return rows
  let cutoff = 0
  if (range === 'today') { const d = new Date(); d.setHours(0, 0, 0, 0); cutoff = d.getTime() }
  else if (range === '7d') { cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000 }
  return rows.filter((r) => rowMs(r) >= cutoff)
}

function csvEscape(v) {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function buildCsv(rows) {
  const header = ['deviceId', 'name', 'type', 'page', 'timestamp', 'deviceInfo']
  const sorted = [...rows].sort((a, b) => rowMs(a) - rowMs(b))
  const lines = [header.join(',')]
  for (const r of sorted) {
    const info = r.deviceInfo
      ? [r.deviceInfo.type, r.deviceInfo.os, r.deviceInfo.browser, r.deviceInfo.screenSize].filter(Boolean).join(' / ')
      : ''
    const ts = rowMs(r) ? new Date(rowMs(r)).toISOString() : ''
    lines.push([r.deviceId, r.userName, r.type, r.page, ts, info].map(csvEscape).join(','))
  }
  return lines.join('\n')
}

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
  const [rawEvents, setRawEvents] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [range, setRange] = useState('all')
  const timerRef = useRef(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const snap = await getDocs(collection(db, 'analytics_events'))
      setRawEvents(snap.docs.map((d) => d.data()))
      setUpdatedAt(Date.now())
    } catch (e) {
      setError(e?.message || '讀取失敗，請確認 Firestore 安全性規則允許讀取 analytics_events')
    } finally {
      setLoading(false)
    }
  }, [])

  // 篩選區間套用到：總覽 / 排名 / 趨勢 / 漏斗 / CSV
  const filteredEvents = useMemo(
    () => (rawEvents ? filterByRange(rawEvents, range) : []),
    [rawEvents, range],
  )
  const metrics = useMemo(
    () => (rawEvents ? computeMetrics(filteredEvents) : null),
    [rawEvents, filteredEvents],
  )
  // 成員表格 + 錯誤紀錄：永遠用全部時間
  const allMetrics = useMemo(
    () => (rawEvents ? computeMetrics(rawEvents) : null),
    [rawEvents],
  )

  function handleExportCsv() {
    const csv = '﻿' + buildCsv(filteredEvents) // BOM：讓 Excel 正確顯示中文
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics_${range}_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
          <button className={styles.refreshBtn} onClick={handleExportCsv} disabled={!rawEvents}>⬇ 匯出 CSV</button>
        </div>
      </header>

      <div className={styles.rangeBar}>
        {RANGE_OPTS.map((r) => (
          <button
            key={r.key}
            className={`${styles.rangeChip}${range === r.key ? ` ${styles.rangeOn}` : ''}`}
            onClick={() => setRange(r.key)}
          >
            {r.label}
          </button>
        ))}
        <span className={styles.rangeHint}>套用到總覽 / 排名 / 趨勢 / 漏斗（下方成員表格永遠顯示全部時間）</span>
      </div>

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

          {/* 每個人的使用情況（全部時間累計，不受篩選影響）*/}
          <Section title="每個人的使用情況（全部時間累計）">
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>成員 / 裝置</th>
                    <th className={styles.num}>開啟次數</th>
                    <th className={styles.num}>總停留</th>
                    <th className={styles.num}>最後使用</th>
                  </tr>
                </thead>
                <tbody>
                  {allMetrics.devices.map((d) => (
                    <tr key={d.deviceId}>
                      <td>
                        {d.name
                          ? <span className={styles.memberName}>{d.name}</span>
                          : <span className={styles.muted}>未命名（{d.deviceId.slice(0, 6)}）</span>}
                        <div className={styles.deviceMeta}>{formatDeviceInfo(d.deviceInfo) || '裝置資訊未知'}</div>
                      </td>
                      <td className={styles.num}>{d.sessions}</td>
                      <td className={styles.num}>{fmtDuration(d.totalStay)}</td>
                      <td className={styles.num}>{fmtDateTime(d.lastSeen)}</td>
                    </tr>
                  ))}
                  {allMetrics.devices.length === 0 && (
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

          {/* 使用路徑漏斗 */}
          <Section title="使用路徑漏斗（曾造訪過該頁面的人數）">
            <FunnelChart steps={metrics.funnel} />
          </Section>

          {/* 每日活躍趨勢 */}
          <Section title="每日活躍趨勢（不重複人數）">
            <LineChart data={metrics.daily} />
          </Section>

          {/* 錯誤紀錄（全部時間）*/}
          <Section title="錯誤紀錄">
            <ErrorList items={allMetrics.errors} />
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

function FunnelChart({ steps }) {
  if (!steps || steps.length === 0) return <div className={styles.muted}>尚無資料</div>
  const max = Math.max(...steps.map((s) => s.count), 1)
  return (
    <div className={styles.funnel}>
      {steps.map((s, i) => (
        <div key={s.stage} className={styles.funnelRow}>
          <div className={styles.funnelHead}>
            <span className={styles.funnelStage}>{i + 1}. {s.stage}</span>
            <span className={styles.funnelCount}>
              {s.count} 人
              {i > 0 && <span className={styles.funnelRet}> · 留存 {Math.round(s.retention)}%</span>}
            </span>
          </div>
          <div className={styles.funnelTrack}>
            <div className={styles.funnelFill} style={{ width: `${(s.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorList({ items }) {
  if (!items || items.length === 0) return <div className={styles.okHint}>目前沒有錯誤紀錄 👍</div>
  return (
    <div className={styles.errList}>
      {items.map((e, i) => (
        <div key={i} className={styles.errRow}>
          <div className={styles.errTop}>
            <span className={styles.errPage}>{e.page}</span>
            <span className={styles.errTime}>{fmtDateTime(e.ms)}</span>
          </div>
          <div className={styles.errMsg}>{e.message}</div>
          <div className={styles.errWho}>{e.name || '未命名'}（{e.deviceId.slice(0, 6)}）</div>
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
