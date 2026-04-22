import API from "./axiosInstance";

export const send_chat_message = (payload) => API.post("/ai/chat/", payload);

export const get_search_suggestions = (query) =>
  API.get("/ai/search/suggestions/", {
    params: { q: query },
  });

export const get_alerts_summary = () => API.get("/ai/alerts/summary/");

export const generate_product_description = (product_id, payload) =>
  API.post(`/ai/products/${product_id}/generate-description/`, payload);