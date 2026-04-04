const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/token.util');
const { sanitizePlainText } = require('../utils/sanitize.util');

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

const serializeUser = (user) => ({
  _id: user._id,
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  profile: user.profile,
  stats: user.stats,
  followers: user.followers || [],
  following: user.following || [],
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

function authPayload(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: serializeUser(user),
  };
}

const createUser = async (req, res) => {
  try {
    const { email, username, password, name } = req.body;
    const rawHandle = (username ?? name ?? '').toString().trim();
    const normalizedUsername = rawHandle.toLowerCase().replace(/\s+/g, '_');
    const fullName = (name ?? '').toString().trim()
      ? sanitizePlainText((name ?? '').toString().trim(), 120)
      : undefined;

    if (!email || !normalizedUsername || !password) {
      return res.status(400).json({ error: 'all fields are required' });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const userExists = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (userExists) {
      return res.status(400).json({ message: ' user already exists' });
    }

    const hashedpassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedpassword,
      ...(fullName ? { profile: { fullName } } : {}),
    });

    if (!user) {
      return res.status(501).json({ error: 'failed to create user' });
    }

    return res.status(201).json({
      message: 'user created sucessfully',
      ...authPayload(user),
    });
  } catch (error) {
    return res.status(501).json({ error: error.message || 'internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'all fields are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (!userExists) {
      return res
        .status(400)
        .json({ message: ' user not exists, please create your account.' });
    }

    const pm = await bcrypt.compare(password, userExists.password);
    if (!pm) {
      return res.status(400).json({ error: 'password not matched' });
    }

    return res.status(200).json({
      sucess: 'ok',
      message: 'Login sucessfully',
      ...authPayload(userExists),
    });
  } catch (error) {
    return res.status(501).json({ error: error.message || 'internal server error' });
  }
};

const refresh = async (req, res) => {
  try {
    const token = req.body?.refreshToken;
    if (!token || typeof token !== 'string') {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(payload.id).select('_id role username email');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json(authPayload(user));
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not refresh session' });
  }
};

module.exports = { createUser, login, refresh };
