import axios from "axios";
import { getLocalStorage } from "./helper";

let url = `${import.meta.env.VITE_SERVER_URL}/api`;

const axiosInstance = axios.create({
  baseURL: url,
  timeout: 15000,
  withCredentials: true,
});

// Updated axios interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = getLocalStorage("token");
  
  if (token) {
    // Clean the token by removing any quotes or escape characters
    const cleanToken = token.replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  config.headers["X-User-Timezone"] = timezone;

  return config;
}, (error) => {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
