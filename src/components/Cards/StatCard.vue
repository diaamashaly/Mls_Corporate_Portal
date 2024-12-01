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
  icon: {
    type: String,
    requiredL: true,
    default: null,
  },
});
</script>

<template>
  <RouterLink
    :to="data.path"
    class="flex items-end rounded-xl border border-light-border bg-white p-3 duration-500 hover:-translate-y-3 dark:border-dark-border dark:bg-black lg:p-5"
  >
    <div class="flex-grow">
      <div class="mb-3 flex items-center gap-3">
        <SvgIcon :icon="icon" />

        <h6
          class="max-w-[90%] truncate font-medium text-light-text dark:text-dark-text"
          :title="data.title"
          v-tooltip
        >
          {{ data.title }}
        </h6>
      </div>

      <Skeleton v-if="loading" class="h-[32px] w-[80%]" />
      <h3
        v-else
        class="text-lg font-semibold text-light-title dark:text-dark-title lg:text-2xl"
      >
        {{ data.number.toLocaleString() }}
      </h3>
    </div>

    <SvgIcon icon="arrow" />
  </RouterLink>
</template>
