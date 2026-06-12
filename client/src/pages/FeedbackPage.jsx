import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CheckCircle2, TriangleAlert } from "lucide-react"
import { useInterview } from "@/hooks/useInterview"
import { formatDateTime, recommendationLabel } from "@/utils/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Spinner from "@/components/ui/Spinner"
import ErrorFallback from "@/components/ErrorFallback"
import ScoreOverview from "@/components/feedback/ScoreOverview"
import ScoreCards from "@/components/feedback/ScoreCards"
import QuestionBreakdown from "@/components/feedback/QuestionBreakdown"

function sectionStyle(index) {
  return {
    animation: "fadeSlideIn 420ms ease-out forwards",
    animationDelay: `${(index + 1) * 0.1}s`,
    opacity: 0,
  }
}

export default function FeedbackPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { interview, isLoading, error } = useInterview(id, {
    pollInterval: 3000,
    pollUntilStatus: "completed",
  })

  const [displayScore, setDisplayScore] = useState(0)

  const feedback = interview?.feedback || {}
  const overallScore = Number(feedback?.overallScore || interview?.overallScore || 0)
  const strengths = Array.isArray(feedback?.strengths) ? feedback.strengths : []
  const improvements = Array.isArray(feedback?.improvements) ? feedback.improvements : []
  const questionFeedback = Array.isArray(feedback?.questionFeedback) ? feedback.questionFeedback : []

  useEffect(() => {
    document.title = "MockMate AI — Your Results"
  }, [])

  // Animate score counter.
  useEffect(() => {
    if (isLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayScore(0)
      return
    }

    const target = Math.max(0, Math.min(100, Math.round(overallScore)))
    setDisplayScore(0)
    if (target === 0) return

    const totalFrames = 36
    const increment = Math.max(1, Math.ceil(target / totalFrames))
    const intervalId = setInterval(() => {
      setDisplayScore((prev) => {
        const next = Math.min(target, prev + increment)
        if (next >= target) clearInterval(intervalId)
        return next
      })
    }, 25)

    return () => clearInterval(intervalId)
  }, [isLoading, overallScore])

  if (error && !interview) {
    return <ErrorFallback message={error.message || "Could not load feedback."} />
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
        <Spinner className="h-10 w-10 border-slate-500 border-t-violet-400" />
        <p className="text-lg font-medium">Analyzing your performance...</p>
      </div>
    )
  }

  function downloadReport() {
    if (!interview) return

    const lines = [
      `MockMate AI Interview Report`,
      ``,
      `Role: ${interview.role || "N/A"}`,
      `Type: ${interview.type || "N/A"}`,
      `Difficulty: ${interview.difficulty || "N/A"}`,
      `Completed: ${formatDateTime(interview.completedAt)}`,
      `Overall Score: ${feedback?.overallScore ?? interview?.overallScore ?? "N/A"}`,
      `Recommendation: ${recommendationLabel(feedback?.hiringRecommendation)}`,
      ``,
      `Summary:`,
      `${feedback?.summary || "No summary available."}`,
      ``,
      `Strengths:`,
      ...(strengths.length > 0 ? strengths.map((s) => `- ${s}`) : ["- N/A"]),
      ``,
      `Improvements:`,
      ...(improvements.length > 0 ? improvements.map((s) => `- ${s}`) : ["- N/A"]),
      ``,
      `Question Breakdown:`,
    ]

    questionFeedback.forEach((item, index) => {
      lines.push(
        ``,
        `${index + 1}. ${item?.question || "Question"}`,
        `Score: ${item?.score ?? "N/A"}/10`,
        `Feedback: ${item?.feedback || "N/A"}`,
        `Ideal Answer: ${item?.idealAnswer || "N/A"}`
      )
    })

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "report.txt"
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6 sm:py-8 md:px-10">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6">
        <section style={sectionStyle(0)}>
          <ScoreOverview
            interview={interview}
            feedback={feedback}
            displayScore={displayScore}
          />
        </section>

        <section style={sectionStyle(1)}>
          <ScoreCards feedback={feedback} />
        </section>

        <section style={sectionStyle(2)}>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
            {/* Strengths */}
            <Card className="border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-900 dark:text-white">Strengths</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {strengths.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-300">No strengths listed.</p>
                ) : (
                  strengths.map((item, index) => (
                    <div key={`${item}-${index}`} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                      <p className="text-sm text-slate-700 dark:text-slate-100">{item}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card className="border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-900 dark:text-white">Improvements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {improvements.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-300">No improvements listed.</p>
                ) : (
                  improvements.map((item, index) => (
                    <div key={`${item}-${index}`} className="flex items-start gap-2">
                      <TriangleAlert className="mt-0.5 h-4 w-4 text-amber-500" />
                      <p className="text-sm text-slate-700 dark:text-slate-100">{item}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section style={sectionStyle(3)}>
          <QuestionBreakdown questionFeedback={questionFeedback} />
        </section>

        <section style={sectionStyle(4)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              onClick={() => navigate("/setup")}
              className="w-full bg-violet-500 text-white hover:bg-violet-600 sm:w-auto"
            >
              Start New Interview
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="w-full border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-slate-100 dark:hover:bg-white/10 sm:w-auto"
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={downloadReport}
              className="w-full border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-slate-100 dark:hover:bg-white/10 sm:w-auto"
            >
              Download Report
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
