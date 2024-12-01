<script setup>
import WaitingApproval from "./components/Globals/WaitingApproval.vue";
import { useAuthStore } from "./store/auth";

const authStore = useAuthStore();
</script>

<template>
  <div :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <WaitingApproval v-if="authStore.status === 'waiting'" />

    <RouterView />
  </div>
</template>
