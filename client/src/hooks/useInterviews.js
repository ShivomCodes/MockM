import { useCallback, useEffect, useMemo, useState } from "react"
import {
  listInterviews as fetchInterviews,
  deleteInterview as deleteInterviewService,
} from "@/services/interview.service"
import { computeInterviewStats } from "@/utils/format"

/**
 * Hook to fetch and cache the user's interview list.
 *
 * Returns the raw list, computed stats, loading/error state, and
 * a `refetch` function for manual refreshes.
 *
 * Used by DashboardPage and ProfilePage — eliminates the duplicated
 * fetching and stats computation logic.
 */
export function useInterviews() {
  const [interviews, setInterviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    let active = true

    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchInterviews()

      if (active) {
        setInterviews(data)
      }
    } catch (err) {
      if (active) {
        setError(err)
      }
    } finally {
      if (active) {
        setIsLoading(false)
      }
    }

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let cleanup
    load().then((c) => {
      cleanup = c
    })
    return () => cleanup?.()
  }, [load])

  const deleteInterviewById = useCallback(async (id) => {
    await deleteInterviewService(id)
    setInterviews((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const stats = useMemo(() => computeInterviewStats(interviews), [interviews])

  return { interviews, stats, isLoading, error, refetch: load, deleteInterview: deleteInterviewById }
}
