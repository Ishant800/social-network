const mongoose = require('mongoose');

function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const raw = req.params[paramName];
    if (!raw || !mongoose.Types.ObjectId.isValid(raw)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid id',
      });
    }
    next();
  };
}

module.exports = { validateObjectId };
