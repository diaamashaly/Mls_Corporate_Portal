<script setup>
import { onMounted, onUnmounted } from "vue";

onUnmounted(() => {
  document.body.classList.remove("overflow-hidden");
});

onMounted(() => {
  document.body.classList.add("overflow-hidden");
});
</script>

<template>
  <div
    class="fixed start-0 top-0 z-[1020] flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.25)] p-5 dark:bg-[#FFFFFF66] lg:p-0"
  >
    <div
      class="flex w-full flex-col items-center justify-center gap-5 rounded-2xl bg-white p-5 lg:w-[500px]"
    >
      <img
        src="/approve.png"
        class="size-[145px] rounded-full"
        alt="approve-image"
        :draggable="false"
      />

      <div class="flex flex-col items-center justify-center gap-2">
        <h5 class="font-semibold lg:text-xl">
          {{ $t("TITLES.waitingForApproval") }}
        </h5>

        <h6 class="font-medium">{{ $t("TEXTS.reviewingYourAccount") }}</h6>
      </div>
    </div>
  </div>
</template>
