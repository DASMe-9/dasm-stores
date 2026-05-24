import axios, { type InternalAxiosRequestConfig } from "axios";

import { clearStoresToken } from "./auth-token";
import { DEFAULT_PLATFORM_API_ORIGIN } from "./platform-api-url";

const API_URL = DEFAULT_PLATFORM_API_ORIGIN;
type JsonRecord = Record<string, unknown>;
type QueryParams = Record<string, string | number | boolean | undefined>;
type CheckoutItem = {
  product_id: string | number;
  variant_id?: string | number;
  quantity: number;
};
type CheckoutPayload = {
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  shipping_address: JsonRecord;
  items: CheckoutItem[];
  shipping_rate_id?: string;
  shipping_cost?: number;
  delivery_option_id?: number;
};
type StorePayload = JsonRecord | FormData;
const SELECTED_STORE_KEY = "dasm_selected_store_id";

export const storeSelection = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(SELECTED_STORE_KEY)),
  set: (storeId: string) => {
    if (typeof window !== "undefined") localStorage.setItem(SELECTED_STORE_KEY, storeId);
  },
  clear: () => {
    if (typeof window !== "undefined") localStorage.removeItem(SELECTED_STORE_KEY);
  },
};

const api = axios.create({
  baseURL: `${API_URL}/api/stores`,
  headers: { "Content-Type": "application/json" },
});

const platformApi = axios.create({
  baseURL: `${API_URL}/api`,
});

const localApi = axios.create({
  baseURL: "/",
});

// أضف التوكن تلقائياً لكل طلب
const attachToken = (config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("stores_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const selectedStoreId = storeSelection.get();
    if (selectedStoreId) config.headers["X-DASM-Store-Id"] = selectedStoreId;
  }
  return config;
};
api.interceptors.request.use(attachToken);
platformApi.interceptors.request.use(attachToken);
localApi.interceptors.request.use(attachToken);

// لو 401 → وجّه لتسجيل الدخول
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      clearStoresToken();
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

/* ── Public APIs ── */
export const publicApi = {
  getStore: (slug: string, params?: QueryParams) => api.get(`/public/${slug}`, { params }),
  getProducts: (slug: string, params?: QueryParams) =>
    api.get(`/public/${slug}/products`, { params }),
  getProduct: (slug: string, id: number, params?: QueryParams) =>
    api.get(`/public/${slug}/products/${id}`, { params }),
  getCategories: (slug: string) => api.get(`/public/${slug}/categories`),
  explore: (params?: QueryParams) =>
    api.get("/public/explore", { params }),
  getShippingRates: (slug: string, data: { destination_city: string; weight_kg?: number }) =>
    api.post(`/public/${slug}/shipping-rates`, data),
};

/* ── Checkout ── */
export const checkoutApi = {
  createOrder: (slug: string, data: CheckoutPayload) => api.post(`/checkout/${slug}`, data),
  trackOrder: (slug: string, orderNumber: string) =>
    api.get(`/track/${slug}/${orderNumber}`),
  retryPayment: (slug: string, orderNumber: string) =>
    api.post(`/retry-payment/${slug}/${orderNumber}`),
};

/* ── Seller APIs ── */
export const sellerApi = {
  getMyStores: () => api.get("/my-stores"),
  // المتجر
  getMyStore: () => api.get("/my-store"),
  createStore: (data: StorePayload) => api.post("/my-store", data),
  updateStore: (data: StorePayload) => api.put("/my-store", data),
  activateStore: () => api.post("/my-store/activate"),
  getStats: () => api.get("/my-store/stats"),

  // المنتجات
  getProducts: (params?: QueryParams) => api.get("/my-store/products", { params }),
  createProduct: (data: StorePayload) => api.post("/my-store/products", data),
  getProduct: (id: number) => api.get(`/my-store/products/${id}`),
  updateProduct: (id: number, data: StorePayload) => api.put(`/my-store/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/my-store/products/${id}`),

  // التابات
  getTabs: () => api.get("/my-store/tabs"),
  createTab: (data: JsonRecord) => api.post("/my-store/tabs", data),
  updateTab: (id: number, data: JsonRecord) => api.put(`/my-store/tabs/${id}`, data),
  deleteTab: (id: number) => api.delete(`/my-store/tabs/${id}`),

  // التصنيفات
  getCategories: () => api.get("/my-store/categories"),
  createCategory: (data: JsonRecord) => api.post("/my-store/categories", data),
  updateCategory: (id: number, data: JsonRecord) => api.put(`/my-store/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/my-store/categories/${id}`),

  // الطلبات
  getOrders: (params?: QueryParams) => api.get("/my-store/orders", { params }),
  getOrder: (id: number) => api.get(`/my-store/orders/${id}`),
  updateOrderStatus: (id: number, data: JsonRecord) => api.put(`/my-store/orders/${id}/status`, data),

  // بوابة الدفع (legacy)
  getPaymentConfig: () => api.get("/my-store/payment-config"),
  updatePaymentConfig: (data: JsonRecord) => api.put("/my-store/payment-config", data),

  // العنوان الوطني (على مستوى المستخدم — ثابت في كل المنصات)
  getNationalAddress: () => platformApi.get("/user/national-address"),
  submitNationalAddress: (formData: FormData) =>
    platformApi.post("/user/national-address", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getVerificationStatus: () => platformApi.get("/user/verification-status"),

  // الشحن
  getShippingConfigs: () => api.get("/my-store/shipping-config"),
  createShippingConfig: (data: JsonRecord) => api.post("/my-store/shipping-config", data),
  updateShippingConfig: (id: number, data: JsonRecord) => api.put(`/my-store/shipping-config/${id}`, data),
  deleteShippingConfig: (id: number) => api.delete(`/my-store/shipping-config/${id}`),
};

/* ── Upload (goes to platform API, not stores API) ── */
type UploadResponse = {
  status: string;
  secure_url: string;
  context?: string;
  source?: string;
};

function buildUploadFormData(file: File, context: string): FormData {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("context", context);
  return formData;
}

function uploadViaPlatform(file: File, context: string) {
  return platformApi.post<UploadResponse>("/upload/media", buildUploadFormData(file, context), {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

function uploadViaLocalFallback(file: File, context: string) {
  return localApi.post<UploadResponse>("/api/upload/local-media", buildUploadFormData(file, context), {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export const uploadApi = {
  uploadMedia: uploadViaPlatform,
  uploadMediaLocal: uploadViaLocalFallback,
  async uploadStoreProductImage(file: File) {
    try {
      return await uploadViaPlatform(file, "store_product_image");
    } catch {
      return uploadViaLocalFallback(file, "store_product_image");
    }
  },
};

export { platformApi };
export default api;
