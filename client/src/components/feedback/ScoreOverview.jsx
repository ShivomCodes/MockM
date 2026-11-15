import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { scoreColor, scoreRing, formatDateTime, recommendationClass, recommendationLabel } from "@/utils/format"

/**
 * Score overview card for the feedback page.
 *
 * Renders the animated score ring, role/type/difficulty badges,
 * recommendation, completion date, and AI summary.
 */
export default function ScoreOverview({ interview, feedback, displayScore }) {
  const overallScore = Number(feedback?.overallScore || interview?.overallScore || 0)
  const scoreGradient = useMemo(() => scoreRing(overallScore), [overallScore])
  const scoreTextColor = useMemo(() => scoreColor(overallScore), [overallScore])

  return (
    <Card className="border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[220px,1fr]">
          {/* Score ring */}
          <div className="flex items-center justify-center">
            <div
              className={`relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br sm:h-40 sm:w-40 ${scoreGradient}`}
            >
              <div className="absolute inset-[8px] rounded-full bg-white/95 dark:bg-slate-950/95 sm:inset-[10px]" />
              <p className={`relative text-3xl font-bold sm:text-4xl ${scoreTextColor}`}>
                {displayScore}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-violet-500/20 text-violet-700 dark:text-violet-200">
                {interview?.role || "Unknown role"}
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-200">
                {interview?.type || "Unknown type"}
              </Badge>
              <Badge className="bg-slate-500/20 text-slate-700 dark:text-slate-200">
                {interview?.difficulty || "Unknown difficulty"}
              </Badge>
              <Badge className={recommendationClass(feedback?.hiringRecommendation)}>
                {recommendationLabel(feedback?.hiringRecommendation)}
              </Badge>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-300">
              Completed on {formatDateTime(interview?.completedAt)}
            </p>

            <blockquote className="rounded-lg border-l-4 border-violet-400 bg-violet-500/10 px-4 py-3 text-slate-700 dark:text-slate-100">
              {feedback?.summary || "No summary available yet."}
            </blockquote>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
