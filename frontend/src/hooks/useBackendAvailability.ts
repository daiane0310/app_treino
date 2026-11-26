import { useCallback, useEffect, useRef, useState } from 'react'
import { isBackendAvailable } from '../services/backendAvailability'

const MESSAGE_DELAY_MS = 1_500
const RETRY_INTERVAL_MS = 5_000
const REQUEST_TIMEOUT_MS = 8_000
const TOTAL_TIMEOUT_MS = 90_000

type Availability = 'checking' | 'starting' | 'ready' | 'unavailable' | 'connection-lost'

export function useBackendAvailability() {
  const [availability, setAvailability] = useState<Availability>('checking')
  const currentAvailability = useRef<Availability>('checking')
  const updateAvailability = useCallback((next: Availability) => {
    currentAvailability.current = next
    setAvailability(next)
  }, [])
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    let stopped = false
    let controller: AbortController | undefined
    let nextCheck: number
    let requestTimeout: number | undefined

    function stop() {
      stopped = true
      window.clearTimeout(nextCheck)
      window.clearTimeout(requestTimeout)
      window.clearTimeout(messageTimeout)
      window.clearTimeout(totalTimeout)
      controller?.abort()
    }

    async function check() {
      controller = new AbortController()
      const request = controller
      requestTimeout = window.setTimeout(() => request.abort(), REQUEST_TIMEOUT_MS)
      const available = await isBackendAvailable(request.signal)
      window.clearTimeout(requestTimeout)

      if (stopped) return
      controller = undefined
      if (available && !request.signal.aborted) {
        stop()
        updateAvailability('ready')
      } else {
        nextCheck = window.setTimeout(check, RETRY_INTERVAL_MS)
      }
    }

    const messageTimeout = window.setTimeout(
      () => updateAvailability('starting'), MESSAGE_DELAY_MS,
    )
    const totalTimeout = window.setTimeout(() => {
      stop()
      updateAvailability('unavailable')
    }, TOTAL_TIMEOUT_MS)

    // A discarded Strict Mode effect can cancel the check before it starts.
    nextCheck = window.setTimeout(check, 0)
    return stop
  }, [cycle, updateAvailability])

  function retry() {
    if (currentAvailability.current !== 'unavailable'
        && currentAvailability.current !== 'connection-lost') return
    updateAvailability('checking')
    setCycle(current => current + 1)
  }

  function markConnectionLost() {
    updateAvailability('connection-lost')
  }

  function canSubmit() {
    return currentAvailability.current === 'ready'
  }

  return { availability, retry, markConnectionLost, canSubmit }
}
