import { useEffect, useState } from 'react'

let openCount = 0
const listeners = new Set()
const emit = () => listeners.forEach((l) => l(openCount > 0))

export function useModalChrome(open) {
  useEffect(() => {
    if (!open) return
    openCount += 1
    emit()
    return () => {
      openCount = Math.max(0, openCount - 1)
      emit()
    }
  }, [open])
}

export function useNavHidden() {
  const [hidden, setHidden] = useState(openCount > 0)
  useEffect(() => {
    listeners.add(setHidden)
    return () => listeners.delete(setHidden)
  }, [])
  return hidden
}
