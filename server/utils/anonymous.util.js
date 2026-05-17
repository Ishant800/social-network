const ANIMALS = [
  'Owl', 'Tiger', 'Fox', 'Panda', 'Deer', 'Wolf', 'Eagle', 'Bear',
  'Rabbit', 'Dolphin', 'Hawk', 'Lion', 'Cat', 'Dog', 'Sun', 'Moon',
  'Star', 'Phoenix', 'Dragon', 'Butterfly', 'Whale', 'Falcon', 'Koala', 'Penguin',
];

const AVATAR_COLORS = [
  '#7c3aed', '#a855f7', '#6366f1', '#8b5cf6', '#c026d3',
  '#ea580c', '#f97316', '#0d9488', '#0891b2', '#be185d',
  '#4f46e5', '#059669', '#d97706', '#dc2626', '#2563eb',
];

const CONFESSION_CATEGORIES = [
  'Relationships',
  'College Life',
  'Funny',
  'Unpopular Opinions',
  'Work Life',
  'Family',
  'Mental Health',
  'Secrets',
  'Advice',
  'Other',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePersona() {
  const animal = pickRandom(ANIMALS);
  const color = pickRandom(AVATAR_COLORS);
  return {
    name: `Anonymous ${animal}`,
    avatarColor: color,
    animal,
  };
}

function stripUserFromPost(post) {
  const obj = typeof post.toObject === 'function' ? post.toObject() : { ...post };
  delete obj.user;
  return {
    ...obj,
    id: obj._id,
    author: null,
    anonymousPersona: obj.anonymousPersona || generatePersona(),
  };
}

function stripUserFromComment(comment) {
  const obj = typeof comment.toObject === 'function' ? comment.toObject() : { ...comment };
  delete obj.user;
  return {
    _id: obj._id,
    id: obj._id,
    content: obj.content,
    text: obj.content,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    stats: obj.stats,
    isAnonymous: true,
    anonymousPersona: obj.anonymousPersona || generatePersona(),
    user: null,
  };
}

module.exports = {
  ANIMALS,
  AVATAR_COLORS,
  CONFESSION_CATEGORIES,
  generatePersona,
  stripUserFromPost,
  stripUserFromComment,
};
