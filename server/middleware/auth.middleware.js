const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token missing',
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