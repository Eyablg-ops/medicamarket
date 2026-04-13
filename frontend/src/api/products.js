import API from './axiosInstance';

export const getProducts = (params) => API.get('/products/', { params });
export const getCategories = () => API.get('/products/categories/');
export const getProduct = (slug) => API.get(`/products/${slug}/`);