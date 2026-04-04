const jwt = require('jsonwebtoken');

// token generate
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      username: user.username,
      email: user.email,
    },
    process.env.SECRETE_KEY,
    { expiresIn: '7d' },
  );
};

module.exports = { generateToken };
