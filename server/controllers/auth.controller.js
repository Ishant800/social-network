const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { generateToken } = require('../utils/token.util');

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

//  Generate unique username
const generateUsername = async (email) => {
  const base = email.split('@')[0].toLowerCase().replace(/\s+/g, '_');

  let username;
  let exists = true;

  while (exists) {
    const random = Math.floor(Math.random() * 10000);
    username = `${base}_${random}`;
    exists = await User.findOne({ username });
  }

  return username;
};

//  REGISTER
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email already in use'
      });
    }

    const username = await generateUsername(normalizedEmail);

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      profile: name ? { fullName: name.trim() } : {}
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate field value'
      });
    }

    res.status(500).json({
      error: 'Failed to register user'
    });
  }
};

//  LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }
    const user = await User.findOne({ email:email }).select('+password');

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to login'
    });
  }
};

module.exports = { register, login };