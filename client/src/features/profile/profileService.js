import API from '../../api/axios';

const isBlogItem = (item) => Boolean(item?.title || item?.coverImage);

const fetchOtherUserProfile = async (userId) => {
  const { data } = await API.get(`/user/profile/${userId}`);
  return {
    user: data.user,
    isFollowing: !!data.isFollowing,
    posts: (data.posts || []).filter((item) => !isBlogItem(item)),
    blogs: (data.posts || []).filter((item) => isBlogItem(item)),
  };
};

const fetchProfileHeader = async (userId) => {
  if (!userId) {
    const { data } = await API.get('/user/getMe');
    return {
      user: data.getme,
      isFollowing: false,
    };
  }

  const profile = await fetchOtherUserProfile(userId);
  return {
    user: profile.user,
    isFollowing: profile.isFollowing,
    prefetchedPosts: profile.posts,
    prefetchedBlogs: profile.blogs,
  };
};

const fetchProfilePosts = async (userId) => {
  if (!userId) {
    const { data } = await API.get('/post/myPost');
    return data.posts || [];
  }

  const profile = await fetchOtherUserProfile(userId);
  return profile.posts;
};

const fetchProfileBlogs = async (userId) => {
  if (!userId) {
    const { data } = await API.get('/blog/myBlogs');
    return data.blogs || [];
  }

  const profile = await fetchOtherUserProfile(userId);
  return profile.blogs;
};

const fetchProfileFollowers = async (userId) => {
  const url = userId ? `/user/followers/${userId}` : '/user/followers';
  const { data } = await API.get(url);
  return data.followers || [];
};

const fetchProfileFollowing = async (userId) => {
  const url = userId ? `/user/following/${userId}` : '/user/following';
  const { data } = await API.get(url);
  return data.following || [];
};

export default {
  fetchProfileHeader,
  fetchProfilePosts,
  fetchProfileBlogs,
  fetchProfileFollowers,
  fetchProfileFollowing,
};
