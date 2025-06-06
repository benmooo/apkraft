import axios, { AxiosInstance, AxiosResponse } from "axios";

// check if env is production
export const baseUrl =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5150/api";

// Create a custom axios instance
const client: AxiosInstance = axios.create({
  baseURL: baseUrl,
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    // You can modify request config here
    // For example, add auth token
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
client.interceptors.request.use(
  async (config) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for 1 second
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
client.interceptors.response.use(
  (response: AxiosResponse) => {
    // You can modify response data here
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default client;
