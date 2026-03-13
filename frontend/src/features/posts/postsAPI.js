import axiosInstance from '../../services/axiosInstance';

const postsAPI = {
  fetchPosts: async (params) => {
    const response = await axiosInstance.get('/api/posts', { params });
    return response.data;
  },
  fetchDraftPosts: async () => {
    const response = await axiosInstance.get('/api/posts/drafts');
    return response.data;
  },
  fetchPostById: async (id) => {
    const response = await axiosInstance.get(`/api/posts/${id}`);
    return response.data;
  },
  createPost: async (payload) => {
    const response = await axiosInstance.post('/api/posts', payload);
    return response.data;
  },
  updatePost: async ({ id, payload }) => {
    const response = await axiosInstance.put(`/api/posts/${id}`, payload);
    return response.data;
  },
  deletePost: async (id) => {
    await axiosInstance.delete(`/api/posts/${id}`);
    return id;
  },
  publishPost: async ({ id, published }) => {
    const response = await axiosInstance.patch(`/api/posts/${id}/publish`, null, { params: { published } });
    return response.data;
  },
  archivePost: async (id) => {
    const response = await axiosInstance.patch(`/api/posts/${id}/archive`);
    return response.data;
  }
};

export default postsAPI;