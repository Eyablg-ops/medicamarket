import API from './axiosInstance';

export const getCart = () => API.get('/orders/cart/');
export const addToCart = (productId, quantity = 1) =>
  API.post('/orders/cart/add/', { product_id: productId, quantity });
export const updateCartItem = (itemId, quantity) =>
  API.patch(`/orders/cart/items/${itemId}/`, { quantity });
export const removeCartItem = (itemId) =>
  API.delete(`/orders/cart/items/${itemId}/remove/`);
export const checkout = (data) => API.post('/orders/checkout/', data);
export const getOrders = () => API.get('/orders/');
export const getOrder = (id) => API.get(`/orders/${id}/`);