const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { generateToken } = require('../utils/token.util');
<<<<<<< Updated upstream

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
=======
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer.util');
const { passwordResetEmail } = require('../utils/emailTemplates.util');

// Interest categories from recommendation system
const INTEREST_CATEGORIES = [
  'Programming',
  'AI',
  'Technology',
  'Business',
  'Startups',
  'Finance',
  'Science',
  'Education',
  'Gaming',
  'Sports',
  'Movies',
  'Music',
  'Travel',
  'Lifestyle',
  'Health',
  'Politics'
];

const INITIAL_INTEREST_SCORE = 50;

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const CODE_TTL_MINUTES = Number(process.env.AUTH_CODE_TTL_MINUTES) || 10;
const MAX_CODE_ATTEMPTS = Number(process.env.AUTH_CODE_MAX_ATTEMPTS) || 5;
const RESEND_COOLDOWN_SECONDS = Number(process.env.AUTH_CODE_RESEND_COOLDOWN_SECONDS) || 45;
const APP_NAME = process.env.APP_NAME || 'Social Network';

function generateNumericCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += crypto.randomInt(0, 10).toString();
  }
  return code;
}

function hashCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
//  REGISTER
=======
//  REGISTER — Create user immediately without email verification
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
    // Check if user already exists
>>>>>>> Stashed changes
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email already in use'
      });
    }

    const username = await generateUsername(normalizedEmail);

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const username = await generateUsername(normalizedEmail);

<<<<<<< Updated upstream
=======
    // Create user directly without verification
>>>>>>> Stashed changes
    const user = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
<<<<<<< Updated upstream
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
=======
      profile: name ? { fullName: name.trim() } : {},
    });

    const token = generateToken(user._id);

    // Create a system notification to prompt interest selection
    const { pushNotification } = require('./notification.controller');
    await pushNotification({
      recipient: user._id,
      actor: user._id,
      type: 'system',
      message: 'Welcome! Please select your interests to get personalized content recommendations.',
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create account' });
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    const user = await User.findOne({ email:email }).select('+password');
=======

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
    res.json({
      success: true,
      message: 'Login successful',
      token
=======
    // Check if user has interests, if not send a reminder notification
    if (!user.preferences?.interests || user.preferences.interests.length === 0) {
      const { pushNotification } = require('./notification.controller');
      await pushNotification({
        recipient: user._id,
        actor: user._id,
        type: 'system',
        message: 'Select your interests in Settings to get personalized content recommendations.',
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
>>>>>>> Stashed changes
    });
     
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: 'Failed to login',
    }); 
  } 
};

<<<<<<< Updated upstream
module.exports = { register, login };
=======
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      '+passwordReset.codeHash +passwordReset.attempts +passwordReset.lastSentAt',
    );

    // Always return success to avoid account enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If the account exists, a reset code was sent',
      });
    }

    const now = new Date();
    const lastSentAt = user.passwordReset?.lastSentAt;
    if (lastSentAt) {
      const secondsSince = Math.floor((now.getTime() - lastSentAt.getTime()) / 1000);
      if (secondsSince < RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({
          error: `Please wait ${RESEND_COOLDOWN_SECONDS - secondsSince}s before requesting another code`,
        });
      }
    }

    const code = generateNumericCode(6);
    const codeHash = hashCode(code);

    user.passwordReset = {
      codeHash,
      expiresAt: addMinutes(now, CODE_TTL_MINUTES),
      attempts: 0,
      lastSentAt: now,
    };
    await user.save();

    const html = passwordResetEmail({
      appName: APP_NAME,
      code,
      minutes: CODE_TTL_MINUTES,
    });

    await sendMail({
      to: user.email,
      subject: `${APP_NAME} password reset code: ${code}`,
      text: `Your ${APP_NAME} password reset code is ${code}. It expires in ${CODE_TTL_MINUTES} minutes.`,
      html,
    });

    return res.json({
      success: true,
      message: 'If the account exists, a reset code was sent',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Failed to start password reset' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and newPassword are required' });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      '+password +passwordReset.codeHash +passwordReset.expiresAt +passwordReset.attempts',
    );

    if (!user) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    const now = new Date();
    const pr = user.passwordReset || {};

    if (!pr.codeHash || !pr.expiresAt) {
      return res.status(400).json({ error: 'No active reset code. Please request a new one.' });
    }

    if (pr.attempts >= MAX_CODE_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many attempts. Please request a new code.' });
    }

    if (now > pr.expiresAt) {
      return res.status(400).json({ error: 'Code expired. Please request a new one.' });
    }

    const candidateHash = hashCode(code);
    if (candidateHash !== pr.codeHash) {
      user.passwordReset.attempts = (user.passwordReset.attempts || 0) + 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid code' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.password = hashedPassword;
    user.passwordReset = {
      codeHash: undefined,
      expiresAt: undefined,
      attempts: 0,
      lastSentAt: user.passwordReset.lastSentAt,
    };
    await user.save();

    return res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
};

/**
 * Setup user interests after signup
 * Called after user registers to initialize interest preferences and scores
 */
const setupUserInterests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interests } = req.body;

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one interest must be selected'
      });
    }

    // Validate all interests are in allowed categories
    const invalidInterests = interests.filter(
      interest => !INTEREST_CATEGORIES.includes(interest)
    );

    if (invalidInterests.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid interests: ${invalidInterests.join(', ')}`
      });
    }

    // Initialize interest scores for selected interests
    const interestScores = new Map();
    interests.forEach(interest => {
      interestScores.set(interest, INITIAL_INTEREST_SCORE);
    });

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        'preferences.interests': interests,
        interestScores: interestScores
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Interests set up successfully',
      data: {
        interests: user.preferences.interests,
        interestScores: Object.fromEntries(user.interestScores)
      }
    });
  } catch (error) {
    console.error('Setup interests error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  setupUserInterests,
};
>>>>>>> Stashed changes
