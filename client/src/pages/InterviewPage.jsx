import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis"
import { useAudioRecorder } from "@/hooks/useAudioRecorder"
import { useMediaDevices } from "@/hooks/useMediaDevices"
import {
  startInterview,
  completeInterview,
  getQuestions,
  transcribeAudio,
} from "@/services/interview.service"
import ErrorFallback from "@/components/ErrorFallback"
import InterviewHeader from "@/components/interview/InterviewHeader"
import QuestionPanel from "@/components/interview/QuestionPanel"
import AnswerControls from "@/components/interview/AnswerControls"
import SessionSidebar from "@/components/interview/SessionSidebar"

function getQuestionText(item) {
  if (!item) return ""
  if (typeof item === "string") return item
  return typeof item.question === "string" ? item.question : ""
}

function getFollowUpText(item) {
  if (!item || typeof item === "string") return ""
  return typeof item.followUp === "string" ? item.followUp : ""
}

export default function InterviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    speak: ttsSpeak,
    stop: ttsStop,
    replay: ttsReplay,
    isSpeaking: ttsIsSpeaking,
    isMuted: ttsIsMuted,
    toggleMute: ttsToggleMute,
    isSupported: ttsSupported,
  } = useSpeechSynthesis()

  const {
    startRecording,
    stopRecording,
    audioResult,
    error: audioRecorderError,
    resetResult,
  } = useAudioRecorder()

  const {
    videoRef,
    error: webcamError,
    stopStream,
  } = useMediaDevices({ video: true, audio: true, autoStart: true })

  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState("loading")
  const [transcript, setTranscript] = useState([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)
  const [typedPrompt, setTypedPrompt] = useState("")
  const [typedPromptKey, setTypedPromptKey] = useState("")
  const [answerTarget, setAnswerTarget] = useState("question")
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [isSpeechError, setIsSpeechError] = useState(false)

  const transcriptRef = useRef([])
  const pendingEntryRef = useRef(null)
  const thinkingTimeoutRef = useRef(null)
  const isCompletingRef = useRef(false)

  const supported = typeof window !== "undefined" && "MediaRecorder" in window

  const currentQuestion = questions[currentIndex] || null
  const currentQuestionText = useMemo(
    () => getQuestionText(currentQuestion),
    [currentQuestion]
  )
  const currentFollowUpText = useMemo(
    () => getFollowUpText(currentQuestion),
    [currentQuestion]
  )
  const activePromptText =
    answerTarget === "followup" ? currentFollowUpText : currentQuestionText
  const isPromptPhase = phase === "question" || phase === "followup"
  const promptKey = `${phase}-${currentIndex}-${answerTarget}-${activePromptText}`
  const typewriterFinished =
    isPromptPhase &&
    (activePromptText.trim() === "" ||
      (typedPromptKey === promptKey &&
        typedPrompt.trim() === activePromptText.trim()))

  const totalQuestions = questions.length
  const questionNumber = totalQuestions > 0 ? Math.min(currentIndex + 1, totalQuestions) : 0
  const progressValue =
    totalQuestions > 0
      ? phase === "done"
        ? 100
        : Math.round((questionNumber / totalQuestions) * 100)
      : 0

  const finishInterview = useCallback(
    async (finalTranscript) => {
      if (isCompletingRef.current) {
        return
      }

      isCompletingRef.current = true
      setPhase("done")
      stopRecording()
      stopStream()
      ttsStop()

      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current)
        thinkingTimeoutRef.current = null
      }

      try {
        await completeInterview(id, finalTranscript)
        navigate(`/feedback/${id}`, { replace: true })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Could not complete interview",
          description: error.message || "Please try again from your dashboard.",
        })
        navigate("/dashboard", { replace: true })
      }
    },
    [id, navigate, stopRecording, stopStream, ttsStop, toast]
  )

  const queueThinkingTransition = useCallback((callback) => {
    if (thinkingTimeoutRef.current) {
      clearTimeout(thinkingTimeoutRef.current)
    }

    setPhase("thinking")
    thinkingTimeoutRef.current = setTimeout(() => {
      callback()
    }, 900)
  }, [])

  const startListening = useCallback(async () => {
    setCurrentAnswer("Recording your answer... (Speak now)")
    setPhase("listening")
    setIsSpeechError(false)
    await startRecording()
  }, [startRecording])

  useEffect(() => {
    if (audioRecorderError) {
      toast({
        variant: "destructive",
        title: "Microphone unavailable",
        description: audioRecorderError,
      })
      setPhase(answerTarget)
      setIsSpeechError(true)
      setCurrentAnswer("")
    }
  }, [audioRecorderError, answerTarget, toast])

  const handleAnswerSubmission = useCallback(
    (rawAnswer) => {
      const answer = rawAnswer.trim()
      if (!answer) {
        toast({
          variant: "destructive",
          title: "Answer required",
          description: "Please provide an answer before continuing.",
        })
        return
      }

      const questionText = currentQuestionText
      const followUpText = currentFollowUpText

      setCurrentAnswer("")

      if (answerTarget === "question" && followUpText) {
        pendingEntryRef.current = {
          question: questionText,
          answer,
          followUp: followUpText,
          followUpAnswer: "",
        }

        queueThinkingTransition(() => {
          setAnswerTarget("followup")
          setPhase("followup")
        })
        return
      }

      let entry
      if (answerTarget === "followup") {
        const pending = pendingEntryRef.current || {
          question: questionText,
          answer: "",
          followUp: followUpText,
          followUpAnswer: "",
        }
        entry = { ...pending, followUpAnswer: answer }
        pendingEntryRef.current = null
      } else {
        entry = {
          question: questionText,
          answer,
          followUp: followUpText || "",
          followUpAnswer: "",
        }
      }

      const updatedTranscript = [...transcriptRef.current, entry]
      transcriptRef.current = updatedTranscript
      setTranscript(updatedTranscript)

      queueThinkingTransition(() => {
        const hasNextQuestion = currentIndex + 1 < questions.length
        if (hasNextQuestion) {
          setCurrentIndex((previous) => previous + 1)
          setAnswerTarget("question")
          setPhase("question")
          return
        }

        finishInterview(updatedTranscript)
      })
    },
    [
      answerTarget,
      currentFollowUpText,
      currentIndex,
      currentQuestionText,
      finishInterview,
      queueThinkingTransition,
      questions.length,
      toast,
    ]
  )

  useEffect(() => {
    if (audioResult) {
      const handleTranscription = async () => {
        const { base64, blob } = audioResult
        setCurrentAnswer("Transcribing audio...")
        setPhase("transcribing")
        try {
          const text = await transcribeAudio(base64, blob.type)
          if (!text.trim()) {
            toast({
              variant: "destructive",
              title: "No speech detected",
              description: "We couldn't hear anything. Please type your answer.",
            })
            setPhase(answerTarget)
            setIsSpeechError(true)
            setCurrentAnswer("")
          } else {
            handleAnswerSubmission(text)
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Transcription failed",
            description: error.message || "We couldn't transcribe that. Please type your answer.",
          })
          setPhase(answerTarget)
          setIsSpeechError(true)
          setCurrentAnswer("")
        } finally {
          resetResult()
        }
      }
      handleTranscription()
    }
  }, [audioResult, answerTarget, resetResult, toast, handleAnswerSubmission])

  useEffect(() => {
    let isCancelled = false
    document.title = "MockMate AI — Interview in Progress"

    async function initializeInterview() {
      try {
        setPhase("loading")

        const startResponse = await startInterview(id)
        if (isCancelled) {
          return
        }

        const durationMinutes = Number(startResponse?.duration)
        setTimeLeft(
          Number.isFinite(durationMinutes) && durationMinutes > 0
            ? durationMinutes * 60
            : 15 * 60
        )

        const questionsResponse = await getQuestions(id)
        if (isCancelled) {
          return
        }

        setQuestions(questionsResponse)
        setCurrentIndex(0)
        setAnswerTarget("question")
        setLoadError("")
        setPhase("ready")
      } catch (error) {
        setLoadError(error.message || "Please return to the dashboard and try again.")
        toast({
          variant: "destructive",
          title: "Could not load interview",
          description: error.message || "Please return to the dashboard and try again.",
        })
      }
    }

    initializeInterview()

    return () => {
      isCancelled = true
      stopRecording()
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current)
        thinkingTimeoutRef.current = null
      }
    }
  }, [id, stopRecording, toast])

  useEffect(() => {
    if (!isPromptPhase) {
      return
    }

    const sourceText = activePromptText
    const words = sourceText.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      return
    }

    // Auto-speak the question when it appears
    ttsSpeak(sourceText)

    let wordIndex = 0
    const intervalId = setInterval(() => {
      wordIndex += 1
      setTypedPromptKey(promptKey)
      setTypedPrompt(words.slice(0, wordIndex).join(" "))

      if (wordIndex >= words.length) {
        clearInterval(intervalId)
      }
    }, 60)

    return () => {
      clearInterval(intervalId)
      ttsStop()
    }
  }, [activePromptText, isPromptPhase, promptKey, ttsSpeak, ttsStop])

  useEffect(() => {
    if (phase === "loading" || phase === "done") {
      return
    }

    const timerId = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timerId)
          return 0
        }
        return previous - 1
      })
    }, 1000)

    return () => {
      clearInterval(timerId)
    }
  }, [phase])

  useEffect(() => {
    if (timeLeft === 0 && phase !== "loading" && phase !== "done") {
      finishInterview(transcriptRef.current)
    }
  }, [finishInterview, phase, timeLeft])

  function beginInterview() {
    if (questions.length === 0) {
      finishInterview(transcriptRef.current)
      return
    }

    setAnswerTarget("question")
    setCurrentAnswer("")
    setPhase("question")
  }

  const currentPromptDisplay = isPromptPhase
    ? typedPromptKey === promptKey
      ? typedPrompt
      : ""
    : activePromptText

  if (loadError) {
    return (
      <ErrorFallback
        message={loadError}
        navigateTo="/dashboard"
        navigateLabel="Back to Dashboard"
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:p-6 md:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-5">
        <InterviewHeader
          isEndDialogOpen={isEndDialogOpen}
          setIsEndDialogOpen={setIsEndDialogOpen}
          onConfirmEnd={() => finishInterview(transcriptRef.current)}
        />

        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <QuestionPanel
              phase={phase}
              currentPromptDisplay={currentPromptDisplay}
              answerTarget={answerTarget}
              typewriterFinished={typewriterFinished}
              ttsSupported={ttsSupported}
              ttsIsSpeaking={ttsIsSpeaking}
              ttsIsMuted={ttsIsMuted}
              ttsReplay={ttsReplay}
              ttsToggleMute={ttsToggleMute}
              onBeginInterview={beginInterview}
            >
              <AnswerControls
                phase={phase}
                typewriterFinished={typewriterFinished}
                currentAnswer={currentAnswer}
                setCurrentAnswer={setCurrentAnswer}
                onSubmitAnswer={handleAnswerSubmission}
                onStartRecording={startListening}
                onStopRecording={stopRecording}
                isRecorderSupported={supported}
                isSpeechError={isSpeechError}
                setIsSpeechError={setIsSpeechError}
              />
            </QuestionPanel>
          </div>

          <div className="lg:col-span-1">
            <SessionSidebar
              videoRef={videoRef}
              webcamError={webcamError}
              timeLeft={timeLeft}
              questionNumber={questionNumber}
              totalQuestions={totalQuestions}
              progressValue={progressValue}
              transcriptLength={transcript.length}
              questions={questions}
              currentIndex={currentIndex}
              phase={phase}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
