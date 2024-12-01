<script setup>
import { useGlobalStore } from "@/store/global";
import Cookies from "js-cookie";
import { useDark, useToggle } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/store/auth";
import handleImageError from "@/lib/handleImageError";
import Notification from "@/components/Cards/Notification.vue";

/* Start of the function that toggle theme */
const isDark = useDark();
const toggleTheme = useToggle(isDark);
/* End of the function that toggle theme */

const globalStore = useGlobalStore();
const { smallSideNav, showSideNav } = storeToRefs(globalStore);

const authStore = useAuthStore();
const { profile } = storeToRefs(authStore);

const i18n = useI18n();

/* Start of the notification menu */
const notificationMenu = ref(false);
const {
  notifications,
  notificationsLoading,
  notificationsPage,
  notificationPerPage,
  totalNotificationsPages,
} = storeToRefs(authStore);
/* End of the notification menu */

/* Start of the function that change the locale */
const confirmChangeLocale = ref(false);

function changeLang() {
  if (i18n.locale.value === "ar") {
    i18n.locale.value = "en";
  } else {
    i18n.locale.value = "ar";
  }

  Cookies.set("dash_lang", i18n.locale.value);

  location.reload();

  confirmChangeLocale.value = false;
}
/* End of the function that change the locale */

function greet() {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  if (currentHour < 12) {
    return i18n.t("TITLES.goodMorning");
  } else if (currentHour < 18) {
    return i18n.t("TITLES.goodAfternoon");
  } else {
    return i18n.t("TITLES.goodEvening");
  }
}

/* Profile data */
const profileStorage = ref({});

onMounted(() => {
  if (localStorage.getItem("mls_portal_profile_data")) {
    profileStorage.value = JSON.parse(
      localStorage.getItem("mls_portal_profile_data"),
    );
  }

  greet();
});
</script>

<template>
  <!-- Confirm change language modal -->
  <Modal
    v-if="confirmChangeLocale"
    :title="$t('TITLES.changeLanguage')"
    :text="$t('TEXTS.confirmChangeLanguage')"
    :btnText="$t('BUTTONS.change')"
    :loading="false"
    @handleClick="changeLang"
    @close="confirmChangeLocale = false"
  />
  <!-- End of the change language modal confirmation -->

  <!-- Notifications Modal -->
  <Transition name="fade">
    <Background v-if="notificationMenu" />
  </Transition>

  <Teleport to="body">
    <Transition name="translate">
      <FormModal
        v-if="notificationMenu"
        :title="$t('TITLES.notifications')"
        base
        @close="notificationMenu = false"
      >
        <div
          v-if="notificationsLoading || notifications.length"
          class="flex h-full flex-col items-start justify-between"
        >
          <div
            class="flex size-full flex-grow flex-col items-start justify-between"
          >
            <div class="w-full flex-grow overflow-auto pe-2 lg:pe-3">
              <template v-if="notificationsLoading">
                <Notification v-for="i in 5" :key="i" :data="{}" loading />
              </template>

              <Notification
                v-else
                v-for="notification in notifications"
                :key="notification.id"
                :data="notification"
                :loading="notificationsLoading"
              />
            </div>

            <div v-if="totalNotificationsPages > 1" class="mt-5 w-full">
              <Pagination
                v-model="notificationsPage"
                :pages="totalNotificationsPages"
                :rageSize="notificationPerPage"
                activeColor=""
              />
            </div>
          </div>
        </div>

        <div v-else class="flex h-full flex-col items-center justify-center">
          <p class="text-light-text dark:text-dark-text">
            {{ $t("TEXTS.noNotifications") }}
          </p>
        </div>
      </FormModal>
    </Transition>
  </Teleport>
  <!-- Eof the notifications modal -->

  <nav
    class="w-full rounded-[16px] border-2 border-white bg-light-mainBg p-5 dark:border-black dark:bg-dark-mainBg"
  >
    <div
      class="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center lg:gap-3"
    >
      <div class="flex items-center gap-5">
        <button
          type="button"
          class="hidden lg:block"
          @click="smallSideNav = !smallSideNav"
        >
          <i
            class="fa-solid fa-bars text-lg text-primary dark:text-dark-primary"
          />
        </button>

        <button
          type="button"
          class="block lg:hidden"
          @click="showSideNav = !showSideNav"
        >
          <i
            class="fa-solid fa-bars text-lg text-primary dark:text-dark-primary"
          />
        </button>

        <h3 class="font-medium text-primary dark:text-dark-primary">
          {{ greet() }} {{ profileStorage.name }}
        </h3>
      </div>

      <div class="flex flex-col items-start gap-3 lg:flex-row lg:items-center">
        <div
          v-if="profile"
          class="flex items-center gap-2 rounded-full border border-light-border px-3 py-2 font-medium dark:border-dark-border"
        >
          <span class="dark:text-white">{{ $t("TITLES.totalTokens") }}:</span>

          <span class="text-primary">{{ profile.tokens_count }}</span>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex size-[50px] items-center justify-center rounded-full border-2 border-light-border dark:border-dark-border"
            @click="toggleTheme()"
          >
            <SvgIcon icon="moon" />
          </button>

          <button
            type="button"
            class="flex size-[50px] items-center justify-center rounded-full border-2 border-light-border disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border"
            :disabled="notificationsLoading"
            @click="notificationMenu = true"
          >
            <SvgIcon icon="notification" />
          </button>

          <RouterLink v-if="profile" to="/profile">
            <img
              :src="profile.logo"
              class="size-[50px] rounded-full object-cover"
              alt="profile-image"
              :draggable="false"
              @error="handleImageError"
            />
          </RouterLink>

          <button
            type="button"
            class="font-medium dark:text-white"
            :class="i18n.locale.value === 'ar' ? 'font-poppins' : 'font-cairo'"
            @click="confirmChangeLocale = true"
          >
            {{ i18n.locale.value === "ar" ? "En" : "عربي" }}
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
