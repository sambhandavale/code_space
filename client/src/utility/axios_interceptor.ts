import axios from "axios";
import { getLocalStorage } from "./helper";

let url = `${import.meta.env.VITE_SERVER_URL}/api`;

const axiosInstance = axios.create({
  baseURL: url,
  timeout: 15000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getLocalStorage("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

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
