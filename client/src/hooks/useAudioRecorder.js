import { useCallback, useRef, useState } from "react"

/**
 * Hook that wraps the MediaRecorder API for audio capture.
 *
 * Extracted from InterviewPage — manages microphone access,
 * chunk collection, and Blob construction.
 *
 * @returns {{
 *   startRecording: () => Promise<void>,
 *   stopRecording: () => void,
 *   isRecording: boolean,
 *   audioResult: { blob: Blob, base64: string, mimeType: string } | null,
 *   error: string | null,
 *   resetResult: () => void,
 * }}
 */
export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioResult, setAudioResult] = useState(null)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        // Already stopped.
      }
    }
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    setAudioResult(null)
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        // Stop all tracks so the mic indicator disappears.
        stream.getTracks().forEach((track) => track.stop())

        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType,
        })
        audioChunksRef.current = []

        // Convert to base64 for the transcription API.
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
          const base64 = reader.result.split(",")[1]
          setAudioResult({
            blob,
            base64,
            mimeType: recorder.mimeType,
          })
        }

        setIsRecording(false)
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch {
      setError("Microphone unavailable. Please check your permissions.")
      setIsRecording(false)
    }
  }, [])

  const resetResult = useCallback(() => {
    setAudioResult(null)
  }, [])

  return {
    startRecording,
    stopRecording,
    isRecording,
    audioResult,
    error,
    resetResult,
  }
}
