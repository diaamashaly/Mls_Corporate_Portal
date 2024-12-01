<script setup>
import { debounce } from "lodash";

defineProps({
  placeholder: {
    type: String,
    required: true,
    default: null,
  },
  modelValue: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emits = defineEmits(["update:modelValue"]);

function handleSearch(e) {
  emits("update:modelValue", e.target.value);
}

const debouncedSearch = debounce(handleSearch, 300);
</script>

<template>
  <div
    class="border-border flex h-[45px] items-center gap-3 rounded-[40px] border border-light-border bg-light-inputBg px-3.5 dark:border-dark-border dark:bg-dark-inputBg"
  >
    <label :for="placeholder">
      <SvgIcon icon="search" />
    </label>

    <input
      type="text"
      :id="placeholder"
      class="block flex-grow bg-transparent text-light-inputText outline-none placeholder:text-light-text disabled:cursor-not-allowed disabled:opacity-60 dark:text-dark-text"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      @input="debouncedSearch"
    />
  </div>
</template>
