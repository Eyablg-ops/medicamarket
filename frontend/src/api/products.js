import API from './axiosInstance';

export const getProducts = (params) => API.get('/products/', { params });
export const getCategories = () => API.get('/products/categories/');
export const getProduct = (slug) => API.get(`/products/${slug}/`);
export const getAdminProducts = () =>API.get('/products/clinic/products/');
export const getAdminCategories = () =>API.get('/products/clinic/categories/');
export const createProduct = (data) =>API.post('/products/admin/products/create/', data);
export const updateProduct = (id, data) =>API.put(`/products/admin/products/${id}/`, data);

export const deleteProduct = (id) =>API.delete(`/products/admin/products/${id}/`);
export const createCategory = (data) =>API.post('/products/admin/categories/create/', data);
export const updateCategory = (id, data) =>API.put(`/products/admin/categories/${id}/`, data);
export const deleteCategory = (id) =>API.delete(`/products/admin/categories/${id}/`);