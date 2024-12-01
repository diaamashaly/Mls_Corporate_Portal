<script setup>
import { ref, watch } from "vue";
import SidebarMenu from "./SidebarMenu.vue";
import { useToast } from "vue-toastification";
import { useGlobalStore } from "@/store/global";
import { storeToRefs } from "pinia";
import Background from "../Globals/Background.vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useDark } from "@vueuse/core";
import axios from "axios";

const toast = useToast();

const router = useRouter();

const i18n = useI18n();

const isDark = useDark();

const globalStore = useGlobalStore();
const { smallSideNav, showSideNav } = storeToRefs(globalStore);

watch(showSideNav, (value) => {
  if (value) {
    document.body.classList.add("overflow-hidden");
  } else {
    document.body.classList.remove("overflow-hidden");
  }
});

/* Start of the function that handle logout */
const logoutModal = ref(false);

const logoutLoading = ref(false);
async function handleLogout() {
  logoutLoading.value = true;

  await axios
    .post("dashboard/logout")
    .then(() => {
      localStorage.removeItem("corporate_portal_token");

      location.reload();
    })
    .catch((e) => {
      console.error(e);

      logoutLoading.value = false;

      toast.error(e.response.data.message);
    });
}
/* End of the function that handle logout */
</script>

<template>
  <!-- Confirm logout modal -->
  <Modal
    v-if="logoutModal"
    :title="$t('BUTTONS.logout')"
    :text="$t('TEXTS.confirmLogout')"
    :btnText="$t('BUTTONS.logout')"
    :loading="logoutLoading"
    @handleClick="handleLogout"
    @close="logoutModal = false"
  />
  <!-- End of the confirm logout modal -->

  <Background v-if="showSideNav" @close="showSideNav = !showSideNav" />

  <div
    class="fixed top-[14px] z-[1010] flex h-[calc(100vh-28px)] flex-col rounded-[16px] border-2 border-white bg-white p-3 duration-300 dark:border-black dark:bg-black lg:bg-light-mainBg"
    :class="[
      smallSideNav ? 'w-full lg:w-[100px]' : 'w-[93%] lg:w-[350px]',
      showSideNav ? 'start-[14px]' : '-start-full lg:start-[14px]',
    ]"
  >
    <div class="mb-7 flex items-center justify-center">
      <RouterLink to="/" class="w-full p-2">
        <template v-if="smallSideNav">
          <img
            v-if="isDark"
            src="/logo/small-dark.svg"
            class="mx-auto block h-[60px]"
            alt="favicon"
            :draggable="false"
          />

          <img
            v-else
            src="/logo/small.svg"
            class="mx-auto block h-[60px]"
            alt="favicon"
            :draggable="false"
          />
        </template>

        <div
          v-else
          class="flex w-full items-center justify-between lg:justify-center"
        >
          <SvgIcon
            v-if="isDark"
            icon="dark"
            class="block h-[60px] w-[80%] lg:w-fit"
          />
          <!-- <img
            v-if="isDark"
            src="/logo/dark.svg"
            class="block h-[60px] w-[80%] lg:w-fit"
            alt="light-logo"
            :draggable="false"
          /> -->

          <!-- <img
            v-else
            src="/logo/light.svg"
            class="block h-[60px] w-[80%] lg:w-fit"
            alt="light-logo"
            :draggable="false"
          /> -->
          <SvgIcon
            v-else
            icon="light"
            class="block h-[60px] w-[80%] lg:w-fit"
          />

          <button
            type="button"
            class="border-border flex size-[45px] items-center justify-center rounded-full border lg:hidden"
            @click="showSideNav = !showSideNav"
          >
            <SvgIcon icon="close" />
          </button>
        </div>
      </RouterLink>
    </div>

    <SidebarMenu />

    <button
      type="button"
      class="flex w-fit items-center gap-3 p-5 font-medium text-primary dark:text-dark-primary"
      @click="logoutModal = true"
    >
      <SvgIcon icon="logout" />

      <span v-if="!smallSideNav">{{ $t("BUTTONS.logout") }}</span>
    </button>
  </div>
</template>
