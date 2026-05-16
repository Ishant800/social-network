function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function baseTemplate({ title, heading, bodyHtml, footerText }) {
  const safeTitle = escapeHtml(title);
  const safeHeading = escapeHtml(heading);
  const safeFooter = escapeHtml(footerText || '');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;background:#f6f7fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:#111827;color:#fff;border-radius:16px;padding:18px 20px;margin-bottom:16px;">
        <div style="font-size:14px;opacity:.9">Security</div>
        <div style="font-size:18px;font-weight:700;margin-top:4px;">${safeHeading}</div>
      </div>

      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:20px;">
        ${bodyHtml}
        <div style="margin-top:18px;color:#6b7280;font-size:12px;line-height:1.5;">
          ${safeFooter}
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function codeBlock(code) {
  const safeCode = escapeHtml(code);
  return `<div style="margin:14px 0 10px;">
    <div style="font-size:13px;color:#374151;margin-bottom:8px;">Your code:</div>
    <div style="font-size:28px;letter-spacing:6px;font-weight:800;background:#f3f4f6;border-radius:12px;padding:14px 16px;text-align:center;">
      ${safeCode}
    </div>
  </div>`;
}

function verificationEmail({ appName, code, minutes }) {
  const bodyHtml = `
    <div style="color:#111827;font-size:14px;line-height:1.6;">
      <p style="margin:0 0 10px;">Use this code to verify your email for <b>${escapeHtml(appName)}</b>.</p>
      ${codeBlock(code)}
      <p style="margin:0;">This code expires in <b>${escapeHtml(minutes)}</b> minutes.</p>
    </div>
  `;
  return baseTemplate({
    title: `${appName} verification code`,
    heading: 'Verify your email',
    bodyHtml,
    footerText:
      "If you didn't request this, you can ignore this email.",
  });
}

function passwordResetEmail({ appName, code, minutes }) {
  const bodyHtml = `
    <div style="color:#111827;font-size:14px;line-height:1.6;">
      <p style="margin:0 0 10px;">Use this code to reset your password for <b>${escapeHtml(appName)}</b>.</p>
      ${codeBlock(code)}
      <p style="margin:0;">This code expires in <b>${escapeHtml(minutes)}</b> minutes.</p>
    </div>
  `;
  return baseTemplate({
    title: `${appName} password reset code`,
    heading: 'Reset your password',
    bodyHtml,
    footerText:
      "If you didn't request this, you can ignore this email.",
  });
}

module.exports = { verificationEmail, passwordResetEmail };

