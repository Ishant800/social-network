const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { generateToken } = require('../utils/token.util');
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer.util');
const {
  verificationEmail,
  passwordResetEmail,
} = require('../utils/emailTemplates.util');

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const CODE_TTL_MINUTES = Number(process.env.AUTH_CODE_TTL_MINUTES) || 10;
const MAX_CODE_ATTEMPTS = Number(process.env.AUTH_CODE_MAX_ATTEMPTS) || 5;
const RESEND_COOLDOWN_SECONDS =
  Number(process.env.AUTH_CODE_RESEND_COOLDOWN_SECONDS) || 45;
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

/**
 * In-memory store for pending signups.
 * Key: normalizedEmail
 * Value: { name, hashedPassword, codeHash, expiresAt, attempts, lastSentAt }
 *
 * Entries expire after CODE_TTL_MINUTES and are cleaned up on the next request.
 */
const pendingSignups = new Map();

function prunePendingSignups() {
  const now = Date.now();
  for (const [key, val] of pendingSignups) {
    if (val.expiresAt < now) pendingSignups.delete(key);
  }
}

/** Send (or resend) a code for a pending-signup email. Throws RESEND_COOLDOWN if too soon. */
async function issuePendingCode(email, pending) {
  const now = new Date();

  if (pending.lastSentAt) {
    const secondsSince = Math.floor((now.getTime() - pending.lastSentAt.getTime()) / 1000);
    if (secondsSince < RESEND_COOLDOWN_SECONDS) {
      const err = new Error('RESEND_COOLDOWN');
      err.secondsLeft = RESEND_COOLDOWN_SECONDS - secondsSince;
      throw err;
    }
  }

  const code = generateNumericCode(6);
  pending.codeHash = hashCode(code);
  pending.expiresAt = addMinutes(now, CODE_TTL_MINUTES);
  pending.attempts = 0;
  pending.lastSentAt = now;

  const html = verificationEmail({ appName: APP_NAME, code, minutes: CODE_TTL_MINUTES });

  await sendMail({
    to: email,
    subject: `${APP_NAME} verification code: ${code}`,
    text: `Your ${APP_NAME} verification code is ${code}. It expires in ${CODE_TTL_MINUTES} minutes.`,
    html,
  });
}

/** Send/resend a code for an existing verified user (already in DB). */
async function issueEmailVerificationForUser(user) {
  if (user.emailVerified) return;

  const now = new Date();
  const lastSentAt = user.emailVerification?.lastSentAt;
  if (lastSentAt) {
    const secondsSince = Math.floor((now.getTime() - lastSentAt.getTime()) / 1000);
    if (secondsSince < RESEND_COOLDOWN_SECONDS) {
      const err = new Error('RESEND_COOLDOWN');
      err.secondsLeft = RESEND_COOLDOWN_SECONDS - secondsSince;
      throw err;
    }
  }

  const code = generateNumericCode(6);
  const codeHash = hashCode(code);

  user.emailVerification = {
    codeHash,
    expiresAt: addMinutes(now, CODE_TTL_MINUTES),
    attempts: 0,
    lastSentAt: now,
  };
  await user.save();

  const html = verificationEmail({ appName: APP_NAME, code, minutes: CODE_TTL_MINUTES });

  await sendMail({
    to: user.email,
    subject: `${APP_NAME} verification code: ${code}`,
    text: `Your ${APP_NAME} verification code is ${code}. It expires in ${CODE_TTL_MINUTES} minutes.`,
    html,
  });
}

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

//  REGISTER — stores pending signup in memory and sends code; NO DB write yet.
const register = async (req, res) => {
  try {
    prunePendingSignups();

    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Reject if a real (verified or unverified) account already exists.
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Reuse existing pending entry if present (so resend cooldown works).
    let pending = pendingSignups.get(normalizedEmail) || {};
    pending.name = name ? name.trim() : '';
    pending.hashedPassword = hashedPassword;
    pendingSignups.set(normalizedEmail, pending);

    let verificationEmailSent = false;
    try {
      await issuePendingCode(normalizedEmail, pending);
      verificationEmailSent = true;
    } catch (mailErr) {
      if (mailErr.message === 'RESEND_COOLDOWN') {
        return res.status(429).json({
          error: `Please wait ${mailErr.secondsLeft}s before requesting another code`,
        });
      }
      console.error('Signup email failed:', mailErr.message || mailErr);
    }

    return res.status(200).json({
      success: true,
      message: 'Verification code sent. Please check your email.',
      emailVerified: false,
      needsVerification: true,
      verificationEmailSent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to initiate signup' });
  }
};

//  LOGIN
const login = async (req, res) => {
  console.log(req.body)
  try {
 
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

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

    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in',
        emailVerified: false,
        needsVerification: true,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      emailVerified: user.emailVerified || false,
    });
     
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: 'Failed to login',
      
    }); 
  } 
};

