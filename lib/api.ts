import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.dasm.com.sa";

const api = axios.create({
  baseURL: `${API_URL}/api/stores`,
  headers: { "Content-Type": "application/json" },
});

const platformApi = axios.create({
  baseURL: `${API_URL}/api`,
});

// أضف التوكن تلقائياً لكل طلب
const attachToken = (config: any) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("stores_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
api.interceptors.request.use(attachToken);
platformApi.interceptors.request.use(attachToken);

// لو 401 → وجّه لتسجيل الدخول
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("stores_token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

/* ── Public APIs ── */
export const publicApi = {
  getStore: (slug: string, params?: Record<string, string>) => api.get(`/public/${slug}`, { params }),
  getProducts: (slug: string, params?: Record<string, string>) =>
    api.get(`/public/${slug}/products`, { params }),
  getProduct: (slug: string, id: number, params?: Record<string, string>) =>
    api.get(`/public/${slug}/products/${id}`, { params }),
  getCategories: (slug: string) => api.get(`/public/${slug}/categories`),
  explore: (params?: Record<string, string>) =>
    api.get("/public/explore", { params }),
  getShippingRates: (slug: string, data: { destination_city: string; weight_kg?: number }) =>
    api.post(`/public/${slug}/shipping-rates`, data),
};

/* ── Checkout ── */
export const checkoutApi = {
  createOrder: (slug: string, data: any) => api.post(`/checkout/${slug}`, data),
  trackOrder: (slug: string, orderNumber: string) =>
    api.get(`/track/${slug}/${orderNumber}`),
  retryPayment: (slug: string, orderNumber: string) =>
    api.post(`/retry-payment/${slug}/${orderNumber}`),
};

/* ── Seller APIs ── */
export const sellerApi = {
  // المتجر
  getMyStore: () => api.get("/my-store"),
  createStore: (data: any) => api.post("/my-store", data),
  updateStore: (data: any) => api.put("/my-store", data),
  activateStore: () => api.post("/my-store/activate"),
  getStats: () => api.get("/my-store/stats"),

  // المنتجات
  getProducts: (params?: any) => api.get("/my-store/products", { params }),
  createProduct: (data: any) => api.post("/my-store/products", data),
  getProduct: (id: number) => api.get(`/my-store/products/${id}`),
  updateProduct: (id: number, data: any) => api.put(`/my-store/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/my-store/products/${id}`),

  // التابات
  getTabs: () => api.get("/my-store/tabs"),
  createTab: (data: any) => api.post("/my-store/tabs", data),
  updateTab: (id: number, data: any) => api.put(`/my-store/tabs/${id}`, data),
  deleteTab: (id: number) => api.delete(`/my-store/tabs/${id}`),

  // التصنيفات
  getCategories: () => api.get("/my-store/categories"),
  createCategory: (data: any) => api.post("/my-store/categories", data),
  updateCategory: (id: number, data: any) => api.put(`/my-store/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/my-store/categories/${id}`),

  // الطلبات
  getOrders: (params?: any) => api.get("/my-store/orders", { params }),
  getOrder: (id: number) => api.get(`/my-store/orders/${id}`),
  updateOrderStatus: (id: number, data: any) => api.put(`/my-store/orders/${id}/status`, data),

  // بوابة الدفع
  getPaymentConfig: () => api.get("/my-store/payment-config"),
  updatePaymentConfig: (data: any) => api.put("/my-store/payment-config", data),

  // الشحن
  getShippingConfigs: () => api.get("/my-store/shipping-config"),
  createShippingConfig: (data: any) => api.post("/my-store/shipping-config", data),
  updateShippingConfig: (id: number, data: any) => api.put(`/my-store/shipping-config/${id}`, data),
  deleteShippingConfig: (id: number) => api.delete(`/my-store/shipping-config/${id}`),
};

/* ── Upload (goes to platform API, not stores API) ── */
export const uploadApi = {
  uploadMedia: (file: File, context: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", context);
    return platformApi.post<{ status: string; secure_url: string; context: string }>(
      "/upload/media",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },
};

export { platformApi };
export default api;
