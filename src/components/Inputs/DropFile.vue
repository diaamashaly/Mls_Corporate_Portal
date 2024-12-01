<script setup>
import { useField } from "vee-validate";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

const props = defineProps({
  pdf: {
    type: Boolean,
    required: false,
    default: false,
  },
  multiple: {
    type: Boolean,
    required: false,
    default: false,
  },
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
    required: true,
    default: null,
  },
  name: {
    type: String,
    required: true,
    default: null,
  },
  defaultImage: {
    type: String,
    required: false,
    default: null,
  },
  type: {
    type: String,
    required: false,
    default: null,
  },
});

const i18n = useI18n();

const emits = defineEmits(["getFile"]);

const toast = useToast();

const fileSchema = useField(props.name);

const active = ref(false);
function toggleActive() {
  active.value = !active.value;
}

const image = ref(null);

const file = ref(null);

/* Start of the function that handle uploading files */
function handleFiles(files) {
  if (files.length) {
    if (props.type === "excel") {
      if (!files[0].name.endsWith("xlsx"))
        return toast.error(i18n.t("ERRORS.uploadExcelFilesOnly"));
    } else if (props.type === "image") {
      if (!files[0].type.startsWith("image"))
        return i18n.t("ERRORS.uploadImagesOnly");
    }

    fileSchema.setValue(files[0]);

    file.value = files[0];

    const reader = new FileReader();

    reader.readAsDataURL(files[0]);

    if (props.type === "image") {
      reader.onload = () => {
        image.value = {
          name: files[0].name,
          src: reader.result,
        };

        fileSchema.validate();
      };
    }

    emits("getFile", file.value);

    setTimeout(() => {
      fileSchema.validate();
    }, 10);
  }
}

function handleChange(e, drop) {
  if (drop) {
    handleFiles(e.dataTransfer.files);
  } else {
    handleFiles(e.target.files);
  }
}
/* End of the function that handle uploading files */

/* Start of the function that handle remove file */
function handleRemoveFile() {
  image.value = file.value = null;

  setTimeout(() => {
    emits("getFile", "");

    fileSchema.setValue("");

    fileSchema.resetField();
  }, 10);
}
/* End of the function that handle remove file */

watch(
  () => props,
  (value) => {
    if (value.defaultImage) {
      image.value = {
        name: value.defaultImage,
        src: value.defaultImage,
      };
    }
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<template>
  <label
    :for="id"
    class="block lg:font-medium"
    :class="
      !fileSchema.meta.valid && fileSchema.meta.touched
        ? 'text-primary dark:text-dark-primary'
        : 'text-light-text dark:text-dark-text'
    "
    :draggable="true"
    >{{ label }}</label
  >

  <label
    @dragenter.prevent="toggleActive"
    @dragleave.prevent="toggleActive"
    @dragover.prevent
    @drop.prevent="handleChange($event, true)"
    :for="id"
    class="flex min-h-[100px] w-full cursor-pointer select-none items-center justify-center gap-3 rounded-2xl border border-dashed bg-light-inputBg p-2 text-center text-sm dark:bg-dark-inputBg lg:text-base"
    :class="[
      active
        ? 'border-light-text'
        : 'border-light-border dark:border-dark-border',
      !fileSchema.meta.valid &&
        fileSchema.meta.touched &&
        '!border-primary !text-primary dark:!border-dark-primary dark:!text-dark-primary',
    ]"
  >
    <input
      :id="id"
      type="file"
      name="files"
      class="hidden"
      :multiple="multiple"
      @change="handleChange"
    />

    <div
      class="flex flex-col items-center justify-center py-2"
      :class="
        !fileSchema.meta.valid && fileSchema.meta.touched
          ? 'text-primary dark:text-dark-primary'
          : 'text-light-text dark:text-dark-text'
      "
    >
      <SvgIcon icon="upload" class="mb-2" />

      <span>{{ placeholder }}</span>

      <span>{{ $t("INPUTS.dragOrDrop") }}</span>
    </div>
  </label>

  <VeeErrorMessage
    v-if="!fileSchema.meta.valid && fileSchema.meta.touched"
    :name="name"
    as="div"
    class="w-full px-3 text-primary dark:text-dark-primary"
  />

  <div
    v-if="image || file"
    class="mt-3 w-full rounded-xl border border-light-border p-2.5 !pe-3 dark:border-dark-border"
  >
    <div class="flex items-center justify-between gap-3">
      <div class="flex flex-grow items-center gap-2">
        <img
          v-if="image"
          :src="image.src"
          class="size-[60px] rounded-sm object-cover"
          :alt="image.name"
        />

        <span
          class="inline-block max-w-[200px] truncate text-sm lg:max-w-[400px]"
          :title="file.name"
          v-tooltip
          >{{ file.name }}</span
        >
      </div>

      <button type="button" @click="handleRemoveFile">
        <i class="fa-solid fa-close" />
      </button>
    </div>
  </div>
</template>