// Resend code — works for both pending signups (in-memory) and already-saved-but-unverified users.
const sendEmailVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Case 1: pending signup (not yet in DB)
    const pending = pendingSignups.get(normalizedEmail);
    if (pending) {
      try {
        await issuePendingCode(normalizedEmail, pending);
      } catch (err) {
        if (err.message === 'RESEND_COOLDOWN') {
          return res.status(429).json({
            error: `Please wait ${err.secondsLeft}s before requesting another code`,
          });
        }
        throw err;
      }
      return res.json({ success: true, message: 'Verification code sent' });
    }

    // Case 2: user exists in DB but not yet verified
    const user = await User.findOne({ email: normalizedEmail }).select(
      '+emailVerification.codeHash +emailVerification.attempts +emailVerification.lastSentAt',
    );

    if (!user) {
      // Avoid account enumeration
      return res.json({ success: true, message: 'If the account exists, a verification code was sent' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    try {
      await issueEmailVerificationForUser(user);
    } catch (err) {
      if (err.message === 'RESEND_COOLDOWN') {
        return res.status(429).json({
          error: `Please wait ${err.secondsLeft}s before requesting another code`,
        });
      }
      throw err;
    }

    return res.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Failed to send verification code' });
  }
};

const verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();

    // ── Path A: pending signup (not yet in DB) ──────────────────────────────
    const pending = pendingSignups.get(normalizedEmail);
    if (pending) {
      if (!pending.codeHash || !pending.expiresAt) {
        return res.status(400).json({ error: 'No active code. Please request a new one.' });
      }
      if ((pending.attempts || 0) >= MAX_CODE_ATTEMPTS) {
        return res.status(429).json({ error: 'Too many attempts. Please request a new code.' });
      }
      if (now > pending.expiresAt) {
        pendingSignups.delete(normalizedEmail);
        return res.status(400).json({ error: 'Code expired. Please request a new one.' });
      }
      if (hashCode(code) !== pending.codeHash) {
        pending.attempts = (pending.attempts || 0) + 1;
        return res.status(400).json({ error: 'Invalid code' });
      }

      // Code is correct — now create the user in DB.
      const username = await generateUsername(normalizedEmail);
      const user = await User.create({
        username,
        email: normalizedEmail,
        password: pending.hashedPassword,
        emailVerified: true,
        profile: pending.name ? { fullName: pending.name } : {},
      });

      pendingSignups.delete(normalizedEmail);

      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        message: 'Email verified. Account created.',
        token,
        emailVerified: true,
      });
    }

    // ── Path B: user already exists in DB but not verified ──────────────────
    const user = await User.findOne({ email: normalizedEmail }).select(
      '+emailVerification.codeHash +emailVerification.expiresAt +emailVerification.attempts',
    );

    if (!user) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    if (user.emailVerified) {
      const token = generateToken(user._id);
      return res.json({ success: true, message: 'Email already verified', token, emailVerified: true });
    }

    const ev = user.emailVerification || {};

    if (!ev.codeHash || !ev.expiresAt) {
      return res.status(400).json({ error: 'No active code. Please request a new one.' });
    }
    if (ev.attempts >= MAX_CODE_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many attempts. Please request a new code.' });
    }
    if (now > ev.expiresAt) {
      return res.status(400).json({ error: 'Code expired. Please request a new one.' });
    }
    if (hashCode(code) !== ev.codeHash) {
      user.emailVerification.attempts = (user.emailVerification.attempts || 0) + 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid code' });
    }

    user.emailVerified = true;
    user.emailVerification = { codeHash: undefined, expiresAt: undefined, attempts: 0, lastSentAt: ev.lastSentAt };
    await user.save();

    const token = generateToken(user._id);
    return res.json({ success: true, message: 'Email verified successfully', token, emailVerified: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Failed to verify code' });
  }
};

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

module.exports = {
  register,
  login,
  sendEmailVerificationCode,
  verifyEmailCode,
  forgotPassword,
  resetPassword,
};