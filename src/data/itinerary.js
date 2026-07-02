// 靜態行程資料：釜山 5 日  2026/07/04–07/08
// 地址欄位使用韓文地址，供 Google Maps Distance Matrix API 使用

export const TRIP_START = '2026-07-04'
export const TRIP_END   = '2026-07-08'

export const DAYS = [
  {
    id: 'day1',
    date: '2026-07-04',
    label: 'Day 1',
    subtitle: '桃園 → 釜山',
    hotel: { name: '釜山拉瓦爾斯飯店', nameKr: 'La valse Hotel', address: '부산 영도구 봉래나루로 82', phone: '+82-51-790-1500' },
    spots: [
      {
        id: 'tpe-depart',
        name: '桃園機場出發',
        emoji: '✈️',
        address: '台灣桃園國際機場第一航廈',
        timeSlot: '12:00',
        durationMin: 0,
        // 🚌 巴士進度時間表（選填）：這段移動的「出發時間」與「行駛分鐘」。
        //    不填的話，系統會自動用「本站 timeSlot + durationMin」當出發、下一站 timeSlot 當抵達。
        departAt: '14:45',
        travelMin: 190,
        note: 'JX 902｜14:45 起飛，17:55 抵達金海國際機場',
        desc: '星宇航空 3 號櫃台集合，請準時到達。',
        isTransit: true,
      },
      {
        id: 'pus-arrive',
        name: '釜山金海國際機場',
        emoji: '🛬',
        address: '부산 강서구 공항진입로 108',
        timeSlot: '17:55',
        durationMin: 60,
        departAt: '18:55',
        travelMin: 65,
        note: '入境、領行李、接駁巴士前往飯店',
        desc: '入境後領取行李，集合後統一搭接駁巴士前往飯店。',
        isTransit: true,
      },
      {
        id: 'hotel-lavalse-d1',
        name: '釜山拉瓦爾斯飯店',
        emoji: '🏨',
        address: '부산 영도구 봉래나루로 82',
        timeSlot: '20:00',
        durationMin: 0,
        note: '自由逛街購物',
        desc: 'La valse Hotel。入住後自由活動，附近有南浦洞可逛街。',
        isHotel: true,
      },
    ],
  },
  {
    id: 'day2',
    date: '2026-07-05',
    label: 'Day 2',
    subtitle: '龍宮 × LUGE × 南浦洞',
    hotel: { name: '釜山拉瓦爾斯飯店', nameKr: 'La valse Hotel', address: '부산 영도구 봉래나루로 82', phone: '+82-51-790-1500' },
    spots: [
      {
        id: 'haedong-yonggung',
        name: '海東龍宮寺',
        emoji: '🏯',
        address: '부산 기장군 기장읍 용궁길 86',
        timeSlot: '09:30',
        durationMin: 60,
        note: '含導覽約 60 分鐘',
        desc: '由高麗恭愍王的王師懶翁大師創建於 1376 年，是韓國三大觀音聖地之一。懸崖邊的古寺與湛藍海景形成絕美畫面，傳說在此誠心祈禱，願望將在夢中實現。',
      },
      {
        id: 'busan-luge',
        name: '釜山 LUGE 渠道滑車',
        emoji: '🎢',
        address: '부산 기장군 기장읍 시랑리 산 14-6',
        timeSlot: '11:00',
        durationMin: 90,
        note: '含滑車＋景觀纜車各 1 次（共 2 次體驗券）',
        desc: '沿著山坡蜿蜒而下的重力滑車，搭配360度海景纜車，速度與景色兼具。每人含 2 次體驗券，可重複挑戰不同路線。',
      },
      {
        id: 'nampo-market',
        name: '南浦洞國際市場',
        emoji: '🛍️',
        address: '부산 중구 신창동4가 20-1',
        timeSlot: '14:00',
        durationMin: 120,
        note: '自由逛街購物，午晚餐自理',
        desc: '韓國戰爭後難民聚集之地，如今是釜山最熱鬧的購物商圈。有 BIFF 廣場明星手印、KAKAO FRIENDS 旗艦店、糖餅老店，以及各式道地小吃。',
      },
      {
        id: 'hotel-lavalse-d2',
        name: '回飯店（拉瓦爾斯）',
        emoji: '🏨',
        address: '부산 영도구 봉래나루로 82',
        timeSlot: '18:00',
        durationMin: 0,
        isHotel: true,
      },
    ],
  },
  {
    id: 'day3',
    date: '2026-07-06',
    label: 'Day 3',
    subtitle: '青沙浦 × 天空膠囊 × Bay 101',
    hotel: { name: '釜山延山凱悅嘉軒飯店', nameKr: 'Hyatt Place Busan Yeonsan', address: '부산 연제구 중앙대로 1121', phone: '+82-51-713-6000' },
    spots: [
      {
        id: 'cheongsapo-observatory',
        name: '青沙浦踏石展望台',
        emoji: '🌊',
        address: '부산 해운대구 중동 청사포로 52',
        timeSlot: '09:30',
        durationMin: 45,
        note: '透明玻璃地板，懸臂式海上步道',
        desc: '向大海延伸的 U 字型觀景台，全長 191 公尺，末端設置半月形透明玻璃地板，腳下是洶湧波濤，視覺震撼十足。可同時俯瞰青沙浦漁村風情。',
      },
      {
        id: 'cheongsapo-lighthouse',
        name: '青沙浦紅白雙燈塔',
        emoji: '🗼',
        address: '부산 해운대구 청사포로 52',
        timeSlot: '10:30',
        durationMin: 30,
        note: '經典拍照地標，周邊海景咖啡廳林立',
        desc: '一紅一白兩座燈塔並肩矗立於小漁港，成為青沙浦最標誌性的地景。紅色燈塔映著翡翠色大海，對比鮮明，每個角度都能拍出美照。',
      },
      {
        id: 'sky-capsule',
        name: '海岸天空膠囊列車',
        emoji: '🚋',
        address: '부산 해운대구 달맞이길62번길 11',
        timeSlot: '11:30',
        durationMin: 60,
        note: 'IG 熱門打卡，沿海懸空小火車',
        desc: '懸掛在海岸峭壁上的透明膠囊小火車，以 Sky Capsule 之名席捲韓國 IG。從青沙浦沿海行駛，可360度欣賞東海海景，是此行最上鏡的體驗之一。',
      },
      {
        id: 'the-bay-101',
        name: 'The Bay 101 百萬夜景',
        emoji: '🌃',
        address: '부산 해운대구 동백로 52',
        timeSlot: '19:30',
        durationMin: 60,
        note: '海雲台夜景必訪',
        desc: '坐落於東白島的高端濱海複合設施，夜晚燈光倒映在海面上，是海雲台最浪漫的夜景打卡點。周邊餐廳與酒吧環繞，適合飯後散步。',
      },
      {
        id: 'hotel-hyatt-d3',
        name: '回飯店（凱悅嘉軒）',
        emoji: '🏨',
        address: '부산 연제구 중앙대로 1121',
        timeSlot: '21:00',
        durationMin: 0,
        isHotel: true,
      },
    ],
  },
  {
    id: 'day4',
    date: '2026-07-07',
    label: 'Day 4',
    subtitle: '甘川 × 松島 × 塗鴉秀 × 樂天',
    hotel: { name: '釜山延山凱悅嘉軒飯店', nameKr: 'Hyatt Place Busan Yeonsan', address: '부산 연제구 중앙대로 1121', phone: '+82-51-713-6000' },
    spots: [
      {
        id: 'gamcheon',
        name: '甘川洞文化村',
        emoji: '🎨',
        address: '부산 사하구 감내2로 203',
        timeSlot: '09:30',
        durationMin: 90,
        note: '彩色梯田聚落，一年 185 萬人次造訪',
        desc: '韓戰時難民在山坡上建起的避難聚落，如今搖身變為色彩繽紛的藝術村。階梯式彩色房屋錯落有致，迷宮般的小巷中藏著壁畫、裝置藝術與咖啡廳，有「釜山馬丘比丘」之稱。',
      },
      {
        id: 'songdo-bridge',
        name: '松島龍宮雲橋',
        emoji: '🌁',
        address: '부산 서구 송도해변로 171',
        timeSlot: '11:30',
        durationMin: 60,
        note: '透明玻璃步道，海面上的360度展望',
        desc: '2015 年開放的松島海上步道，從燈塔向東延伸超過 100 公尺，路面鋪設木板與玻璃，腳下是洶湧海浪。是釜山西區最具代表性的濱海步道，四周海景一覽無遺。',
      },
      {
        id: 'gaya-theme',
        name: '金海加耶主題公園',
        emoji: '🍬',
        address: '경남 김해시 가야테마파크길 175',
        timeSlot: '14:00',
        durationMin: 90,
        note: '每人贈一杯椪糖拿鐵，含椪糖 DIY 體驗',
        desc: '以古代加耶王國文化為主題的樂園，今日特別安排椪糖（달고나）體驗，親手製作韓劇《魷魚遊戲》同款造型椪糖，每人另贈一杯椪糖拿鐵。',
      },
      {
        id: 'the-painters',
        name: 'The Painters 塗鴉秀',
        emoji: '🎭',
        address: '부산 해운대구 중동 더베이101 내',
        timeSlot: '17:00',
        durationMin: 90,
        note: '互動式藝術表演秀',
        desc: '結合舞蹈、音樂與現場作畫的沉浸式表演，藝術家在全場音樂中即興塗鴉創作，充滿活力與驚喜，是釜山近年最受矚目的表演節目之一。',
      },
      {
        id: 'lotte-outlet',
        name: '樂天 Outlet Mall',
        emoji: '🛒',
        address: '부산 사하구 낙동북로 550',
        timeSlot: '19:00',
        durationMin: 90,
        note: '韓國品牌、免稅購物',
        desc: '釜山最大型購物中心之一，匯聚韓國本土品牌、國際精品與免稅店。是行程最後一站購物衝刺的好去處，記得留意結帳時間。',
      },
      {
        id: 'hotel-hyatt-d4',
        name: '回飯店（凱悅嘉軒）',
        emoji: '🏨',
        address: '부산 연제구 중앙대로 1121',
        timeSlot: '21:30',
        durationMin: 0,
        isHotel: true,
      },
    ],
  },
  {
    id: 'day5',
    date: '2026-07-08',
    label: 'Day 5',
    subtitle: '釜山 → 桃園',
    hotel: null,
    spots: [
      {
        id: 'hotel-checkout',
        name: '飯店退房',
        emoji: '🧳',
        address: '부산 연제구 중앙대로 1121',
        timeSlot: '08:00',
        durationMin: 0,
        note: '早餐後退房，整理行李',
        desc: 'Hyatt Place 早餐後辦理退房，集合後搭接駁巴士前往金海機場。',
        isTransit: true,
      },
      {
        id: 'pus-depart',
        name: '釜山金海國際機場',
        emoji: '✈️',
        address: '부산 강서구 공항진입로 108',
        timeSlot: '10:00',
        durationMin: 0,
        note: 'JX 901｜12:30 起飛，13:45 抵達桃園',
        desc: '提早抵達機場完成報到手續，預計下午返抵台灣。旅程圓滿結束，歡迎下次再出發！',
        isTransit: true,
      },
    ],
  },
]

// ── helpers ──────────────────────────────────────────────────

// overrideDate（選填，格式 'YYYY-MM-DD'）：用於「日期預覽」模式，假裝今天是某一天。
// 不傳時 = 依真實今天日期，行為與原本完全相同。
export function getTodayDayData(overrideDate) {
  const today = overrideDate || localDateString()
  return DAYS.find((d) => d.date === today) ?? null
}

export function getCurrentAndNextSpot(day) {
  if (!day) return { current: null, next: null, currentIndex: -1 }
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()

  const spots = day.spots
  let currentIndex = 0

  for (let i = 0; i < spots.length; i++) {
    const [h, m] = spots[i].timeSlot.split(':').map(Number)
    const spotMin = h * 60 + m
    if (spotMin <= nowMin) currentIndex = i
    else break
  }

  return {
    current: spots[currentIndex] ?? null,
    next: spots[currentIndex + 1] ?? null,
    currentIndex,
  }
}

function localDateString() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
