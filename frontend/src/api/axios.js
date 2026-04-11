import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/users',
});

// === INTERCEPTEUR : Ajouter le token à chaque requête ===
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// === INTERCEPTEUR : Refresh auto si token expiré ===
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si 401 et pas déjà retryé
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');

      if (refresh) {
        try {
          const res = await axios.post(
            'http://localhost:8000/api/users/token/refresh/',
            { refresh }
          );
          localStorage.setItem('access_token', res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return API(originalRequest); // Rejouer la requête
        } catch {
          // Refresh expiré → déconnecter
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
