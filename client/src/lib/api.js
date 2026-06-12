import axios from "axios"
import { ApiError, parseApiError } from "./errors"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
})

// ── Request interceptor ───────────────────────────────────────────────
api.interceptors.request.use((config) => {
  config.withCredentials = true
  return config
})

// ── Response interceptor ──────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // Unwrap the new server envelope: { success: true, data: ... }
    // If the server wraps in `{ success, data }`, return `data` directly.
    // Otherwise return the raw response data for backwards compatibility.
    const body = response.data

    if (body && typeof body === "object" && "success" in body && "data" in body) {
      response.data = body.data
    }

    return response
  },
  (error) => {
    // Redirect to auth on 401 (session expired).
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth"
      }
    }

    // Normalize into ApiError so callers have a consistent shape.
    return Promise.reject(parseApiError(error))
  }
)

export default api
