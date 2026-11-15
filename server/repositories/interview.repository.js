const prisma = require("../lib/prisma")
const { NotFoundError } = require("../errors")

/**
 * Interview data-access layer.
 *
 * Encapsulates all Prisma queries for the Interview model.
 * Throws typed AppError subclasses so the service layer never
 * needs to know about Prisma error codes.
 */

/** Fields returned for list views (excludes heavy JSON blobs). */
const LIST_SELECT = {
  id: true,
  role: true,
  type: true,
  difficulty: true,
  status: true,
  overallScore: true,
  createdAt: true,
  completedAt: true,
}

/**
 * Create a new interview record.
 * @param {{ userId: string, role: string, type: string, difficulty: string, duration: number }} data
 */
async function create({ userId, role, type, difficulty, duration }) {
  return prisma.interview.create({
    data: {
      userId,
      role,
      type,
      difficulty,
      duration,
      status: "pending",
    },
  })
}

/**
 * List all interviews for a user, ordered by newest first.
 * @param {string} userId
 */
async function findAllByUser(userId) {
  return prisma.interview.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: LIST_SELECT,
  })
}

/**
 * Find a single interview scoped to its owner.
 * @param {string} id
 * @param {string} userId
 * @throws {NotFoundError}
 */
async function findByIdAndUser(id, userId) {
  const interview = await prisma.interview.findFirst({
    where: { id, userId },
  })

  if (!interview) {
    throw new NotFoundError("Interview")
  }

  return interview
}

/**
 * Generic update by primary key.
 * @param {string} id
 * @param {object} data — Prisma-compatible update payload.
 */
async function updateById(id, data) {
  try {
    return await prisma.interview.update({
      where: { id },
      data,
    })
  } catch (error) {
    // Prisma P2025: record not found during update.
    if (error.code === "P2025") {
      throw new NotFoundError("Interview")
    }
    throw error
  }
}

/**
 * Transition an interview to "in_progress".
 * @param {string} id
 */
async function markInProgress(id) {
  return updateById(id, { status: "in_progress" })
}

/**
 * Mark an interview as completed with its transcript.
 * @param {string} id
 * @param {Array} transcript
 */
async function markCompleted(id, transcript) {
  return updateById(id, {
    transcript,
    status: "completed",
    completedAt: new Date(),
  })
}

/**
 * Persist AI-generated feedback and the overall score.
 * @param {string} id
 * @param {object} feedback
 */
async function saveFeedback(id, feedback) {
  return updateById(id, {
    feedback,
    overallScore: feedback?.overallScore ?? null,
  })
}

/**
 * Delete an interview scoped to its owner.
 * @param {string} id
 * @param {string} userId
 * @throws {NotFoundError}
 */
async function deleteByIdAndUser(id, userId) {
  // Verify ownership first
  await findByIdAndUser(id, userId)

  return prisma.interview.delete({
    where: { id },
  })
}

module.exports = {
  create,
  findAllByUser,
  findByIdAndUser,
  updateById,
  markInProgress,
  markCompleted,
  saveFeedback,
  deleteByIdAndUser,
}
