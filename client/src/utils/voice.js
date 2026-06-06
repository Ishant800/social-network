export function getPlayableVoiceUrl(url) {
  if (!url) return '';

  let normalized = String(url).replace(/^http:\/\//i, 'https://');

  // Cloudinary stores voice as video — transcode to mp3 for reliable HTML5 audio playback
  if (
    normalized.includes('res.cloudinary.com') &&
    normalized.includes('/video/upload/') &&
    !normalized.includes('/video/upload/q_auto')
  ) {
    normalized = normalized.replace('/video/upload/', '/video/upload/q_auto,f_mp3/');
  }

  return normalized;
}
