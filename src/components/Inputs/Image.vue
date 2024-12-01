<script setup>
import { useField } from "vee-validate";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

const props = defineProps({
  id: {
    type: String,
    required: true,
    default: null,
  },
  label: {
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
  defaultImage: {
    type: String,
    required: false,
    default: null,
  },
});

const emits = defineEmits(["getImage"]);

const fileInput = ref(null);

const i18n = useI18n();

const toast = useToast();

const fileSchema = useField(props.name);

const active = ref(false);
function toggleActive() {
  active.value = !active.value;
}

const image = ref(null);

/* Start of the function that handle uploading files */
function handleFiles(files) {
  if (files.length) {
    if (files[0].type.startsWith("image")) {
      fileSchema.setValue(files[0].name);

      const reader = new FileReader();

      reader.readAsDataURL(files[0]);

      reader.onload = () => {
        image.value = reader.result;

        emits("getImage", image.value);

        fileSchema.validate();
      };
    } else {
      toast.error(i18n.t("ERRORS.uploadImagesOnly"));
    }
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
function handleRemoveImage() {
  image.value = null;

  fileInput.value = null;

  emits("getImage", image.value);

  fileSchema.resetField();
}
/* End of the function that handle remove file */

watch(
  () => props,
  (value) => {
    if (value.defaultImage) {
      image.value = value.defaultImage;
    }
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>

<template>
  <div>
    <label
      :id="id"
      class="mb-3 block text-sm lg:text-base lg:font-medium"
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
      :id="id"
      class="flex h-[250px] w-full cursor-pointer select-none items-center justify-center gap-3 rounded-2xl border-2 bg-white disabled:!cursor-default dark:bg-black lg:h-[300px]"
      :class="[
        active
          ? 'border-light-text'
          : 'border-light-border dark:border-dark-border',
        !fileSchema.meta.valid &&
          fileSchema.meta.touched &&
          '!border-primary !text-primary dark:!border-dark-primary dark:text-dark-primary',
      ]"
    >
      <input
        :id="id"
        ref="fileInput"
        type="file"
        name="files"
        class="hidden"
        accept=".png,.jpg,.jpeg"
        @change="handleChange"
        :disabled="disabled"
      />

      <div v-if="image" class="relative size-[250px]">
        <button
          v-if="!disabled"
          type="button"
          class="absolute -end-[10px] -top-[10px] flex size-[40px] items-center justify-center rounded-full bg-primary text-white dark:bg-dark-primary"
          @click.prevent="handleRemoveImage"
        >
          <i class="fa-solid fa-trash-alt" />
        </button>

        <img
          :src="image"
          class="size-full rounded-xl object-cover"
          alt="image-preview"
        />
      </div>

      <span
        v-else
        :class="
          !fileSchema.meta.valid && fileSchema.meta.touched
            ? 'text-primary dark:text-dark-primary'
            : 'text-light-text dark:text-dark-text'
        "
        >{{ $t("INPUTS.uploadImage") }}</span
      >
    </label>

    <VeeErrorMessage
      v-if="!fileSchema.meta.valid && fileSchema.meta.touched"
      :name="name"
      as="div"
      class="mt-2 px-3 text-sm text-primary dark:text-dark-primary lg:text-base"
    />
  </div>
</template>
