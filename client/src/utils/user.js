/**
 * Shared user-related utilities.
 *
 * Consolidates helpers previously duplicated in AppLayout and ProfilePage.
 */

/**
 * Extract initials from a name string.
 * @param {string|null|undefined} name
 * @returns {string} — Up to 2 uppercase characters, or "U" fallback.
 */
export function getInitials(name) {
  if (!name || typeof name !== "string") {
    return "U"
  }

  const parts = name.trim().split(/\s+/).slice(0, 2)
  const initials = parts.map((part) => part[0]?.toUpperCase()).join("")

  return initials || "U"
}

/**
 * Get a display name from a user object.
 * @param {{ name?: string, email?: string }|null} user
 * @returns {string}
 */
export function getDisplayName(user) {
  return user?.name || user?.email || "User"
}
