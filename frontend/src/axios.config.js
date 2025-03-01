import axios from "axios";

const axiosConfig = () => {
  axios.defaults.baseURL = process.env.REACT_APP_API_URL;
  axios.interceptors.request.use(
    (config) => {
      // config.headers["Content-Type"] = "application/json";
      config.headers["Cache-Control"] = "no-cache";
      config.headers["Pragma"] = "no-cache";
      config.headers["Expires"] = "0";
      config.withCredentials = true;
      return config;
    },
    (error) => Promise.reject(error)
  );
};

export default axiosConfig;
