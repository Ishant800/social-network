const jwt = require('jsonwebtoken');

const accessSecret = () => process.env.JWT_ACCESS_SECRET || process.env.SECRETE_KEY;
const refreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.SECRETE_KEY;

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      username: user.username,
      email: user.email,
      typ: 'access',
    },
    accessSecret(),
    { expiresIn: ACCESS_EXPIRES },
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user._id,
      typ: 'refresh',
    },
    refreshSecret(),
    { expiresIn: REFRESH_EXPIRES },
  );
}

/** @deprecated use generateAccessToken */
function generateToken(user) {
  return generateAccessToken(user);
}

function verifyRefreshToken(token) {
  const payload = jwt.verify(token, refreshSecret());
  if (payload.typ !== 'refresh') {
    const err = new Error('Invalid refresh token');
    err.name = 'JsonWebTokenError';
    throw err;
  }
  return payload;
}

module.exports = {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  accessSecret,
  refreshSecret,
};
