<script setup>
defineProps({
  text: {
    type: String,
    required: true,
    default: null,
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  type: {
    type: String,
    required: false,
    default: "button",
  },
});
</script>

<template>
  <button
    :type="type"
    class="bg flex h-[50px] min-w-[150px] items-center justify-center rounded-[15px] bg-primary text-center text-white duration-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-dark-primary"
    :disabled="disabled || loading"
    @click="$emit('btnClick')"
  >
    <span>
      {{ text }}
    </span>
  </button>
</template>
