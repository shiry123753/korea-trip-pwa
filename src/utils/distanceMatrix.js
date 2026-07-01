import { loadGoogleMaps } from './googleMapsLoader'

export async function getDrivingEta(originAddress, destinationAddress) {
  const maps = await loadGoogleMaps()
  const service = new maps.DistanceMatrixService()

  return new Promise((resolve, reject) => {
    service.getDistanceMatrix(
      {
        origins: [originAddress],
        destinations: [destinationAddress],
        travelMode: maps.TravelMode.DRIVING,
        drivingOptions: { departureTime: new Date(), trafficModel: 'bestguess' },
        unitSystem: maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status !== 'OK') { reject(new Error(`Distance Matrix 失敗: ${status}`)); return }
        const el = response.rows[0]?.elements[0]
        if (!el || el.status !== 'OK') { reject(new Error(`查無路線: ${el?.status ?? 'UNKNOWN'}`)); return }
        const duration = el.duration_in_traffic ?? el.duration
        resolve({
          etaMinutes: Math.max(1, Math.round(duration.value / 60)),
          etaText: duration.text,
          distanceText: el.distance.text,
          rawDistanceM: el.distance.value,   // 公尺，整數
        })
      },
    )
  })
}
