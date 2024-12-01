<script setup>
import { useDark } from "@vueuse/core";
import axios from "axios";
import { useField } from "vee-validate";
import { ref } from "vue";
import { useToast } from "vue-toastification";

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
  model: {
    type: String,
    required: true,
    default: null,
  },
  value: {
    type: String,
    required: false,
    default: null,
  },
  accept: {
    type: String,
    required: false,
    default: null,
  },
});

const isDark = useDark();

const emits = defineEmits(["getImage"]);

const toast = useToast();

const fileSchema = useField(props.name);

const isLoading = ref(false);
async function handleChange(e) {
  if (e.target.files.length) {
    if (props.type === "image") {
      if (!e.target.files[0].type.startsWith("image"))
        return toast.error(i18n.t("ERRORS.uploadImagesOnly"));
    }

    isLoading.value = true;

    const data = new FormData();

    data.append("file", e.target.files[0]);
    data.append("attachment_type", props.type);
    data.append("model", props.model);

    await axios
      .post("general/attachments", data)
      .then((res) => {
        emits("getImage", res.data.data);

        fileSchema.setValue(e.target.files[0].name);
      })
      .catch((e) => {
        console.error(e);

        toast.error(e.response.data.message);
      })
      .finally(() => (isLoading.value = false));
  }
}
</script>

<template>
  <VeeField
    as="div"
    :class="isLoading && 'cursor-not-allowed select-none opacity-60'"
    :name="name"
    v-slot="{ meta }"
  >
    <label
      v-if="label"
      class="mb-2 block font-medium"
      :class="meta.touched && !meta.valid && 'text-primary'"
      >{{ label }}</label
    >

    <label
      :for="id"
      class="flex h-[60px] w-full cursor-pointer select-none items-center justify-between rounded-lg border border-dashed px-3 text-center dark:border-dark-border dark:bg-dark-border dark:bg-transparent dark:text-dark-text"
      :class="[
        meta.touched && !meta.valid
          ? 'border-primary text-primary'
          : 'border-light-border dark:border-dark-border',
        fileSchema.value.value && 'border-primary',
      ]"
    >
      <input
        type="file"
        :id="id"
        @change="handleChange"
        :accept="accept || '*'"
        :disabled="isLoading"
        class="hidden"
      />

      <span v-if="fileSchema.value?.value">{{
        fileSchema.value.value.name || fileSchema.value.value || value
      }}</span>
      <span v-else>{{ placeholder }}</span>

      <SvgIcon v-if="fileSchema.value.value" icon="success" />

      <SvgIcon v-else-if="meta.touched && !meta.valid" icon="error" />

      <template v-else>
        <SvgIcon v-if="isDark" icon="file-light" />

        <SvgIcon v-else icon="file-dark" />
      </template>
    </label>

    <VeeErrorMessage
      v-if="meta.touched && !meta.valid"
      :name="name"
      as="p"
      class="mt-1 px-3 text-sm text-primary xl:text-base"
    />
  </VeeField>
</template>
