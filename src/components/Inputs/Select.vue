<script setup>
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";
import { ref, watch } from "vue";

const props = defineProps({
  label: {
    type: String,
    required: false,
    default: null,
  },
  id: {
    type: String,
    required: true,
    default: null,
  },
  placeholder: {
    type: String,
    default: null,
    required: true,
  },
  options: {
    type: Object,
    required: true,
    default: null,
  },
  defaultValue: {
    type: String,
    required: false,
    default: null,
  },
  disabled: {
    tye: Boolean,
    required: false,
    default: false,
  },
  clearable: {
    tye: Boolean,
    required: false,
    default: false,
  },
});

const emits = defineEmits(["select", "clear"]);

const selected = ref("");

watch(selected, (value) => {
  emits("select", value);
});

watch(
  () => props,
  (value) => {
    if (value.defaultValue) {
      selected.value = value.options.find(
        (option) => option.id === value.defaultValue,
      )?.name;
    }
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<template>
  <div class="h-[45px]">
    <Listbox
      v-slot="{ open }"
      v-model="selected"
      :disabled="disabled || !options.length"
    >
      <div class="relative h-full flex-grow" :class="disabled && 'opacity-60'">
        <ListboxButton
          class="relative flex size-full items-center justify-between gap-2 overflow-hidden rounded-lg border border-light-border bg-white px-3 font-medium text-light-inputText dark:border-dark-border dark:bg-transparent dark:text-[#c1bfbf]"
          :class="
            disabled || !options.length
              ? 'cursor-not-allowed'
              : 'cursor-pointer'
          "
        >
          <span v-if="label">{{ label }}:</span>

          <div class="inline-flex flex-grow items-center justify-between">
            <span
              class="block w-[85%] truncate text-start"
              :title="selected ? selected : placeholder"
              >{{ selected ? selected : placeholder }}</span
            >

            <div class="absolute inset-y-0 end-[20px] flex items-center gap-3">
              <button
                v-if="clearable && selected"
                type="button"
                class="text-light-text duration-300 hover:text-primary dark:text-dark-text dark:hover:text-dark-primary"
                @click.stop="
                  selected = null;
                  emits('clear');
                "
              >
                <i class="fa-solid fa-close" />
              </button>

              <span>
                <i
                  :class="`fa-solid fa-angle-${open ? 'up' : 'down'} text-sm`"
                />
              </span>
            </div>
          </div>
        </ListboxButton>

        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="absolute z-[1000] mt-1 max-h-60 w-fit min-w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
          >
            <ListboxOption
              as="template"
              v-slot="{ active, selected }"
              v-for="option in options"
              :key="option.id"
              :value="option.name"
            >
              <li
                class="cursor border-border relative w-full cursor-pointer select-none border-b px-4 py-2 duration-300 last-of-type:border-none"
                :class="{
                  'bg-teal-600 text-primary dark:text-dark-primary': active,
                  'text-light-text dark:text-dark-text': !active,
                }"
                :title="option.name"
              >
                <span class="block truncate font-medium">{{
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
  </div>
</template>
