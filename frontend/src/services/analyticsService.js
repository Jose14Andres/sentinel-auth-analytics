import API from './api';

export const analyticsService = {
  getSummary:    () => API.get('/analytics/summary'),
  getChartData:  (category_id) => API.get(`/analytics/chart?category_id=${category_id}`),
  getCategories: () => API.get('/analytics/categories'),
  getRecords:    () => API.get('/analytics/records'),
  createRecord:  (data) => API.post('/analytics/records', data),
};
