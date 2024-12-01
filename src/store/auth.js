import axios from "axios";
import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useAuthStore = defineStore("auth", () => {
  /* Start of the function that get thr profile data */
  const profile = ref(null);

  const status = ref("");

  const profileLoading = ref(false);
  async function getProfileData() {
    profileLoading.value = true;

    await axios
      .get("dashboard/profile")
      .then((res) => {
        if (res.data.data) {
          profile.value = res.data.data;
        } else {
          status.value = "waiting";
        }
      })
      .catch((e) => console.error(e))
      .finally(() => (profileLoading.value = false));
  }
  /* End of the function that get the profile data */

  /* Start of the function that get all notifications */
  const notifications = ref([]);

  const notificationsPage = ref(1);
  watch(notificationsPage, () => {
    getAllNotifications();
  });

  const notificationsPerPage = ref(0);

  const totalNotificationsPages = ref(0);

  const notificationsLoading = ref(false);
  async function getAllNotifications() {
    notificationsLoading.value = true;

    await axios
      .get("dashboard/notifications", {
        params: {
          page: notificationsPage.value,
        },
      })
      .then((res) => {
        notifications.value = res.data.data;

        totalNotificationsPages.value = res.data.meta.links - 2;

        notificationsPerPage.value = res.data.meta.per_page;
      })
      .catch((e) => console.error(e))
      .finally(() => (notificationsLoading.value = false));
  }
  /* End of the function that get all notifications */

  return {
    profile,
    profileLoading,
    getProfileData,
    status,
    notifications,
    notificationsPage,
    notificationsLoading,
    notificationsPerPage,
    totalNotificationsPages,
    getAllNotifications,
  };
});
