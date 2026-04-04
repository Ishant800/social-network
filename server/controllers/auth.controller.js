const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { generateToken } = require('../utils/token.util');

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

// signup controller
const createUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const normalizedUsername = (username || '').trim().toLowerCase().replace(/\s+/g, '_');

    if (!email || !normalizedUsername || !password) {
      return res.status(400).json({ error: 'all fields are required' });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { username: normalizedUsername }],
    });

    if (userExists) {
      return res.status(400).json({ message: ' user already exists' });
    }

    const hashedpassword = await bcrypt.hash(password, 8);
    const user = await User.create({
      username: normalizedUsername,
      email,
      password: hashedpassword,
    });

    if (!user) {
      return res.status(501).json({ error: 'failed to create user' });
    }

    return res.status(201).json({
      message: 'user created sucessfully',
      token: generateToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(501).json({ error: error.message || 'internal server error' });
  }
};

// sign in controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'all fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res
        .status(400)
        .json({ message: ' user not exists, please create your account.' });
    }

    const pm = await bcrypt.compare(password, userExists.password);
    if (!pm) {
      return res.status(400).json({ error: 'password not matched' });
    }

    const token = generateToken(userExists);

    return res.status(200).json({
      sucess: 'ok',
      message: 'Login sucessfully',
      token,
      user: serializeUser(userExists),
    });
  } catch (error) {
    return res.status(501).json({ error: error.message || 'internal server error' });
  }
};

module.exports = { createUser, login };
