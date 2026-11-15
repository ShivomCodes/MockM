import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Spinner from "@/components/ui/Spinner"
import { Volume2, VolumeX } from "lucide-react"

/**
 * AI interviewer question panel.
 *
 * Renders the question prompt (with typewriter effect), TTS controls,
 * phase indicators (loading, thinking, done), and the "Begin Interview" button.
 */
export default function QuestionPanel({
  phase,
  currentPromptDisplay,
  answerTarget,
  ttsSupported,
  ttsIsSpeaking,
  ttsIsMuted,
  ttsReplay,
  ttsToggleMute,
  onBeginInterview,
  children,
}) {
  const isPromptPhase = phase === "question" || phase === "followup"

  return (
    <Card className="h-full border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
      <CardHeader>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative h-14 w-14 sm:h-20 sm:w-20">
            <div className="absolute inset-0 rounded-2xl bg-violet-500/25 animate-ping" />
            <div className="absolute inset-2 rounded-xl bg-violet-500/35 animate-pulse" />
            <div className="absolute inset-4 rounded-md bg-violet-300/90 sm:inset-5" />
          </div>
          <div>
            <CardTitle className="text-slate-900 dark:text-white">AI Interviewer</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-300">
              Stay concise and think aloud through your decisions.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Question / prompt area */}
        <div className="min-h-[140px] rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/40 sm:min-h-[180px] sm:p-5">
          {phase === "ready" ? (
            <p className="text-lg text-slate-600 dark:text-slate-200">
              Click Begin Interview to start
            </p>
          ) : null}

          {phase === "loading" ? (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
              <Spinner className="h-5 w-5 border-slate-500 border-t-violet-400" />
              Preparing your interview...
            </div>
          ) : null}

          {(isPromptPhase || phase === "listening" || phase === "thinking" || phase === "transcribing") && (
            <div className="space-y-3">
              {answerTarget === "followup" || phase === "followup" ? (
                <p className="inline-flex rounded-full border border-violet-400/40 bg-violet-500/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-violet-200">
                  Follow-up
                </p>
              ) : null}
              <p className="text-lg leading-relaxed text-slate-900 dark:text-white">
                {currentPromptDisplay}
              </p>

              {/* TTS controls */}
              {ttsSupported ? (
                <div className="flex items-center gap-2 pt-1">
                  {!ttsIsMuted ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={ttsReplay}
                      disabled={ttsIsSpeaking}
                      className="border-violet-400/40 bg-violet-500/10 text-violet-700 dark:text-violet-200 hover:bg-violet-500/20"
                    >
                      <Volume2 className="mr-1 h-3.5 w-3.5" />
                      {ttsIsSpeaking ? "Speaking..." : "Replay"}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={ttsToggleMute}
                    className="border-slate-200 dark:border-white/20 bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    {ttsIsMuted ? (
                      <>
                        <VolumeX className="mr-1 h-3.5 w-3.5" />
                        Unmute
                      </>
                    ) : (
                      <>
                        <Volume2 className="mr-1 h-3.5 w-3.5" />
                        Mute
                      </>
                    )}
                  </Button>
                </div>
              ) : null}
            </div>
          )}

          {phase === "done" ? (
            <p className="text-lg text-slate-700 dark:text-slate-100">
              Interview complete! Generating your feedback...
            </p>
          ) : null}
        </div>

        {/* Begin button */}
        {phase === "ready" ? (
          <Button
            onClick={onBeginInterview}
            className="bg-violet-500 text-white hover:bg-violet-600"
          >
            Begin Interview
          </Button>
        ) : null}

        {/* Answer controls slot (injected via children) */}
        {children}

        {/* Phase indicators */}
        {phase === "transcribing" ? (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
            <Spinner className="h-5 w-5 border-slate-500 border-t-violet-400" />
            Transcribing your voice...
          </div>
        ) : null}

        {phase === "thinking" ? (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
            <Spinner className="h-5 w-5 border-slate-500 border-t-violet-400" />
            AI is thinking...
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
