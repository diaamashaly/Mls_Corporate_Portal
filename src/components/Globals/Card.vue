<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

defineProps({
  number: {
    type: Number,
    required: false,
    default: null,
  },
  link: {
    type: Object,
    required: false,
    default: null,
  },
  button: {
    type: String,
    required: false,
    default: null,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  specialBtn: {
    type: Boolean,
    required: false,
    default: false,
  },
  icon: {
    type: String,
    required: false,
    default: null,
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
  add: {
    type: String,
    required: false,
    default: null,
  },
});

const emits = defineEmits(["handleClick", "handleAdd"]);

const route = useRoute();

const i18n = useI18n();

const title = computed(() => {
  const name = route.path.slice(1);

  if (route.path.includes("-")) {
    let words = name.split("-");

    words = words.map((word, i) => {
      if (i > 0) {
        word = `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
      }

      return word;
    });

    return i18n.t(`NAV.${words.join("")}`);
  } else {
    return i18n.t(`NAV.${name}`);
  }
});
</script>

<template>
  <div
    class="w-full rounded-[16px] border-2 border-white bg-light-mainBg p-2 dark:border-black dark:bg-dark-mainBg"
  >
    <div
      class="h-[calc(100vh-165px)] overflow-y-auto overflow-x-hidden p-1 lg:p-3"
    >
      <div
        class="mb-3 flex flex-col items-start justify-between gap-3 lg:mb-5 lg:mb-7 lg:flex-row lg:items-center lg:gap-5"
      >
        <div class="flex items-center gap-3">
          <SvgIcon
            :icon="route.path.slice(1)"
            class="size-[24px] stroke-primary dark:stroke-dark-primary"
          />

          <h5
            class="font-semibold text-primary dark:text-dark-primary lg:text-xl"
          >
            {{ title }}
          </h5>

          <div
            v-if="number"
            class="flex aspect-square h-[40px] w-[50px] items-center justify-center rounded-full bg-[#FF82AC1A] p-2 text-sm text-[#FF82AC]"
          >
            {{ loading ? "." : number }}
          </div>
        </div>

        <div class="flex items-center gap-3">
          <RouterLink
            v-if="link"
            :to="link.path"
            class="flex w-full items-center justify-center gap-2 rounded-3xl bg-primary px-3.5 py-2.5 text-white dark:bg-dark-primary lg:w-fit"
          >
            <SvgIcon icon="add" />

            <span>{{ link.name }}</span>
          </RouterLink>

          <button
            v-else-if="specialBtn"
            class="flex w-full items-center justify-center gap-2 rounded-3xl bg-primary px-3.5 py-2.5 text-white duration-300 disabled:cursor-not-allowed disabled:opacity-60 lg:w-fit"
            :disabled="disabled"
            @click="emits('handleClick')"
          >
            <SvgIcon :icon="icon" />

            <span>{{ button }}</span>
          </button>

          <button
            v-else-if="button"
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-3xl bg-primary px-3.5 py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-dark-primary lg:w-fit"
            :disabled="disabled"
            @click="emits('handleClick')"
          >
            <SvgIcon icon="add" />

            <span>{{ button }}</span>
          </button>

          <button
            v-if="add"
            type="button"
            class="w-full rounded-3xl bg-primary px-5 py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-dark-primary lg:w-fit"
            :disabled="disabled"
            @click="emits('handleAdd')"
          >
            {{ add }}
          </button>
        </div>
      </div>

      <slot />
    </div>
  </div>
</template>
