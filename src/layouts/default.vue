<script setup>
import Navbar from "@/components/Navigation/Navbar.vue";
import Sidebar from "@/components/Navigation/Sidebar.vue";
import { useAuthStore } from "@/store/auth";
import { useGlobalStore } from "@/store/global";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";

const globalStore = useGlobalStore();
const { smallSideNav } = storeToRefs(globalStore);

const authStore = useAuthStore();
const { profile } = storeToRefs(authStore);

onMounted(() => {
  if (profile.value) {
    authStore.getAllNotifications();
  }
});
</script>

<template>
  <div class="p-3.5">
    <Sidebar />

    <div
      class="duration-200"
      :class="smallSideNav ? 'lg:ps-[115px]' : 'lg:ps-[375px]'"
    >
      <Navbar />

      <div class="pt-5">
        <RouterView />
      </div>
    </div>
  </div>
</template>
