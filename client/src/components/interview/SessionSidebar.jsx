import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, VideoOff } from "lucide-react"
import { formatTime } from "@/utils/format"

function getQuestionText(item) {
  if (!item) return ""
  if (typeof item === "string") return item
  return typeof item.question === "string" ? item.question : ""
}

/**
 * Session sidebar for the interview page.
 *
 * Shows webcam preview, timer, progress bar, and question list.
 */
export default function SessionSidebar({
  videoRef,
  webcamError,
  timeLeft,
  questionNumber,
  totalQuestions,
  progressValue,
  transcriptLength,
  questions,
  currentIndex,
  phase,
}) {
  return (
    <Card className="h-full border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
      <CardHeader className="space-y-4">
        {/* Webcam preview */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-900/50">
          {webcamError ? (
            <div className="flex h-28 items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-300 sm:h-36">
              <VideoOff className="h-4 w-4" />
              {webcamError}
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-28 w-full object-cover sm:h-36 scale-x-[-1]"
            />
          )}
        </div>

        {/* Timer */}
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Time Left
          </p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white">
            {formatTime(timeLeft)}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Question {questionNumber} of {totalQuestions}
          </p>
          <Progress value={progressValue} className="bg-slate-200 dark:bg-slate-800" />
          <p className="text-xs text-slate-400">
            Responses saved: {transcriptLength}
          </p>
        </div>
      </CardHeader>

      {/* Question list */}
      <CardContent>
        <div className="max-h-[200px] space-y-2 overflow-y-auto pr-1 sm:max-h-[340px]">
          {questions.map((item, index) => {
            const isCurrent = phase !== "done" && index === currentIndex
            const isCompleted =
              index < currentIndex || (phase === "done" && index <= currentIndex)

            return (
              <div
                key={item.id || `${index}-${getQuestionText(item)}`}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                  isCurrent
                    ? "border-violet-400/50 bg-violet-500/15 text-violet-700 dark:text-violet-100"
                    : "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200"
                }`}
              >
                <span className="w-5 text-center text-xs font-semibold">
                  {index + 1}
                </span>
                <p className="flex-1 truncate">{getQuestionText(item)}</p>
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : null}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
