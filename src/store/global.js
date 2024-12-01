import { defineStore } from "pinia";
import { ref } from "vue";

export const useGlobalStore = defineStore("global", () => {
  const smallSideNav = ref(false);

  const showSideNav = ref(false);

  return {
    smallSideNav,
    showSideNav,
  };
});
