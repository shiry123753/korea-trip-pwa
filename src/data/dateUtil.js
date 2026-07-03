// 共用日期小工具（本地時區；到韓國手機自動用韓國日期）
export function ymdLocal(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function addDaysYmd(s, n) {
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + n)
  return ymdLocal(dt)
}

export function mdLabel(s) {
  if (!s || s.length < 10) return ''
  return `${Number(s.slice(5, 7))}/${Number(s.slice(8, 10))}`
}
