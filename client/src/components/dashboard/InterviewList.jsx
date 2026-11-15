import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { formatDate, scoreDisplay, statusBadgeClass, statusLabel } from "@/utils/format"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Determine the action button for an interview row.
 */
function actionForInterview(interview) {
  if (interview.status === "completed") {
    return {
      label: "View Feedback",
      path: `/feedback/${interview.id}`,
      className:
        "border-violet-400/40 bg-violet-500/10 text-violet-700 hover:bg-violet-500/20 dark:text-violet-200",
      variant: "outline",
    }
  }

  if (interview.status === "pending") {
    return {
      label: "Start",
      path: `/interview/${interview.id}`,
      className: "bg-violet-500 text-white hover:bg-violet-600",
      variant: "default",
    }
  }

  return {
    label: "Resume",
    path: `/interview/${interview.id}`,
    className:
      "border-yellow-400/40 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 dark:text-yellow-100",
    variant: "outline",
  }
}

/**
 * Interview list card with status badges, action buttons, and delete capabilities.
 */
export default function InterviewList({ interviews, isLoading, error, onDelete }) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [interviewToDelete, setInterviewToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!interviewToDelete) return
    setIsDeleting(true)
    try {
      await onDelete(interviewToDelete.id)
      toast({
        title: "Interview deleted",
        description: "The interview has been successfully removed.",
      })
      setInterviewToDelete(null)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: err.message || "Failed to delete the interview. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900 dark:text-white sm:text-xl">
            Your interviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-16 w-full bg-slate-100 dark:bg-white/10" />
              <Skeleton className="h-16 w-full bg-slate-100 dark:bg-white/10" />
              <Skeleton className="h-16 w-full bg-slate-100 dark:bg-white/10" />
              <Skeleton className="h-16 w-full bg-slate-100 dark:bg-white/10" />
            </>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
              {error.message || "Failed to load interviews."}
            </div>
          ) : interviews.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500 dark:border-white/20 dark:bg-slate-900/40 dark:text-slate-300">
              No interviews yet. Start your first one!
            </div>
          ) : (
            interviews.map((interview) => {
              const action = actionForInterview(interview)

              return (
                <div
                  key={interview.id}
                  className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Left: Role + metadata */}
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-violet-500/20 text-violet-700 dark:text-violet-200">
                        {interview.role || "Unknown role"}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                        {interview.type || "—"}
                      </span>
                      <span className="hidden text-slate-300 dark:text-slate-600 sm:inline">
                        ·
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                        {interview.difficulty || "—"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 sm:hidden">
                      {formatDate(interview.createdAt)}
                    </span>
                  </div>

                  {/* Right: Status + score + date + action */}
                  <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Badge className={statusBadgeClass(interview.status)}>
                        {statusLabel(interview.status)}
                      </Badge>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-100">
                        {scoreDisplay(interview.overallScore)}
                      </span>
                      <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:inline sm:text-sm">
                        {formatDate(interview.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant={action.variant}
                        className={`text-xs sm:text-sm ${action.className}`}
                        onClick={() => navigate(action.path)}
                      >
                        {action.label}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        onClick={() => setInterviewToDelete(interview)}
                        aria-label="Delete interview"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!interviewToDelete} onOpenChange={(open) => { if (!open) setInterviewToDelete(null) }}>
        <DialogContent className="border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-slate-950 dark:text-white">Delete Interview</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 mt-2">
              Are you sure you want to delete the{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {interviewToDelete?.difficulty} {interviewToDelete?.role} ({interviewToDelete?.type})
              </span>{" "}
              interview? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setInterviewToDelete(null)}
              disabled={isDeleting}
              className="border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-400"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-800 dark:hover:bg-red-700 flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
