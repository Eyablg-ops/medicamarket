import API from './axiosInstance';

// Produits
export const getClinicProducts = () => API.get('/products/clinic/products/');
export const createProduct = (data) => API.post('/products/clinic/products/create/', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateProduct = (id, data) => API.patch(`/products/clinic/products/${id}/`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteProduct = (id) => API.delete(`/products/clinic/products/${id}/`);

// Catégories
export const getClinicCategories = () => API.get('/products/clinic/categories/');
export const createCategory = (data) => API.post('/products/clinic/categories/create/', data);
export const updateCategory = (id, data) => API.patch(`/products/clinic/categories/${id}/`, data);
export const deleteCategory = (id) => API.delete(`/products/clinic/categories/${id}/`);