<script setup>
import { useField } from "vee-validate";
import { reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  label: {
    type: String,
    required: false,
  },
  placeholder: {
    type: String,
    required: false,
  },
  value: {
    required: false,
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

const i18n = useI18n();

const state = reactive({
  content: props.value,
  editorOption: {
    placeholder: props.placeholder || i18n.t("INPUTS.messagePlaceholder"),
    modules: {
      toolbar: [
        "bold",
        "italic",
        "underline",
        "blockquote",
        "code-block",
        { list: "ordered" },
        { list: "bullet" },
        { align: "center" },
        { direction: props.arabic ? "ltr" : "rtl" },
      ],
    },
    readOnly: props.disabled,
  },
});

const emits = defineEmits(["getContent"]);

const fieldName = useField(props.name);

watch(
  () => state,
  (value) => {
    fieldName.setValue(value.content);

    emits("getContent", value.content);
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<template>
  <VeeField :name="name" v-slot="{ meta }">
    <div :class="!meta.valid && meta.touched && 'quill-error'">
      <h6
        class="mb-3"
        :class="
          !meta.valid && meta.touched
            ? '!text-primary dark:!text-dark-primary'
            : 'text-light-text dark:text-dark-text'
        "
      >
        {{ label }}
      </h6>

      <quill-editor
        v-model:value="state.content"
        :options="state.editorOption"
      />

      <VeeErrorMessage
        v-if="!meta.valid && meta.touched"
        :name="name"
        as="div"
        class="mt-1 px-5 !text-sm text-primary dark:text-dark-primary lg:!text-base"
      />
    </div>
  </VeeField>
</template>
