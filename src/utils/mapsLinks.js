export function buildNavLink(address) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`
}

export function buildFoodSearchLink({ lat, lng }) {
  return `https://www.google.com/maps/search/%EB%A7%9B%EC%A7%91/@${lat},${lng},16z`
}
