import axios from 'axios';

const AI_API = axios.create({
  baseURL: 'http://localhost:8000/api',
});

AI_API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const send_chat_message = (payload) =>
  AI_API.post('/ai/chat/', payload);

export const get_search_suggestions = (query) =>
  AI_API.get('/ai/search/suggestions/', {
    params: { q: query },
  });

export const get_alerts_summary = () =>
  AI_API.get('/ai/alerts/summary/');

export const generate_product_description = (product_id, payload) =>
  AI_API.post(`/ai/products/${product_id}/generate-description/`, payload);
export const get_recommendations = (query = '') =>
  AI_API.get('/ai/recommendations/', {
    params: { q: query },
  });