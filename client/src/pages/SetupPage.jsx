import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import {
  CheckCircle2,
  Code2,
  MessageSquare,
  Mic,
  Shuffle,
  TriangleAlert,
  Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { createInterview } from "@/services/interview.service"
import { useMediaDevices } from "@/hooks/useMediaDevices"
import { useToast } from "@/hooks/use-toast"
import AppLayout from "@/components/AppLayout"

const interviewTypes = [
  {
    value: "behavioral",
    title: "Behavioral",
    description: "Focus on communication, teamwork, and decision making.",
    icon: MessageSquare,
  },
  {
    value: "technical",
    title: "Technical",
    description: "Dive into engineering depth, architecture, and problem solving.",
    icon: Code2,
  },
  {
    value: "mixed",
    title: "Mixed",
    description: "Balanced blend of technical and behavioral questions.",
    icon: Shuffle,
  },
]

const difficulties = [
  {
    value: "easy",
    title: "Easy",
    description: "Warm-up questions with straightforward scenarios.",
    className: "border-green-500/40 bg-green-500/10 text-green-800 dark:text-green-100 hover:border-green-400/60",
    activeClassName: "ring-2 ring-green-400/70 border-green-400 bg-green-500/20",
  },
  {
    value: "medium",
    title: "Medium",
    description: "Realistic mid-level challenges and tradeoffs.",
    className: "border-yellow-500/40 bg-yellow-500/10 text-yellow-800 dark:text-yellow-100 hover:border-yellow-400/60",
    activeClassName: "ring-2 ring-yellow-400/70 border-yellow-400 bg-yellow-500/20",
  },
  {
    value: "hard",
    title: "Hard",
    description: "Complex, high-pressure and deep technical prompts.",
    className: "border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-100 hover:border-red-400/60",
    activeClassName: "ring-2 ring-red-400/70 border-red-400 bg-red-500/20",
  },
]

export default function SetupPage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Media devices hook — only auto-start on step 3.
  const {
    videoRef,
    cameraGranted,
    micGranted,
    error: mediaError,
    startStream,
    stopStream,
  } = useMediaDevices({ video: true, audio: true, autoStart: false })

  const form = useForm({
    defaultValues: {
      role: "",
      type: "mixed",
      difficulty: "medium",
      duration: 15,
    },
  })

  const role = form.watch("role")
  const selectedType = form.watch("type")
  const selectedDifficulty = form.watch("difficulty")
  const duration = form.watch("duration")
  const estimatedQuestions = Math.floor(Number(duration) / 3)

  useEffect(() => {
    document.title = "MockMate AI — Setup Interview"
  }, [])

  // Start/stop media check when entering/leaving step 3.
  useEffect(() => {
    if (step === 3) {
      startStream()
    } else {
      stopStream()
    }
  }, [step, startStream, stopStream])

  async function handleCreateInterview(values) {
    try {
      setIsSubmitting(true)
      const data = await createInterview({
        role: values.role,
        type: values.type,
        difficulty: values.difficulty,
        duration: values.duration,
      })

      const id = data?.id
      if (!id) throw new Error("Missing interview id")

      navigate(`/interview/${id}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not start interview",
        description: error.message || "Please check your setup and try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function validateAndNext() {
    if (step === 1) {
      if (!role || !role.trim()) {
        form.setError("role", { message: "Please enter a job role." })
        return
      }
      form.clearErrors("role")
      setStep(2)
      return
    }

    if (step === 2) {
      setStep(3)
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">Interview setup</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Configure your next mock interview.</p>
          </div>
          <div className="self-start rounded-full border border-violet-500/40 bg-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-200 sm:px-4 sm:py-2 sm:text-sm">
            Step {step} of 3
          </div>
        </div>

        <form
          onSubmit={(e) => {
            if (step < 3) {
              e.preventDefault()
              validateAndNext()
            } else {
              form.handleSubmit(handleCreateInterview)(e)
            }
          }}
          className="space-y-6"
        >
          <Card className="border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900 dark:text-white">
                {step === 1 ? "Step 1 — Role & Type" : step === 2 ? "Step 2 — Difficulty & Duration" : "Step 3 — Camera & Mic Check"}
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-300">
                {step === 1 ? "Define the position and interview style." : step === 2 ? "Choose challenge level and interview length." : "Verify your camera and microphone before you begin."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Job Role</label>
                    <Input
                      placeholder='e.g. "Frontend Engineer"'
                      className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-violet-500 dark:border-white/15 dark:bg-slate-900/40 dark:text-white"
                      {...form.register("role")}
                    />
                    {form.formState.errors.role ? (
                      <p className="text-sm text-red-500 dark:text-red-300">{form.formState.errors.role.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Interview Type</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {interviewTypes.map((typeOption) => {
                        const Icon = typeOption.icon
                        const isSelected = selectedType === typeOption.value
                        return (
                          <button
                            type="button"
                            key={typeOption.value}
                            onClick={() => form.setValue("type", typeOption.value)}
                            className={`rounded-xl border p-4 text-left transition ${
                              isSelected
                                ? "border-violet-400 bg-violet-500/15"
                                : "border-slate-200 bg-slate-50 hover:border-violet-500/40 dark:border-white/10 dark:bg-slate-900/30"
                            }`}
                          >
                            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-violet-600 dark:bg-slate-800/80 dark:text-violet-300">
                              <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">{typeOption.title}</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{typeOption.description}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Difficulty</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {difficulties.map((opt) => {
                        const isSelected = selectedDifficulty === opt.value
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => form.setValue("difficulty", opt.value)}
                            className={`rounded-xl border p-4 text-left transition ${opt.className} ${isSelected ? opt.activeClassName : ""}`}
                          >
                            <h3 className="font-semibold">{opt.title}</h3>
                            <p className="mt-1 text-sm">{opt.description}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Duration</p>
                      <p className="text-sm font-semibold text-violet-600 dark:text-violet-300">{duration} minutes</p>
                    </div>
                    <Slider min={5} max={30} step={5} value={[duration]} onValueChange={(v) => form.setValue("duration", v[0])} />
                    <p className="text-sm text-slate-500 dark:text-slate-300">~{estimatedQuestions} questions</p>
                  </div>
                </>
              ) : null}

              {step === 3 ? (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-900/40">
                    {mediaError ? (
                      <div className="flex items-start gap-3 p-5 text-sm text-red-600 dark:text-red-200">
                        <TriangleAlert className="mt-0.5 h-5 w-5 text-red-500 dark:text-red-300" />
                        <p>{mediaError}</p>
                      </div>
                    ) : (
                      <video ref={videoRef} autoPlay playsInline muted className="h-[280px] w-full scale-x-[-1] object-cover" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-900/30">
                      <Video className="h-5 w-5 text-slate-400 dark:text-slate-300" />
                      <p className="text-sm text-slate-700 dark:text-slate-200">Camera access</p>
                      <span className="ml-auto">
                        {cameraGranted ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <span className="text-xs text-slate-400">Pending</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-900/30">
                      <Mic className="h-5 w-5 text-slate-400 dark:text-slate-300" />
                      <p className="text-sm text-slate-700 dark:text-slate-200">Microphone access</p>
                      <span className="ml-auto">
                        {micGranted ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <span className="text-xs text-slate-400">Pending</span>}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => { if (step === 1) navigate("/dashboard"); else setStep((c) => c - 1) }}
              disabled={isSubmitting}
              className="w-full border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-slate-100 dark:hover:bg-white/10 sm:w-auto"
            >
              Back
            </Button>
            {step < 3 ? (
              <Button type="button" onClick={validateAndNext} className="w-full bg-violet-500 text-white hover:bg-violet-600 sm:w-auto">
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="w-full bg-violet-500 text-white hover:bg-violet-600 sm:w-auto">
                {isSubmitting ? "Starting..." : "Start Interview"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
