<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { useField } from "vee-validate";
import { ref, watch } from "vue";

const props = defineProps({
  options: {
    type: Object,
    required: true,
    default: null,
  },
  defaultOptions: {
    type: Object,
    required: false,
    default: null,
  },
  noOptionsText: {
    type: String,
    required: true,
    default: null,
  },
  title: {
    type: String,
    required: true,
    default: null,
  },
  opened: {
    type: Boolean,
    required: false,
    default: false,
  },
  noBorder: {
    type: Boolean,
    required: false,
    default: false,
  },
  iconColor: {
    type: String,
    required: false,
    default: "",
  },
  quantity: {
    type: Boolean,
    required: false,
    default: false,
  },
  name: {
    type: String,
    required: true,
    default: "",
  },
  small: {
    type: Boolean,
    required: false,
    default: false,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
  reset: {
    type: Boolean,
    required: false,
    default: false,
  },
  search: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const allOptions = ref(props.options);

function handleSearchInput(e) {
  if (e.target.value) {
    allOptions.value = allOptions.value.filter((item) =>
      item.name.toLowerCase().includes(e.target.value.toLowerCase()),
    );
  } else {
    allOptions.value = props.options;
  }
}

const emits = defineEmits(["select"]);

const fieldName = useField(props.name);

const selectAll = ref(false);
function handleSelectAll(e) {
  if (e.target.checked) {
    selectedOptions.value = allOptions.value.map((option) => option.id);
  } else {
    selectedOptions.value = [];
  }
}

const selectedOptions = ref(props.defaultOptions || []);
watch(
  selectedOptions,
  (value) => {
    emits("select", value);

    if (value.length) {
      fieldName.setValue(value);

      if (value.length === allOptions.value.length) {
        selectAll.value = true;
      } else {
        selectAll.value = false;
      }
    } else {
      fieldName.resetField();
    }
  },
  {
    deep: true,
  },
);

watch(
  props,
  (value) => {
    if (value.loading) {
      fieldName.resetField();
    }

    if (value.options) {
      allOptions.value = value.options;
    }
  },
  {
    deep: true,
  },
);
</script>

<template>
  <Disclosure as="div" :defaultOpen="search ? true : opened" v-slot="{ open }">
    <DisclosureButton
      class="flex h-[50px] w-full items-center justify-between rounded-xl border border-light-border bg-transparent px-3 text-sm placeholder:text-light-text dark:border-dark-border dark:text-dark-text lg:text-base"
      :class="[
        fieldName.meta.touched &&
          !fieldName.meta.valid &&
          '!border-primary !text-primary placeholder:!text-primary',
        disabled && 'cursor-not-allowed',
      ]"
      :disabled="disabled || loading"
    >
      <div v-if="search" class="flex flex-grow items-center gap-3">
        <input
          type="checkbox"
          id="selectAll"
          class="size-[17px] cursor-pointer"
          v-model="selectAll"
          @change="handleSelectAll"
          @click.stop
        />

        <input
          type="text"
          class="w-full flex-grow bg-transparent text-light-inputText placeholder:text-light-text dark:text-dark-text"
          :placeholder="$t('INPUTS.search')"
          @input="handleSearchInput"
          @click.stop
        />
      </div>

      <slot v-else name="title" class="!text-primary" />

      <i
        class="fa-solid"
        :class="[
          open ? 'fa-angle-up' : 'fa-angle-down',
          !fieldName.meta.valid && fieldName.meta.touched
            ? '!text-primary'
            : 'text-dark-text dark:text-dark-text',
        ]"
      />
    </DisclosureButton>

    <DisclosurePanel class="px-5 pt-3.5">
      <div v-if="loading" class="max-h-[300px] overflow-auto">
        <div
          v-for="i in 10"
          :key="i"
          class="mb-3 flex select-none items-center gap-3 rounded-[15px] border border-light-border px-5 py-3 last-of-type:mb-0 dark:border-dark-border"
        >
          <Skeleton class="h-[20px] w-[20px]" />

          <Skeleton class="h-[21px] flex-grow" />
        </div>
      </div>

      <div v-else-if="allOptions.length" class="max-h-[300px] overflow-auto">
        <label
          v-for="option in allOptions"
          :key="option.id"
          :for="`${title}${option.id}`"
          class="mb-3 flex cursor-pointer select-none items-center gap-3 rounded-[15px] border px-5 py-3 last-of-type:mb-0"
          :class="
            fieldName.meta.touched && !fieldName.meta.valid
              ? 'border-primary'
              : 'border-light-border dark:border-dark-border'
          "
        >
          <input
            type="checkbox"
            :id="`${title}${option.id}`"
            class="size-[17px] cursor-pointer"
            v-model="selectedOptions"
            :value="option.id"
          />

          <span
            v-tooltip
            :title="option.name"
            class="truncate"
            :class="
              fieldName.meta.touched && !fieldName.meta.valid
                ? 'text-primary'
                : 'text-light-title dark:text-dark-title'
            "
            >{{ option.name }}</span
          >
        </label>
      </div>

      <h5 v-else class="text-center text-light-text dark:text-dark-text">
        {{ noOptionsText }}
      </h5>
    </DisclosurePanel>

    <VeeErrorMessage
      v-if="!fieldName.meta.valid && fieldName.meta.touched"
      :name="name"
      class="!mt-2 px-3 text-sm text-primary dark:text-dark-primary lg:text-base"
      as="div"
    />
  </Disclosure>
</template>
