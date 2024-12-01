<script setup>
import { onMounted, ref } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useField } from "vee-validate";
import { watch } from "vue";

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
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const field = useField(props.name);

const date = ref(null);
watch(date, (value) => {
  if (value) {
    const day = value.getDate();
    const month = value.getMonth() + 1;
    const fullYear = value.getFullYear();

    field.setValue(
      `${fullYear}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
    );
  }
});

onMounted(() => {
  if (field.value) {
    date.value = new Date(field.value.value);
  }
});
</script>

<template>
  <VeeField as="div" :name="name" v-slot="{ meta }">
    <div
      :class="{
        error: !meta.valid && meta.touched,
      }"
    >
      <label
        v-if="label"
        :for="id"
        class="mb-2 block text-sm text-light-text dark:text-dark-text lg:text-base lg:font-medium"
        :class="
          !meta.valid && meta.touched && '!text-primary dark:!text-dark-primary'
        "
      >
        {{ label }}
      </label>

      <div class="input-date !overflow-visible">
        <VueDatePicker
          v-model="date"
          :name="name"
          :placeholder="placeholder"
          format="yyyy-MM-dd"
          :id="id"
          :disabled="disabled"
        />

        <VeeErrorMessage
          v-if="!meta.valid && meta.touched"
          :name="name"
          as="div"
          class="mt-2 ps-3 text-primary dark:text-dark-primary"
        />
      </div>
    </div>
  </VeeField>
</template>
