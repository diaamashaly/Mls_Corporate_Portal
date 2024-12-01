<script setup>
import { Switch } from "@headlessui/vue";
import { ref, watch } from "vue";

const props = defineProps({
  status: {
    type: Boolean,
    required: false,
    default: false,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  id: {
    type: String,
    required: false,
    default: null,
  },
});

const enabled = ref(props.status);
watch(
  props,
  (value) => {
    enabled.value = value.status;
  },
  {
    deep: true,
  },
);
</script>

<template>
  <Switch
    :id="id"
    :disabled="disabled"
    class="inline-flex h-[27px] w-[45px] shrink-0 items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
    :class="[
      enabled
        ? 'dark:bg-dark-green bg-green'
        : 'dark:bg-dark-primary bg-primary',
      disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    ]"
    @update:model-value="$emit('change')"
  >
    <span
      aria-hidden="true"
      :class="
        enabled
          ? '-translate-x-2.5 bg-white dark:bg-black ltr:translate-x-2.5'
          : 'translate-x-2.5 bg-[#FFE2E2] ltr:-translate-x-2.5'
      "
      class="pointer-events-none relative inline-block size-[19px] transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out"
    />
  </Switch>
</template>
