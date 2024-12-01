<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
    default: null,
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>

<template>
  <div
    class="mb-5 flex items-center gap-3 rounded-[15px] bg-light-inputBg p-3 last-of-type:mb-0 dark:bg-dark-inputBg lg:p-5"
  >
    <SvgIcon icon="notification-circle" />

    <div class="flex flex-grow flex-col items-start gap-2">
      <Skeleton v-if="loading" class="h-[21px] w-full" />
      <h5 v-else class="text-black dark:text-white lg:font-medium">
        {{ data.title }}
      </h5>

      <div v-if="loading" class="flex w-full flex-col items-start gap-2">
        <Skeleton class="h-[15px] w-full" />

        <Skeleton class="h-[15px] w-1/2" />
      </div>
      <p class="text-light-title dark:text-dark-title">
        {{ data.body }}
      </p>

      <Skeleton v-if="loading" class="h-[18px] w-full md:w-1/2 lg:w-1/4" />
      <span v-else class="text-sm text-light-text dark:text-dark-text">{{
        data.created_at
      }}</span>
    </div>
  </div>
</template>
