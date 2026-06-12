import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useInterviews } from "@/hooks/useInterviews"
import { getDisplayName } from "@/utils/user"
import { Button } from "@/components/ui/button"
import AppLayout from "@/components/AppLayout"
import StatsGrid from "@/components/dashboard/StatsGrid"
import InterviewList from "@/components/dashboard/InterviewList"

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { interviews, stats, isLoading, error, deleteInterview } = useInterviews()

  useEffect(() => {
    document.title = "MockMate AI — Dashboard"
  }, [])

  const displayName = getDisplayName(user)

  const statItems = [
    { label: "Total interviews", value: stats.totalInterviews },
    {
      label: "Average score",
      value: stats.averageScore === null ? "—" : `${stats.averageScore}%`,
    },
    {
      label: "Best score",
      value: stats.bestScore === null ? "—" : `${stats.bestScore}%`,
    },
    { label: "Completed this week", value: stats.completedThisWeek },
  ]

  return (
    <AppLayout>
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl" data-testid="welcome-header">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300 sm:text-base">
            Ready for your next interview?
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigate("/setup")}
          data-testid="start-interview-btn"
          className="w-full bg-violet-500 text-white hover:bg-violet-600 sm:w-auto"
        >
          Start New Interview →
        </Button>
      </header>

      <section className="mb-6 sm:mb-8">
        <StatsGrid items={statItems} isLoading={isLoading} />
      </section>

      <section>
        <InterviewList
          interviews={interviews}
          isLoading={isLoading}
          error={error}
          onDelete={deleteInterview}
        />
      </section>

      {!isLoading && !error && interviews.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">
          Create an interview from Setup to get started.
        </p>
      ) : null}
    </AppLayout>
  )
}
