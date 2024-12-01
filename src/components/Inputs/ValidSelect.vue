<script setup>
import { ref, watch } from "vue";
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";
import { useField } from "vee-validate";

const emits = defineEmits(["select", "fieldReset"]);

const props = defineProps({
  options: {
    type: Object,
    required: true,
    default: null,
  },
  label: {
    type: String,
    required: false,
    default: "",
  },
  placeholder: {
    type: String,
    required: true,
    default: "",
  },
  name: {
    type: String,
    required: true,
    default: "",
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
  reset: {
    type: Boolean,
    required: false,
    default: false,
  },
  defaultValue: {
    required: false,
    default: null,
  },
  clear: {
    type: Boolean,
    required: false,
    default: false,
  },
  dark: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const fieldName = useField(props.name);

const selected = ref(null);

const options = ref([]);
watch(
  props,
  (value) => {
    if (value) {
      if (value.options) {
        options.value = value.options;
      }

      if (value.reset) {
        fieldName.resetField();

        selected.value = null;

        emits("fieldReset");
      }

      if (value.defaultValue && !selected.value) {
        selected.value = value.options.find(
          (option) => option.id === value.defaultValue,
        )?.name;
      }
    }
  },
  {
    immediate: true,
    deep: true,
  },
);

watch(selected, (value) => {
  if (value) {
    const option = props.options.find((item) => item.name === value);

    if (option) {
      fieldName.setValue(option.id);

      emits("select", option.id);
    }
  }
});
</script>

<template>
  <VeeField
    as="div"
    :ref="`${props.name}Ref`"
    :name="name"
    v-slot="{ meta, field }"
  >
    <label
      v-if="label"
      class="mb-2 block text-sm lg:text-base"
      :class="[
        meta.touched && !meta.valid
          ? '!text-primary dark:!text-dark-primary'
          : 'text-light-text dark:text-dark-text',
      ]"
      >{{ label }}</label
    >

    <Listbox
      v-slot="{ open }"
      v-model="selected"
      :disabled="loading || disabled || !options.length"
    >
      <div class="relative w-full">
        <ListboxButton
          class="block h-[48px] w-full rounded-xl border px-3 placeholder:text-light-text dark:bg-transparent dark:text-dark-text"
          :class="[
            loading || disabled || !options.length
              ? '!cursor-not-allowed'
              : 'cursor-pointer',
            meta.touched && !meta.valid
              ? 'border-primary dark:border-dark-primary'
              : 'border-light-border dark:border-dark-border',
            disabled && 'cursor-not-allowed opacity-60',
          ]"
        >
          <span
            class="block truncate !pe-[45px] text-start text-sm lg:text-base"
            :class="
              meta.touched && !meta.valid
                ? 'text-primary dark:text-dark-primary'
                : selected
                  ? 'text-black dark:text-dark-text'
                  : 'text-light-text dark:text-dark-text'
            "
            :title="selected ? selected : ''"
            >{{ selected ? selected : placeholder }}</span
          >

          <span class="absolute inset-y-0 end-[10px] flex items-center">
            <i
              :class="[
                `text-sm ${
                  meta.touched && !meta.valid
                    ? 'text-primary dark:text-dark-primary'
                    : 'text-light-text dark:text-dark-text'
                }`,
                `fa-solid fa-angle-${open ? 'up' : 'down'}`,
              ]"
            />
          </span>

          <button
            v-if="clear && selected"
            type="button"
            class="text-error absolute end-[35px]"
            @click.stop="
              fieldName.resetField();
              selected = null;
            "
          >
            <i class="fa-solid fa-close" />
          </button>
        </ListboxButton>

        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="absolute z-[1010] mt-1 max-h-60 w-full overflow-auto rounded-md border border-light-border bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-dark-border"
            v-bind="field"
          >
            <ListboxOption
              as="template"
              v-slot="{ active, selected }"
              v-for="option in options"
              :key="option.id"
              :value="option.name"
            >
              <li
                class="cursor border-border relative cursor-pointer select-none border-b px-4 py-2 duration-300 last-of-type:border-none"
                :class="{
                  'text-light-text dark:text-dark-text': !active,
                }"
                :title="option.name"
              >
                <span class="block truncate text-sm font-medium lg:text-base">{{
                  option.name
                }}</span>

                <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center"
                  :class="{
                    'text-primary dark:text-dark-primary': active,
                    'text-light-text dark:text-dark-text': !active,
                  }"
                />
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>

    <VeeErrorMessage
      v-if="!meta.valid && meta.touched"
      :name="name"
      as="div"
      class="mt-1 px-5 !text-sm text-primary dark:text-dark-primary lg:!text-base"
    />
  </VeeField>
</template>
