import API from './api';

export const risksService = {
  getAll:     () => API.get('/risks'),
  getSummary: () => API.get('/risks/summary'),
  getById:    (id) => API.get(`/risks/${id}`),
  create:     (data) => API.post('/risks', data),
  update:     (id, data) => API.put(`/risks/${id}`, data),
  remove:     (id) => API.delete(`/risks/${id}`),
};
