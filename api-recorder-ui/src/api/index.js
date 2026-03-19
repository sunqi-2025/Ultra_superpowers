import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});

export const sessionsApi = {
  create(name) {
    return api.post('/sessions', { name });
  },
  
  getAll() {
    return api.get('/sessions');
  },
  
  getById(id) {
    return api.get(`/sessions/${id}`);
  },
  
  update(id, data) {
    return api.put(`/sessions/${id}`, data);
  },
  
  delete(id) {
    return api.delete(`/sessions/${id}`);
  },
  
  exportMarkdown(id) {
    return api.get(`/sessions/${id}/export/markdown`, { responseType: 'blob' });
  },
  
  exportJson(id) {
    return api.get(`/sessions/${id}/export/json`, { responseType: 'blob' });
  },
  
  exportJmx(id) {
    return api.get(`/sessions/${id}/export/jmx`, { responseType: 'blob' });
  }
};

export const requestsApi = {
  getById(id) {
    return api.get(`/requests/${id}`);
  },
  
  delete(id) {
    return api.delete(`/requests/${id}`);
  }
};

export default api;
