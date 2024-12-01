<script setup>
import { onMounted, onUnmounted } from "vue";

defineProps({
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emits = defineEmits(["close"]);

onMounted(() => {
  document.body.classList.add("overflow-hidden");
});

onUnmounted(() => {
  document.body.classList.remove("overflow-hidden");
});
</script>

<template>
  <div
    class="fixed end-0 top-0 z-[1010] flex size-full justify-end bg-[rgba(0,0,0,.4)] px-2 py-3 shadow-lg dark:bg-[#FFFFFF66] lg:px-3 lg:py-10"
    @click="
      () => {
        if (!loading) {
          emits('close');
        }
      }
    "
  />
</template>
