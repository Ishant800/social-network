export function getFeedType(post) {
  const contentLength = post?.content?.length || 0;
  const titleLength = post?.title?.length || 0;
  const hasMedia = Array.isArray(post?.media)
    ? post.media.length > 0
    : Array.isArray(post?.images)
      ? post.images.length > 0
      : false;

  if (titleLength > 40 || contentLength > 220 || hasMedia) {
    return 'Blog Feed';
  }

  return 'Posts Feed';
}

export function isBlogPost(post) {
  return getFeedType(post) === 'Blog Feed';
}
