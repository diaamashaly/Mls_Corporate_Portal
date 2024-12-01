<script setup>
defineProps({
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
});
</script>

<template>
  <VeeField as="div" :name="name" v-slot="{ field, meta }">
    <label
      v-if="label"
      :for="id"
      class="dark:text-dark-text mb-2 block text-sm font-medium text-light-text lg:text-base"
      :class="
        meta.touched && !meta.valid && 'dark:!text-dark-primary !text-primary'
      "
      >{{ label }}</label
    >

    <textarea
      :id="id"
      v-bind="field"
      :placeholder="placeholder"
      class="dark:border-dark-border dark:text-dark-text block max-h-[300px] min-h-[150px] w-full rounded-xl border border-light-border bg-white p-3 text-sm placeholder:text-light-text dark:bg-black lg:text-base"
      :class="[
        meta.touched &&
          !meta.valid &&
          'dark:!border-dark-primary dark:!text-dark-primary dark:placeholder:!text-dark-primary !border-primary !text-primary placeholder:!text-primary',
        type === 'password' && '!pe-[50px]',
      ]"
      :disabled="disabled"
      autocomplete="off"
    />

    <VeeErrorMessage
      v-if="meta.touched && !meta.valid"
      :name="name"
      as="p"
      class="dark:text-dark-primary mt-1 px-3 text-sm text-primary lg:text-base"
    />
  </VeeField>
</template>
