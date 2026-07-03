// 取得指定日期的釜山天氣（Open-Meteo，免費、免金鑰）。給「明日行程提醒」用。
const LAT = 35.1796
const LNG = 129.0756

export function wmoLabel(code) {
  if (code === 0) return '晴天'
  if (code <= 2) return '多雲時晴'
  if (code <= 48) return '陰天'
  if (code <= 67) return '有雨'
  if (code <= 77) return '有雪'
  if (code <= 82) return '陣雨'
  if (code <= 86) return '陣雪'
  return '雷雨'
}

// 是否需要帶傘（毛毛雨/雨/陣雨/雷雨）
export function isRainy(code) {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95
}

// dateStr: 'YYYY-MM-DD'
export async function fetchWeatherForDate(dateStr) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul` +
    `&start_date=${dateStr}&end_date=${dateStr}`
  const r = await fetch(url)
  if (!r.ok) return null
  const d = await r.json()
  const code = d?.daily?.weathercode?.[0]
  if (code == null) return null
  return {
    code,
    max: Math.round(d.daily.temperature_2m_max[0]),
    min: Math.round(d.daily.temperature_2m_min[0]),
    label: wmoLabel(code),
    rain: isRainy(code),
  }
}
