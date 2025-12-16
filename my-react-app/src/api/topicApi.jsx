import axiosClient from './axiosClient';

const topicApi = {
  // Get all topics
  getAllTopics: (params) => {
    return axiosClient.get('/news-topics', { params });
  },

  // Get topic by ID
  getTopicById: (id) => {
    return axiosClient.get(`/news-topics/${id}`);
  },

  // Create new topic
  createTopic: (data) => {
    return axiosClient.post('/news-topics', data);
  },

  // Update topic
  updateTopic: (id, data) => {
    return axiosClient.put(`/news-topics/${id}`, data);
  },

  // Delete topic
  deleteTopic: (id) => {
    return axiosClient.delete(`/news-topics/${id}`);
  }
};

export default topicApi;
