/**
 * Shared formatting utilities.
 *
 * Consolidates helpers previously duplicated across Dashboard,
 * Feedback, Profile, and InterviewPage.
 */

/**
 * Format a date value for display.
 * @param {string|Date|null} value
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(value, options) {
  if (!value) {
    return "—"
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return "—"
  }

  return parsed.toLocaleDateString(undefined, options || {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Format a date with time.
 * @param {string|Date|null} value
 * @returns {string}
 */
export function formatDateTime(value) {
  return formatDate(value, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

/**
 * Format a date with long month name.
 * @param {string|Date|null} value
 * @returns {string}
 */
export function formatDateLong(value) {
  return formatDate(value, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Format seconds into MM:SS.
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0)
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
}

/**
 * Display a numeric score, or "—" if invalid.
 * @param {*} value
 * @returns {string}
 */
export function scoreDisplay(value) {
  const score = Number(value)
  if (!Number.isFinite(score)) {
    return "—"
  }
  return Math.round(score).toString()
}

/**
 * Tailwind text color class based on score range.
 * @param {number} score — 0-100
 * @returns {string}
 */
export function scoreColor(score) {
  if (score < 40) return "text-red-600 dark:text-red-300"
  if (score <= 70) return "text-yellow-600 dark:text-yellow-300"
  return "text-green-600 dark:text-green-300"
}

/**
 * Tailwind gradient class for score ring.
 * @param {number} score — 0-100
 * @returns {string}
 */
export function scoreRing(score) {
  if (score < 40) return "from-red-500/70 to-red-300/70"
  if (score <= 70) return "from-yellow-500/70 to-yellow-300/70"
  return "from-green-500/70 to-green-300/70"
}

/**
 * Status badge class by interview status.
 * @param {string} status
 * @returns {string}
 */
export function statusBadgeClass(status) {
  if (status === "completed") {
    return "border-green-400/30 bg-green-500/20 text-green-700 dark:text-green-200"
  }
  if (status === "in_progress") {
    return "border-yellow-400/30 bg-yellow-500/20 text-yellow-700 dark:text-yellow-200"
  }
  return "border-slate-400/30 bg-slate-500/20 text-slate-600 dark:text-slate-200"
}

/**
 * Human-readable status label.
 * @param {string} status
 * @returns {string}
 */
export function statusLabel(status) {
  if (status === "in_progress") return "In Progress"
  if (status === "completed") return "Completed"
  return "Pending"
}

/**
 * Badge class for score-out-of-10.
 * @param {number} score — 0-10
 * @returns {string}
 */
export function outOfTenBadge(score) {
  if (score >= 8) return "border-green-400/30 bg-green-500/20 text-green-700 dark:text-green-200"
  if (score >= 5) return "border-yellow-400/30 bg-yellow-500/20 text-yellow-700 dark:text-yellow-200"
  return "border-red-400/30 bg-red-500/20 text-red-700 dark:text-red-200"
}

/**
 * Recommendation badge class.
 * @param {string} value
 * @returns {string}
 */
export function recommendationClass(value) {
  if (value === "strong_yes") return "border-green-400/30 bg-green-500/20 text-green-700 dark:text-green-200"
  if (value === "yes") return "border-teal-400/30 bg-teal-500/20 text-teal-700 dark:text-teal-200"
  if (value === "maybe") return "border-yellow-400/30 bg-yellow-500/20 text-yellow-700 dark:text-yellow-200"
  return "border-red-400/30 bg-red-500/20 text-red-700 dark:text-red-200"
}

/**
 * Recommendation human label.
 * @param {string} value
 * @returns {string}
 */
export function recommendationLabel(value) {
  if (!value) return "unknown"
  return value.replace("_", " ")
}

/**
 * Compute dashboard/profile stats from an interview array.
 * @param {Array} interviews
 * @returns {{ totalInterviews, completedInterviews, averageScore, bestScore, completedThisWeek, completedThisMonth }}
 */
export function computeInterviewStats(interviews) {
  const completed = interviews.filter((i) => i.status === "completed")
  const scores = completed
    .map((i) => Number(i.overallScore))
    .filter((s) => Number.isFinite(s))
  const total = scores.reduce((sum, s) => sum + s, 0)

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)

  const monthStart = new Date()
  monthStart.setDate(1)

  const completedThisWeek = completed.filter((i) => {
    if (!i.completedAt) return false
    const d = new Date(i.completedAt)
    return !Number.isNaN(d.getTime()) && d >= weekStart
  }).length

  const completedThisMonth = completed.filter((i) => {
    if (!i.completedAt) return false
    const d = new Date(i.completedAt)
    return !Number.isNaN(d.getTime()) && d >= monthStart
  }).length

  return {
    totalInterviews: interviews.length,
    completedInterviews: completed.length,
    averageScore: scores.length > 0 ? Math.round(total / scores.length) : null,
    bestScore: scores.length > 0 ? Math.round(Math.max(...scores)) : null,
    completedThisWeek,
    completedThisMonth,
  }
}
