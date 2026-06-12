import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

/**
 * Reusable full-page error fallback.
 *
 * @param {{ message: string, navigateTo?: string, navigateLabel?: string, onRetry?: () => void }} props
 */
export default function ErrorFallback({
  message,
  navigateTo = "/dashboard",
  navigateLabel = "Back to Dashboard",
  onRetry,
}) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <p className="max-w-lg text-center text-red-500 dark:text-red-300">
        {message}
      </p>
      <div className="flex gap-3">
        {onRetry ? (
          <Button
            onClick={onRetry}
            className="bg-violet-500 text-white hover:bg-violet-600"
          >
            Retry
          </Button>
        ) : null}
        <Button
          onClick={() => navigate(navigateTo)}
          className="bg-violet-500 text-white hover:bg-violet-600"
        >
          {navigateLabel}
        </Button>
      </div>
    </div>
  )
}
