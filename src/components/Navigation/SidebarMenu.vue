<script setup>
import { useGlobalStore } from "@/store/global";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import hasPermission from "@/lib/hasPermission";

const i18n = useI18n();

const links = ref([
  {
    path: "/dashboard",
    icon: "dashboard",
    title: i18n.t("NAV.home"),
    permission: "all",
  },
  {
    path: "/branches",
    icon: "branches",
    title: i18n.t("NAV.branches"),
    permission: "all",
  },
  {
    path: "/agents",
    icon: "agents",
    title: i18n.t("NAV.agents"),
    permission: "all",
  },
  {
    path: "/tokens",
    icon: "tokens",
    title: i18n.t("NAV.tokens"),
    permission: "all",
  },
  {
    path: "/wallet",
    icon: "wallet",
    title: i18n.t("NAV.wallet"),
    permission: "all",
  },
  {
    path: "/invoices",
    icon: "invoices",
    title: i18n.t("NAV.invoices"),
    permission: "all",
  },
  {
    path: "/settings",
    icon: "settings",
    title: i18n.t("NAV.settings"),
    permission: "all",
  },
]);

const globalStore = useGlobalStore();
const { smallSideNav, showSideNav } = storeToRefs(globalStore);

/* Start of the function that close the sidebar while navigation in small screens */
function handleClick() {
  if (window.innerWidth < 992) {
    showSideNav.value = false;
  }
}
/* End of the function that close the sidebar while navigation in small screens */
</script>

<template>
  <ul class="mb-3.5 flex-grow overflow-auto p-2">
    <template v-for="(link, i) in links" :key="i">
      <li
        v-if="link.permission === 'all' || hasPermission(link.permission)"
        class="mb-3.5 last-of-type:mb-0"
      >
        <RouterLink
          :to="link.path"
          class="group flex items-center gap-3 border-2 p-3 duration-300 hover:border-secondary hover:bg-light-bodyBg hover:dark:border-primary dark:hover:bg-dark-bodyBg"
          :class="[
            $route.path === link.path
              ? 'border-secondary bg-light-bodyBg dark:border-primary dark:bg-dark-bodyBg'
              : 'border-transparent bg-transparent',
            smallSideNav ? 'justify-center rounded-lg' : 'rounded-lg',
          ]"
          @click="handleClick"
        >
          <SvgIcon
            :icon="link.icon"
            class="size-[24px] duration-300"
            :class="
              $route.path === link.path
                ? 'stroke-primary dark:stroke-dark-primary'
                : 'stroke-light-title'
            "
          />

          <span
            class="block flex-grow truncate font-medium group-hover:text-primary dark:group-hover:text-dark-primary"
            :class="[
              $route.path === link.path
                ? 'text-primary dark:text-dark-primary'
                : 'text-light-title dark:text-dark-title',
              smallSideNav ? 'block lg:hidden' : 'block',
            ]"
            :title="link.title"
            v-tooltip
            >{{ link.title }}</span
          >
        </RouterLink>
      </li>
    </template>
  </ul>
</template>
