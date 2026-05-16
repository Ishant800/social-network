const nodemailer = require('nodemailer');

let cachedTransporter;
let transporterVerified = false;
let transporterVerifyPromise;

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const user = getRequiredEnv('GMAIL_USER');
  // Gmail app passwords are often displayed/copied with spaces; SMTP auth should not include whitespace.
  const pass = getRequiredEnv('GMAIL_APP_PASSWORD').replace(/\s+/g, '');

  cachedTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  return cachedTransporter;
}

async function verifyOnce() {
  if (transporterVerified) return;
  if (transporterVerifyPromise) return transporterVerifyPromise;

  const transporter = getTransporter();
  transporterVerifyPromise = transporter
    .verify()
    .then(() => {
      transporterVerified = true;
      // Do not log secrets.
      console.log('📧 Gmail SMTP transporter verified successfully');
    })
    .catch((err) => {
      console.error('📧 Gmail SMTP transporter verify failed:', err?.code || err?.message || err);
      throw err;
    });

  return transporterVerifyPromise;
}

async function sendMail({ to, subject, html, text }) {
  const fromName = process.env.APP_NAME || 'Social Network';
  const fromEmail = getRequiredEnv('GMAIL_USER');

  const transporter = getTransporter();
  await verifyOnce();

  try {
    const info = await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('📨 Email sent:', {
      to,
      subject,
      messageId: info?.messageId,
    });

    return info;
  } catch (err) {
    console.error('📨 Email send failed:', {
      to,
      subject,
      code: err?.code,
      message: err?.message,
    });
    throw err;
  }
}

module.exports = { sendMail };

