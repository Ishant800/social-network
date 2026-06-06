import API from '@/api/axios';

const updatePrivacy = async ({ isPrivate, discoverable }) => {
  const { data } = await API.put('/user/privacy', { isPrivate, discoverable });
  return data;
};

const deleteAccount = async (password) => {
  const { data } = await API.delete('/user/account', { data: { password } });
  return data;
};

export default { updatePrivacy, deleteAccount };
