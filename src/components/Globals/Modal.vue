<script setup>
import { onMounted, onUnmounted } from "vue";

defineProps({
  title: {
    type: String,
    required: true,
    default: "",
  },
  text: {
    type: String,
    required: true,
    default: "",
  },
  btnText: {
    type: String,
    required: true,
    default: "",
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
});

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
    @click="
      () => {
        if (!loading) {
          $emit('close');
        }
      }
    "
  >
    <div
      @click.stop
      class="w-full rounded-2xl bg-white dark:bg-black lg:w-[500px]"
    >
      <div
        class="border-border flex items-center gap-3 border-b p-4 text-primary dark:text-white"
      >
        <i class="fa-solid fa-info-circle text-2xl" />

        <h5 class="text-lg font-semibold lg:text-xl">
          {{ title }}
        </h5>
      </div>

      <div class="border-border border-b p-4">
        <p class="font-semibold dark:text-white lg:text-lg">
          {{ text }}
        </p>
      </div>

      <div class="flex items-center justify-end gap-3 p-4">
        <Button
          class="h-[50px] min-w-[120px] rounded-[10px] px-5 font-medium lg:text-lg"
          :text="btnText"
          :loading="loading"
          @btnClick="$emit('handleClick')"
        />

        <Button
          class="h-[50px] min-w-[120px] rounded-[10px] !bg-light-text px-5 font-medium text-white dark:!bg-dark-text lg:text-lg"
          :disabled="loading"
          :text="$t('BUTTONS.cancel')"
          @btnClick="$emit('close')"
        />
      </div>
    </div>
  </div>
</template>
