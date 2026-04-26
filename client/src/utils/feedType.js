export function getFeedType(item) {
  if (item?.feedType === 'blog') return 'Blog Feed';
  return 'Posts Feed';
}

export function isBlogPost(item) {
  return item?.feedType === 'blog';
}
