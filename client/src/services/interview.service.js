/**
 * Interview API service.
 *
 * Centralizes all interview-related HTTP calls. Pages and hooks
 * depend on this instead of importing the raw axios client.
 */
import api from "@/lib/api"

/** List all interviews for the current user. */
export async function listInterviews() {
  const response = await api.get("/api/interviews")
  return Array.isArray(response.data) ? response.data : []
}

/** Fetch a single interview by ID. */
export async function getInterview(id) {
  const response = await api.get(`/api/interviews/${id}`)
  return response.data
}

/** Create a new interview. */
export async function createInterview({ role, type, difficulty, duration }) {
  const response = await api.post("/api/interviews", {
    role,
    type,
    difficulty,
    duration,
  })
  return response.data
}

/** Transition an interview to "in_progress". */
export async function startInterview(id) {
  const response = await api.patch(`/api/interviews/${id}/start`, {})
  return response.data
}

/** Complete an interview with its transcript. */
export async function completeInterview(id, transcript) {
  const response = await api.patch(`/api/interviews/${id}/complete`, {
    transcript,
  })
  return response.data
}

/** Fetch AI-generated questions for an interview. */
export async function getQuestions(id) {
  const response = await api.get(`/api/interviews/${id}/questions`)
  return Array.isArray(response.data) ? response.data : []
}

/** Transcribe audio via the server's Gemini integration. */
export async function transcribeAudio(audio, mimeType) {
  const response = await api.post("/api/interviews/transcribe", {
    audio,
    mimeType,
  })
  return response.data?.text ?? response.data ?? ""
}

/** Delete an interview by ID. */
export async function deleteInterview(id) {
  const response = await api.delete(`/api/interviews/${id}`)
  return response.data
}

