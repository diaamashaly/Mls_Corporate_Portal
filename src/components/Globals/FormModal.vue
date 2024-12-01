<script setup>
import { onMounted, onUnmounted } from "vue";

defineProps({
  title: {
    type: String,
    required: true,
    default: null,
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
  btnText: {
    type: String,
    required: false,
    default: null,
  },
  schema: {
    type: Object,
    required: false,
    default: null,
  },
  initialValues: {
    type: Object,
    required: false,
    default: null,
  },
  base: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emits = defineEmits(["close", "submit"]);

onMounted(() => {
  document.body.classList.add("overflow-hidden");
});

onUnmounted(() => {
  document.body.classList.remove("overflow-hidden");
});
</script>

<template>
  <div class="fixed end-0 top-0 z-[1010] size-full p-3.5 lg:w-[700px] lg:p-7">
    <div
      :dir="$i18n.locale === 'ar' && 'rtl'"
      class="flex size-full w-full flex-col items-start justify-start gap-7 rounded-2xl bg-white p-3 dark:bg-black lg:p-5"
    >
      <div class="flex w-full flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <h5
            class="select-none font-semibold text-light-title dark:text-dark-title lg:text-xl"
          >
            {{ title }}
          </h5>

          <slot name="title" />
        </div>

        <div class="flex w-full items-center justify-between gap-2 lg:w-auto">
          <slot name="button" />

          <button
            type="button"
            class="border-border borer-light-border flex size-[45px] items-center justify-center rounded-full border disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#1A1A1A]"
            :disabled="loading"
            @click="
              () => {
                if (!loading) {
                  emits('close');
                }
              }
            "
          >
            <SvgIcon icon="close" />
          </button>
        </div>
      </div>

      <div class="h-[calc(100%-70px)] w-full">
        <div
          v-if="base"
          class="flex h-full flex-col items-start justify-between gap-5"
        >
          <div
            class="w-full overflow-y-auto pe-3"
            :class="btnText ? 'h-[calc(100%-70px)]' : 'h-full'"
          >
            <slot />
          </div>

          <Button
            v-if="btnText"
            type="button"
            :text="btnText"
            class="w-full !rounded-3xl"
            :disabled="loading"
          />
        </div>

        <VeeForm
          v-else
          as="div"
          class="h-full"
          :validation-schema="schema"
          :initial-values="initialValues"
          @submit="emits('submit', $event)"
        >
          <form
            autocomplete="off"
            class="flex h-full flex-col items-start justify-between gap-5"
          >
            <div class="h-[calc(100%-70px)] w-full overflow-y-auto pe-3">
              <slot />
            </div>

            <Button
              type="submit"
              :text="btnText"
              class="w-full !rounded-3xl"
              :disabled="loading"
            />
          </form>
        </VeeForm>
      </div>
    </div>
  </div>
</template>
