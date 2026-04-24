const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    // Check header first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // If no header token, check query parameter (for SSE)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.SECRETE_KEY);
    req.user = decoded;

    next();

  } catch (error) {
    console.error('JWT Error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }
};

module.exports = { verifyToken };