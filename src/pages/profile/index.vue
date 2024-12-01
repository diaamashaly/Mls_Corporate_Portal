<script setup>
import { useAuthStore } from "@/store/auth";
import axios from "axios";
import { storeToRefs } from "pinia";
import { configure } from "vee-validate";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import * as yup from "yup";
import handleImageError from "@/lib/handleImageError";

configure({
  validateOnBlur: true,
  validateOnChange: true,
  validateOnInput: true,
  validateOnModelUpdate: true,
});

const i18n = useI18n();

const toast = useToast();

const authStore = useAuthStore();
const { profile } = storeToRefs(authStore);

/* Start of the function that handle update profile image */
const image = ref(null);
const imageAttachment = ref(null);

const baseURL = import.meta.env.VITE_API_URL;

const changeImageLoading = ref(false);
async function handleChangeImage(e) {
  changeImageLoading.value = true;

  const data = new FormData();

  data.append("file", e.target.files[0]);
  data.append("attachment_type", "image");
  data.append("model", "users");

  await axios
    .post("general/attachments", data)
    .then((res) => {
      imageAttachment.value = res.data.data;

      image.value = `${baseURL.slice(0, baseURL.lastIndexOf("/"))}/storage/images/users/${res.data.data}`;
    })
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (changeImageLoading.value = false));
}
/* End of the function that handle update profile image */

/* Start of the function that handle edit profile data */
const initialValues = ref({
  name: profile.value.name,
  email: profile.value.email,
  phone: profile.value.phone,
  role: profile.value.role,
  faxNumber: profile.value.fax_number,
  taxIdNumber: profile.value.tax_id,
  commercialRegistrationNumber: profile.value.commercial_registration,
});
const schema = yup.object().shape({
  name: yup.string().required(i18n.t("ERRORS.nameRequired")),
  email: yup
    .string()
    .required(i18n.t("ERRORS.emailRequired"))
    .email(i18n.t("ERRORS.invalidEmail")),
  phone: yup
    .string()
    .required(i18n.t("ERRORS.phoneRequired"))
    .test("phone", i18n.t("ERRORS.phoneNumberLimit"), (value) => {
      if (value) {
        return value.length === 11;
      } else {
        return true;
      }
    }),
  role: yup.string().notRequired(),
  faxNumber: yup.string().required(i18n.t("ERRORS.faxNumberRequired")),
  taxIdNumber: yup
    .string()
    .required(i18n.t("ERRORS.brokerageTaxIdNumberRequired")),
  commercialRegistrationNumber: yup
    .string()
    .required(i18n.t("ERRORS.commercialRegistrationNumberRequired")),
});

const submitLoading = ref(false);
async function handleSubmit(values) {
  submitLoading.value = true;

  const data = {
    name: values.name,
    phone_code: "20",
    phone: values.phone,
    fax_number: values.faxNumber,
    tax_id: values.taxIdNumber,
    commercial_registration: values.commercialRegistrationNumber,
  };

  if (imageAttachment.value) {
    data["logo"] = imageAttachment.value;
  }

  await axios
    .post("dashboard/profile", data)
    .then((res) => {
      if (image.value) {
        profile.value = { ...res.data.data, logo: image.value };
      } else {
        profile.value = { ...res.data.data, logo: profile.value.logo };
      }

      toast.success(i18n.t("TEXTS.profileUpdatedSuccessfully"));
    })
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (submitLoading.value = false));
}
/* End of the function that handle edit profile data */
</script>

<template>
  <Card>
    <div class="mb-5 flex items-center">
      <div class="relative flex flex-col items-center gap-1">
        <div class="relative size-[100px]">
          <img
            class="size-full rounded-full object-cover"
            :src="image ? image : profile.logo"
            alt="profile-image"
            :draggable="false"
            @error="handleImageError"
          />

          <label
            for="profileImage"
            class="absolute bottom-0 end-0 flex size-[35px] select-none items-center justify-center rounded-full border-light-border bg-white dark:border-dark-border"
            :class="
              changeImageLoading
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer'
            "
          >
            <i class="fa-solid fa-edit text-light-text dark:text-dark-text" />

            <input
              type="file"
              accept="image/*"
              id="profileImage"
              class="hidden"
              :disabled="changeImageLoading"
              @change="handleChangeImage"
            />
          </label>
        </div>

        <h5 class="font-medium text-primary">{{ $t("TITLES.companyLogo") }}</h5>
      </div>
    </div>

    <VeeForm
      :validation-schema="schema"
      :initial-values="initialValues"
      @submit="handleSubmit"
      as="div"
    >
      <form
        class="border-border grid grid-cols-12 gap-5 rounded-2xl border bg-white p-5 dark:border-transparent dark:bg-transparent"
      >
        <ValidInput
          id="corporateName"
          class="col-span-12 xl:col-span-6"
          name="name"
          :label="$t('LABELS.corporateName')"
          :placeholder="$t('INPUTS.corporateNamePlaceholder')"
        />

        <ValidInput
          id="email"
          class="col-span-12 xl:col-span-6"
          name="email"
          :label="$t('LABELS.email')"
          :placeholder="$t('INPUTS.emailPlaceholder')"
        />

        <ValidInput
          id="phone"
          class="col-span-12 xl:col-span-6"
          name="phone"
          isNumber
          :label="$t('LABELS.phone')"
          placeholder="00 000 000 000"
        />

        <ValidSelect
          id="role"
          class="col-span-12 xl:col-span-6"
          name="role"
          :label="$t('LABELS.role')"
          :placeholder="$t('LABELS.role')"
          :options="[
            {
              id: 'developer',
              name: $t('INPUTS.development'),
            },
            {
              id: 'broker',
              name: $t('INPUTS.brokerage'),
            },
          ]"
          :defaultValue="initialValues.role ? initialValues.role : ''"
          disabled
        />

        <ValidInput
          id="faxNumber"
          class="col-span-12 xl:col-span-6"
          name="faxNumber"
          isNumber
          :label="$t('LABELS.faxNumber')"
          :placeholder="$t('INPUTS.faxNumberPlaceholder')"
        />

        <ValidInput
          id="taxIdNumber"
          class="col-span-12 xl:col-span-6"
          name="taxIdNumber"
          isNumber
          :label="$t('LABELS.taxIdNumber')"
          :placeholder="$t('INPUTS.idNumberPlaceholder')"
        />

        <ValidInput
          id="commercialRegistrationNumber"
          class="col-span-12 xl:col-span-6"
          name="commercialRegistrationNumber"
          isNumber
          :label="$t('LABELS.commercialRegistrationNumber')"
          :placeholder="$t('INPUTS.numberPlaceholder')"
        />

        <div class="col-span-12 mt-3 flex items-center justify-end">
          <Button
            type="submit"
            class="lg:min-w-[25%]"
            :text="$t('BUTTONS.save')"
            :loading="submitLoading || changeImageLoading"
          />
        </div>
      </form>
    </VeeForm>
  </Card>
</template>
