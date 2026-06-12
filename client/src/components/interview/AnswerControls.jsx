import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mic, Square } from "lucide-react"

/**
 * Answer controls for the interview page.
 *
 * Renders the appropriate UI based on the current phase:
 * - Voice recording button + "Type Instead" toggle
 * - Text input with submit
 * - Recording indicator with stop button
 */
export default function AnswerControls({
  phase,
  typewriterFinished,
  currentAnswer,
  setCurrentAnswer,
  onSubmitAnswer,
  onStartRecording,
  onStopRecording,
  isRecorderSupported,
  isSpeechError,
  setIsSpeechError,
}) {
  const isPromptPhase = phase === "question" || phase === "followup"

  // Recording in progress
  if (phase === "listening" && isRecorderSupported && !isSpeechError) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            onClick={onStopRecording}
            className="bg-red-600 text-white hover:bg-red-700 animate-pulse"
          >
            <Square className="mr-1 h-4 w-4" />
            Done Answering
          </Button>
          <p className="text-sm text-red-500 dark:text-red-300">Recording...</p>
        </div>
      </div>
    )
  }

  // Question/followup phase, typewriter finished
  if (isPromptPhase && typewriterFinished) {
    // If in voice mode and voice is supported (and no speech error has occurred)
    if (isRecorderSupported && !isSpeechError) {
      return (
        <div className="flex gap-2">
          <Button
            onClick={onStartRecording}
            className="bg-violet-500 text-white hover:bg-violet-600"
          >
            <Mic className="mr-1 h-4 w-4" />
            Start Answering
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsSpeechError(true)}
            className="border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-200"
          >
            Type Instead
          </Button>
        </div>
      )
    }

    // Otherwise, we are in typing/text mode (either because of speech error, or voice not supported)
    return (
      <div className="space-y-3">
        <Textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder={currentAnswer ? "Edit your answer..." : "Type your answer..."}
          className="min-h-[140px] border-slate-300 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
        />
        <div className="flex gap-2">
          <Button
            onClick={() => onSubmitAnswer(currentAnswer)}
            className="bg-violet-500 text-white hover:bg-violet-600"
          >
            Submit Answer
          </Button>
          {isRecorderSupported ? (
            <Button
              variant="outline"
              onClick={() => {
                setIsSpeechError(false)
                setCurrentAnswer("")
              }}
              className="border-violet-400/40 bg-violet-500/10 text-violet-700 hover:bg-violet-500/20 dark:text-violet-200"
            >
              <Mic className="mr-1 h-4 w-4" />
              Use Voice
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  return null
}
