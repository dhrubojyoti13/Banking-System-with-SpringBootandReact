

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("banking_token");

  // Do not send an old token with login or registration.
  const isAuthRequest =
    config.url?.includes("/api/auth/login") ||
    config.url?.includes("/api/auth/register");

  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

export default api;



// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8081",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// api.interceptors.request.use((config) => {
//   const token = sessionStorage.getItem("banking_token");

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export default api;
// // import axios from "axios";

// // const api = axios.create({
// //   baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081",
// //   headers: { "Content-Type": "application/json" }
// // });

// // // Attach the current access token to protected API requests.
// // api.interceptors.request.use((config) => {
// //   const token = sessionStorage.getItem("banking_token");
// //   if (token) config.headers.Authorization = `Bearer ${token}`;
// //   return config;
// // });

// // export default api;