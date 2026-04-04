const sanitizeHtml = require('sanitize-html');

const defaultTextOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

/**
 * Plain-text safe string for posts, bios, comments (XSS mitigation).
 */
function sanitizePlainText(input, maxLength = 8000) {
  if (input == null) return '';
  const str = String(input);
  const cleaned = sanitizeHtml(str, defaultTextOptions);
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) : cleaned;
}

/**
 * Blog/article body: allow basic formatting without scripts or event handlers.
 */
function sanitizeRichText(input, maxLength = 100000) {
  if (input == null) return '';
  const str = String(input);
  const cleaned = sanitizeHtml(str, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a'],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
    },
  });
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) : cleaned;
}

module.exports = { sanitizePlainText, sanitizeRichText };
