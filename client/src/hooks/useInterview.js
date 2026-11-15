import { useEffect, useState } from "react"
import { getInterview } from "@/services/interview.service"

/**
 * Hook to fetch a single interview, with optional polling.
 *
 * @param {string} id — Interview ID.
 * @param {{ pollInterval?: number, pollUntilStatus?: string }} [options]
 *   - `pollInterval` — ms between poll attempts (default: no polling).
 *   - `pollUntilStatus` — stop polling once interview reaches this status.
 * @returns {{ interview, isLoading, error }}
 */
export function useInterview(id, options = {}) {
  const { pollInterval = 0, pollUntilStatus = null } = options
  const [interview, setInterview] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    let intervalId = null

    async function fetchData() {
      try {
        const data = await getInterview(id)

        if (!active) return

        setInterview(data)
        setError(null)

        // Stop loading once we have data.
        if (data?.status === pollUntilStatus || !pollUntilStatus) {
          setIsLoading(false)
        }

        // Stop polling once the target status is reached.
        if (pollUntilStatus && data?.status === pollUntilStatus && intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
      } catch (err) {
        if (!active) return
        setError(err)
        setIsLoading(false)
      }
    }

    fetchData()

    if (pollInterval > 0) {
      intervalId = setInterval(fetchData, pollInterval)
    }

    return () => {
      active = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [id, pollInterval, pollUntilStatus])

  return { interview, isLoading, error }
}
