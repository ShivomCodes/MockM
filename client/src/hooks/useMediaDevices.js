import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Hook for managing webcam/microphone access.
 *
 * Extracted from SetupPage and InterviewPage — handles permission
 * requests, stream lifecycle, and cleanup.
 *
 * @param {{ video?: boolean, audio?: boolean, autoStart?: boolean }} [options]
 * @returns {{
 *   stream: MediaStream | null,
 *   videoRef: React.RefObject,
 *   cameraGranted: boolean,
 *   micGranted: boolean,
 *   error: string,
 *   startStream: () => Promise<void>,
 *   stopStream: () => void,
 * }}
 */
export function useMediaDevices(options = {}) {
  const { video = true, audio = true, autoStart = false } = options

  const [stream, setStream] = useState(null)
  const [cameraGranted, setCameraGranted] = useState(false)
  const [micGranted, setMicGranted] = useState(false)
  const [error, setError] = useState("")

  const streamRef = useRef(null)
  const videoRef = useRef(null)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStream(null)
    setCameraGranted(false)
    setMicGranted(false)
  }, [])

  const startStream = useCallback(async () => {
    setError("")
    setCameraGranted(false)
    setMicGranted(false)

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video,
        audio,
      })

      streamRef.current = mediaStream
      setStream(mediaStream)
      setCameraGranted(mediaStream.getVideoTracks().length > 0)
      setMicGranted(mediaStream.getAudioTracks().length > 0)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch {
      setError(
        "Camera or microphone access was denied. Allow permissions in your browser settings."
      )
    }
  }, [video, audio])

  // Auto-start if requested.
  useEffect(() => {
    if (!autoStart) return

    let cancelled = false

    // eslint-disable-next-line react-hooks/set-state-in-effect
    startStream().then(() => {
      if (cancelled) {
        stopStream()
      }
    })

    return () => {
      cancelled = true
      stopStream()
    }
  }, [autoStart, startStream, stopStream])

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [stopStream])

  return {
    stream,
    videoRef,
    cameraGranted,
    micGranted,
    error,
    startStream,
    stopStream,
  }
}
