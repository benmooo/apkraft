import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Create a custom axios instance
const client: AxiosInstance = axios.create({
  baseURL: "http://localhost:5150/api",
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
    // Handle errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error data:", error.response.data);
      console.error("Error status:", error.response.status);

      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized, redirect to login
          console.error("Unauthorized, please log in again");
          // Add your logout or redirect logic here
          break;
        case 403:
          // Forbidden
          console.error("You do not have permission to access this resource");
          break;
        case 500:
          console.error("Server error, please try again later");
          break;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  },
);

export default client;
