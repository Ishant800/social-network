const { sanitize } = require('express-mongo-sanitize');

const opts = { replaceWith: '_' };

/**
 * Express 5 often exposes `req.query`, `req.params`, and sometimes `req.body`
 * as read-only — assigning `req.* = …` throws.
 * `sanitize()` mutates objects in place, so we never reassign `req` properties.
 */
function mongoSanitizeSafe(req, res, next) {
  try {
    if (req.body && typeof req.body === 'object') {
      sanitize(req.body, opts);
    }
    if (req.params && typeof req.params === 'object') {
      sanitize(req.params, opts);
    }
  } catch (err) {
    return next(err);
  }
  next();
}

module.exports = { mongoSanitizeSafe };
