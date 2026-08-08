import axios from "axios";

// Sử dụng đường dẫn tương đối "/api" thay vì hardcode "http://localhost:8080/api".
// Trong development: Vite proxy (vite.config.js) sẽ forward request đến backend.
// Trong production: cần cấu hình reverse proxy (nginx/...) chuyển /api → backend.
const base = import.meta.env.VITE_API_URL || "/api";
const axiosInstance = axios.create({
  baseURL: base,
});

// Tự động gắn JWT token vào header Authorization trước mỗi request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
