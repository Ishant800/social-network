export const getDisplayName = (user) => {
  if (!user) return 'User';
  return (
    user.profile?.fullName ||
    user.fullName ||
    user.name ||
    user.username ||
    'User'
  );
};

export const getAvatarUrl = (user, fallback = '') => {
  if (!user) return fallback;
  const avatar = user.profile?.avatar ?? user.avatar ?? user.profileImage;
  if (typeof avatar === 'string') return avatar;
  return avatar?.url || fallback;
};

export const normalizeAuthor = (author) => {
  if (!author) return null;

  const id = author.userId || author._id || author.id;

  return {
    ...author,
    userId: id,
    _id: author._id || id,
    username: author.username,
    fullName: getDisplayName(author),
    avatar: getAvatarUrl(author, author.avatar),
  };
};
