import axios from "axios";
import VueAxios from "vue-axios";
import i18n from "./i18n";

const TOKEN = localStorage.getItem("corporate_portal_token");
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

if (TOKEN) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${TOKEN}`;
  axios.defaults.headers.common["Accept"] = "application/json";
}
axios.defaults.headers.common["Accept-language"] = i18n.global.locale.value;

export async function registerAxios(app) {
  app.use(VueAxios, axios);
}

function handleAuthorizedError(error) {
  if (error.response.status == "401") {
    console.log("Unauthorized");

    localStorage.removeItem("corporate_portal_token");

    location.pathname = "/login";
  } else if (
    error.response.status == "403" &&
    location.pathname != "/dashboard"
  ) {
    location.pathname = "/permission-denied";
  }
}

axios.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    handleAuthorizedError(error);

    return Promise.reject(error);
  },
);

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    handleAuthorizedError(error);

    return Promise.reject(error);
  },
);
