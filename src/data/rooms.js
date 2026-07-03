export const ROOMS = [
  { id: 'room-A', label: 'A 房', members: ['蘇郁淳', '陳億'], note: '2 人房' },
  { id: 'room-B', label: 'B 房', members: ['陳麒伊', '陳心唯', '陳可甯'], note: '3 人房' },
  { id: 'room-C', label: 'C 房', members: ['陳幸君', '陳王素清'], note: '2 人房' },
  { id: 'room-D', label: 'D 房', members: ['陳玫峰', '陳香君'], note: '2 人房' },
  { id: 'room-E', label: 'E 房', members: ['曾怡璁', '陳美如'], note: '2 人房' },
  { id: 'room-F', label: 'F 房', members: ['曾于真', '曾唯展'], note: '2 人房' },
  { id: 'room-G', label: 'G 房', members: ['黃建輔', '黃思瑜'], note: '2 人房' },
  { id: 'room-H', label: 'H 房', members: ['賴惟平', '賴惟中'], note: '2 人房' },
  { id: 'room-I', label: 'I 房', members: ['陳香如', '黃鈺婷', '謝昆霖', '謝采璇'], note: '2 人房規格 · 實際入住 4 人（2 大 2 小，2 位小朋友不算人頭）' },
  { id: 'room-J', label: 'J 房', members: ['王威淳'], note: '指定單人房' },
  { id: 'room-K', label: 'K 房', members: ['王子維'], note: '單人房' },
]

export const HOTELS = [
  {
    nights: 'Day 1–2（7/4、7/5）',
    name: '釜山拉瓦爾斯飯店',
    nameKr: 'La valse Hotel',
    address: '82 Bongnaenaru-ro, Yeongdo-gu, Busan',
    addressKr: '부산 영도구 봉래나루로 82',
    phone: '+82-51-790-1500',
  },
  {
    nights: 'Day 3–4（7/6、7/7）',
    name: '釜山延山凱悅嘉軒飯店',
    nameKr: 'Hyatt Place Busan Yeonsan',
    address: '1121 Jungang-daero, Yeonje-gu, Busan',
    addressKr: '부산 연제구 중앙대로 1121',
    phone: '+82-51-713-6000',
  },
]

export function findMyRoom(name) {
  if (!name) return null
  const trimmed = name.trim()
  return ROOMS.find((r) => r.members.some((m) => m === trimmed || m.includes(trimmed) || trimmed.includes(m))) ?? null
}
