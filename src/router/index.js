import { useAuthStore } from "@/store/auth";
import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    meta: {
      auth: true,
    },
    redirect: "/dashboard",
    name: "default",
    component: () => import("@/layouts/default.vue"),
    children: [
      {
        path: "/profile",
        name: "profile",
        component: () => import("@/pages/profile/index.vue"),
      },
      {
        path: "/dashboard",
        name: "home",
        component: () => import("@/pages/home/index.vue"),
      },
      {
        path: "/branches",
        name: "branches",
        component: () => import("@/pages/branches/index.vue"),
      },
      {
        path: "/agents",
        name: "agents",
        component: () => import("@/pages/agents/index.vue"),
      },
      {
        path: "/tokens",
        name: "tokens",
        component: () => import("@/pages/tokens/index.vue"),
      },
      {
        path: "/wallet",
        name: "wallet",
        component: () => import("@/pages/wallet/index.vue"),
      },
      {
        path: "/invoices",
        name: "invoices",
        component: () => import("@/pages/invoices/index.vue"),
      },
      {
        path: "/settings",
        name: "settings",
        component: () => import("@/pages/settings/index.vue"),
      },
    ],
  },
  {
    name: "auth",
    component: () => import("@/layouts/auth.vue"),
    meta: {
      guest: true,
    },
    children: [
      {
        path: "/login",
        name: "login",
        component: () => import("@/pages/login/index.vue"),
      },
      {
        path: "/register",
        name: "register",
        component: () => import("@/pages/register/index.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();
  const { profile } = storeToRefs(authStore);

  if (to.meta.auth && !localStorage.getItem("corporate_portal_token")) {
    next("/login");
  } else if (to.meta.guest && localStorage.getItem("corporate_portal_token")) {
    next("/");
  }

  if (
    to.meta.auth &&
    !authStore.profile &&
    localStorage.getItem("corporate_portal_token")
  ) {
    await authStore.getProfileData();
  }

  next();
});

router.afterEach(() => {
  window.scrollTo({
    behavior: "smooth",
    top: 0,
  });
});

export default router;
