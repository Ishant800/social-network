const { sanitize } = require('express-mongo-sanitize');

const opts = { replaceWith: '_' };


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
