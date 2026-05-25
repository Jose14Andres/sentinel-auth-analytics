import API from './api';

export const analyticsService = {
  getSummary:    (from, to) => API.get('/analytics/summary', { params: { from, to } }),
  getChartData:  (category_id, from, to) => API.get(`/analytics/chart`, { params: { category_id, from, to } }),
  getCategories: () => API.get('/analytics/categories'),
  getRecords:    (from, to) => API.get('/analytics/records', { params: { from, to } }),
  getMyRecords:  () => API.get('/analytics/my-records'),
  createRecord:  (data) => API.post('/analytics/records', data),
};
