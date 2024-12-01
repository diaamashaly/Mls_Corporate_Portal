<script setup>
import { ref } from "vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
    default: null,
  },
  label: {
    type: String,
    required: false,
    default: null,
  },
  placeholder: {
    type: String,
    required: true,
    default: null,
  },
  name: {
    type: String,
    required: true,
    default: null,
  },
  type: {
    type: String,
    required: false,
    default: "text",
  },
  isNumber: {
    type: Boolean,
    required: false,
    default: false,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  modelValue: {
    required: false,
  },
});

const emits = defineEmits(["update:modelValue"]);

const inputType = ref(props.type || "text");

function checkIsNumber(e) {
  if (props.isNumber) {
    if (
      (e.keyCode >= 96 && e.keyCode <= 105) ||
      (e.keyCode >= 48 && e.keyCode <= 57) ||
      e.keyCode === 8 ||
      e.keyCode === 9 ||
      (e.ctrlKey && e.keyCode === 67) ||
      (e.ctrlKey && e.keyCode === 65) ||
      (e.ctrlKey && e.keyCode === 86) ||
      (e.ctrlKey && e.keyCode === 88)
    ) {
      return;
    } else {
      e.preventDefault();
    }
  }
}
</script>

<template>
  <VeeField as="div" :name="name" v-slot="{ field, meta }">
    <label
      v-if="label"
      :for="id"
      class="mb-2 block text-sm text-light-text dark:text-dark-text lg:text-base lg:font-medium"
      :class="
        meta.touched && !meta.valid && '!dark:text-dark-primary !text-primary'
      "
      >{{ label }}</label
    >

    <div class="relative flex items-center justify-between">
      <input
        :id="id"
        :type="inputType"
        v-bind="field"
        @input="emits('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        class="block h-[50px] w-full rounded-xl border border-light-border bg-transparent px-3 text-sm placeholder:text-light-text dark:border-dark-border dark:text-dark-text lg:text-base"
        :class="[
          meta.touched &&
            !meta.valid &&
            '!border-primary !text-primary placeholder:!text-primary dark:!border-dark-primary dark:!text-dark-primary dark:placeholder:!text-dark-primary',
          type === 'password' && '!pe-[50px]',
          disabled && 'cursor-not-allowed',
        ]"
        :disabled="disabled"
        @keydown="checkIsNumber"
        autocomplete="off"
      />

      <button
        v-if="type === 'password'"
        type="button"
        class="absolute end-[20px]"
        @click="inputType = inputType === 'text' ? 'password' : 'text'"
      >
        <i
          :class="[
            `fa-solid ${inputType === 'password' ? 'fa-eye' : 'fa-eye-slash'}`,
            meta.touched && !meta.valid
              ? '!text-primary dark:!text-dark-primary'
              : 'text-light-text dark:text-dark-text',
          ]"
        />
      </button>
    </div>

    <VeeErrorMessage
      v-if="meta.touched && !meta.valid"
      :name="name"
      as="p"
      class="mt-1 px-3 text-sm text-primary dark:text-dark-primary lg:text-base"
    />
  </VeeField>
</template>
