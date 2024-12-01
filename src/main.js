import { createApp } from "vue";
import App from "./App.vue";

/* Start of the plugins */
import { registerVeeValidate } from "@/plugins/vee-validate";
import { registerComponents } from "@/plugins/components";
import i18n from "./plugins/i18n";
import { registerAxios } from "./plugins/axios";
/* End of the plugins */

/* Toastify */
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const options = {
  timeout: 5000,
  theme: "colored",
  position: "top-center",
  pauseOnFocusLoss: false,
  draggable: false,
};
/* End of toastify */

/* Tooltip */
import { tooltip } from "@ionited/tooltip-vue";
/* End of the tooltip */

/* Pagination */
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
/* End of the pagination */

/* Date picker */
import "@vuepic/vue-datepicker/dist/main.css";
/* End of the date picker */

/* Start of the pinia store */
import { createPinia } from "pinia";
const pinia = createPinia();
/* End of the pinia store */

/* Styles */
import "@/css/main.scss";
/* End of the styles */

/* Swiper */
import Swiper from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
/* End of the swiper */

/* Quill editor */
import Quill from "quill";
import { quillEditor } from "vue3-quill";
/* End of the quill editor */

/* Apexchart */
import VueApexCharts from "vue3-apexcharts";
/* End of the apexchart */

/* Pagination */
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
/* End of the pagination */

import equal from "fast-deep-equal";

import router from "./router";

const app = createApp(App);

registerComponents(app);
registerVeeValidate(app);
registerAxios(app);

app
  .directive("tooltip", tooltip)
  .use(Toast, options)
  .use(i18n)
  .use(quillEditor)
  .use(pinia)
  .use(VueApexCharts)
  .use(router)
  .mount("#app");
