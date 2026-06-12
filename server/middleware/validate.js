const { ValidationError } = require("../errors")

/**
 * Creates Express middleware that validates parts of the request
 * against the given schema.
 *
 * A schema is an object with optional keys `body`, `params`, `query`,
 * each mapping to a validator function:
 *
 *   validator(data) → { valid: boolean, errors?: string[] }
 *
 * @param {{ body?: Function, params?: Function, query?: Function }} schema
 * @returns {Function} Express middleware
 */
function validate(schema) {
  return (req, _res, next) => {
    const allErrors = []

    for (const source of ["body", "params", "query"]) {
      const validator = schema[source]
      if (!validator) continue

      const result = validator(req[source] || {})
      if (!result.valid) {
        allErrors.push(...(result.errors || [`Invalid ${source}`]))
      }
    }

    if (allErrors.length > 0) {
      throw new ValidationError("Validation failed", allErrors)
    }

    next()
  }
}

module.exports = validate
