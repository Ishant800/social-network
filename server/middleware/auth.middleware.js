const jwt = require('jsonwebtoken');
const { accessSecret } = require('../utils/token.util');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Expected "Bearer <token>".',
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is empty.',
      });
    }

    const secret = accessSecret();
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Server auth is not configured.',
      });
    }

    const decode = jwt.verify(token, secret);
    
    req.user = decode;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token signature.',
      });
    }

    // Catch-all for unexpected errors
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

module.exports = { verifyToken };