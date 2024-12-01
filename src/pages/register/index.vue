<script setup>
import { useDark, useToggle } from "@vueuse/core";
import axios from "axios";
import { configure, FieldArray } from "vee-validate";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import * as yup from "yup";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";

configure({
  validateOnBlur: true,
  validateOnModalUpdate: true,
  validateOnChange: true,
  validateOnInput: true,
});

const i18n = useI18n();

const toast = useToast();

const step = ref("email");

/* Start of the function that toggle theme */
const isDark = useDark();

const toggleTheme = useToggle(isDark);
/* End of the function that toggle theme */

/* Start of the function that handle email */
const emailSchema = yup.object().shape({
  email: yup
    .string()
    .required(i18n.t("ERRORS.emailRequired"))
    .email(i18n.t("ERRORS.invalidEmail")),
});

const email = ref("");

const emailLoading = ref(false);
async function handleSubmitEmail(values) {
  emailLoading.value = true;

  await axios
    .post("dashboard/register", {
      email: values.email,
    })
    .then((res) => {
      email.value = corporateInformationInitialValues.value["email"] =
        values.email;

      if (res.data.is_verify) {
        toast.success(i18n.t("TEXTS.completeRegisterSteps"));

        step.value = "register";
      } else {
        toast.success(
          `${i18n.t("TEXTS.weHaveSentCodeToEmail")} ${values.email}`,
        );

        step.value = "verify";
      }
    })
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (emailLoading.value = false));
}
/* End of the function that handle email */

/*Start of the verification code form */
const verify_code = ref(null);
function handleOnChange(e) {
  verify_code.value = e;
}

const verifyCodeLoading = ref(false);
async function handleVerificationCode() {
  if (verify_code.value) {
    if (verify_code.value.length === 4) {
      verifyCodeLoading.value = true;

      await axios
        .post("dashboard/verify", {
          email: email.value,
          code: verify_code.value,
        })
        .then(() => {
          toast.success(i18n.t("TEXTS.emailVerifiedSuccessfully"));

          step.value = "register";
        })
        .catch((e) => {
          console.error(e);

          toast.error(e.response.data.message);
        })
        .finally(() => (verifyCodeLoading.value = false));
    } else {
      toast.error(i18n.t("ERRORS.codeRequired"));
    }
  } else {
    toast.error(i18n.t("ERRORS.enterFullCode"));
  }
}
/* End of the verification code form */

/* Start of the function that handle resend code */
const resendCodeLoading = ref(false);
async function handleResendCode() {
  resendCodeLoading.value = true;

  await axios
    .post("dashboard/resend-code", {
      email: email.value,
      type: "register",
    })
    .then(() => toast.success(i18n.t("TEXTS.codeResentSuccessfully")))
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (resendCodeLoading.value = false));
}
/* End of the function that handle resend code */

/* Start of the function that handle register */
const dataForSubmit = ref({});

const registerSteps = ref(1);

/* Start of the corporate information form */
const corporateInformationInitialValues = ref({});
const corporateInformationSchema = yup.object().shape({
  name: yup.string().required(i18n.t("ERRORS.nameRequired")),
  email: yup.string().notRequired(),
  phone: yup
    .string()
    .required(i18n.t("ERRORS.phoneRequired"))
    .test("phone", i18n.t("ERRORS.invalidPhoneNumber"), (value) => {
      if (value) {
        if (
          value.startsWith("010") ||
          value.startsWith("011") ||
          value.startsWith("012") ||
          value.startsWith("015")
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    })
    .test("phone", i18n.t("ERRORS.phoneNumberLimit"), (value) => {
      if (value) {
        return value.length === 11;
      } else {
        return true;
      }
    }),
  role: yup.string().required(i18n.t("ERRORS.roleRequired")),
  faxNumber: yup.string().required(i18n.t("ERRORS.faxNumberRequired")),
  taxIdNumber: yup
    .string()
    .required(i18n.t("ERRORS.brokerageTaxIdNumberRequired")),
  commercialRegistrationNumber: yup
    .string()
    .required(i18n.t("ERRORS.commercialRegistrationNumberRequired")),
  website: yup.string().required(i18n.t("ERRORS.websiteRequired")),
  address: yup.string().required(i18n.t("ERRORS.addressRequired")),
  password: yup
    .string()
    .required(i18n.t("ERRORS.passwordRequired"))
    .min(6, i18n.t("ERRORS.passwordMinLength")),
  confirmPassword: yup
    .string()
    .required(i18n.t("ERRORS.passwordRequired"))
    .when("password", (password, field) =>
      password
        ? field
            .required(i18n.t("ERRORS.passwordRequired"))
            .oneOf([yup.ref("password")], i18n.t("ERRORS.passwordsNotMatch"))
        : field,
    ),
});

function handleCorporateInformation(values) {
  corporateInformationInitialValues.value = dataForSubmit.value = { ...values };

  registerSteps.value = 2;
}
/* End of the corporate information form */

/* Start of the documents form */
const taxIdImage = ref(null);
const commercialRegistrationImage = ref(null);

const documentsSchema = yup.object().shape({
  taxId: yup
    .string()
    .test("taxId", i18n.t("ERRORS.taxIdImageRequired"), () => {
      return taxIdImage.value ? true : false;
    })
    .notRequired(),
  commercialRegistration: yup
    .string()
    .test("", i18n.t("ERRORS.commercialRegistrationImageRequired"), () => {
      return commercialRegistrationImage.value ? true : false;
    })
    .notRequired(),
});

function handleDocuments() {
  registerSteps.value = 3;
}
/* End of the documents form */

/* Start of the branches form */
const branchesInitialValues = ref({
  branches: [
    {
      name: "",
      phone: "",
      address: "",
    },
  ],
});
const branchesSchema = yup.object().shape({
  branches: yup.array().of(
    yup.object().shape({
      name: yup.string().required(i18n.t("ERRORS.nameRequired")),
      phone: yup
        .string()
        .required(i18n.t("ERRORS.phoneRequired"))
        .test("phone", i18n.t("ERRORS.invalidPhoneNumber"), (value) => {
          if (value) {
            if (
              value.startsWith("010") ||
              value.startsWith("011") ||
              value.startsWith("012") ||
              value.startsWith("015")
            ) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        })
        .test("phone", i18n.t("ERRORS.phoneNumberLimit"), (value) => {
          if (value) {
            return value.length === 11;
          } else {
            return true;
          }
        }),
      address: yup.string().required(i18n.t("ERRORS.addressRequired")),
    }),
  ),
});

const branchesStatus = ref([
  {
    status: false,
  },
]);

const isLoading = ref(false);
async function handleSubmit(values) {
  isLoading.value = true;

  const data = { ...dataForSubmit.value };

  const form = new FormData();

  form.append("email", email.value);
  form.append("name", data.name);
  form.append("phone_code", "20");
  form.append("phone", data.phone);
  form.append("role", data.role);
  form.append("website", data.website);
  form.append("address", data.address);
  form.append("password", data.password);
  form.append("password_confirmation", data.confirmPassword);
  form.append("fax_number", data.faxNumber);
  form.append("tax_id", data.taxIdNumber);
  form.append("commercial_registration", data.commercialRegistrationNumber);

  form.append("front_tax_file", taxIdImage.value);
  form.append(
    "commercial_registration_file",
    commercialRegistrationImage.value,
  );

  values.branches.map((branch, i) => {
    form.append(`branches[${i}][name]`, branch.name);
    form.append(`branches[${i}][phone]`, branch.phone);
    form.append(`branches[${i}][phone_code]`, "20");
    form.append(`branches[${i}][address]`, branch.address);
    form.append(
      `branches[${i}][is_master]`,
      branchesStatus.value[i].status ? 1 : 0,
    );
  });

  await axios
    .post("dashboard/complete-register", form)
    .then((res) => {
      toast.success(i18n.t("TEXTS.registeredSuccessfully"));

      localStorage.setItem("corporate_portal_token", res.data.data.token);

      location.reload();
    })
    .catch((e) => {
      isLoading.value = false;

      console.error(e);

      toast.error(e.response.data.message);
    });
}
/* End of the branches form */
/* End of the function that handle register */
</script>

<template>
  <div class="flex size-full items-center justify-center p-3">
    <div
      class="w-full rounded-xl border border-transparent bg-white p-2 shadow-[0,0,32px,0_#00000026] dark:border-black dark:bg-[#00000080]"
      :class="step === 'register' ? 'lg:w-[1000px]' : 'lg:w-[700px]'"
    >
      <div class="max-h-[90vh] overflow-y-auto px-5 pb-3">
        <div
          class="mb-5 flex flex-wrap items-start justify-between gap-5 pt-3 md:items-center"
          :class="step === 'email' && 'lg:mb-10'"
        >
        <SvgIcon v-if="isDark" icon="dark" class="block h-[60px]" />
          <!-- <img
            v-if="isDark"
            src="/logo/dark.svg"
            class="block h-[60px]"
            alt="light-logo"
            :draggable="false"
          /> -->

          <SvgIcon v-else icon="light" class="block h-[60px]" />
          <!-- <img
            v-else
            src="/logo/light.svg"
            class="block h-[60px]"
            alt="light-logo"
            :draggable="false"
          /> -->

          <button
            type="button"
            class="flex size-[50px] items-center justify-center rounded-full border-2 border-light-border dark:border-dark-border"
            @click="toggleTheme()"
          >
            <SvgIcon icon="moon" />
          </button>
        </div>

        <div class="mb-5 flex flex-col items-start gap-1">
          <template v-if="step === 'email'">
            <h5 class="font-semibold text-black dark:text-white lg:text-lg">
              {{ $t("TITLES.gettingStarted") }}
            </h5>

            <p class="font-light text-light-title dark:text-dark-title">
              {{ $t("TEXTS.enterYourEmailToVerify") }}
            </p>
          </template>

          <template v-else>
            <h5 class="font-semibold text-black dark:text-white lg:text-lg">
              {{ $t("TITLES.corporateInformation") }}
            </h5>

            <p class="font-light text-light-title dark:text-dark-title">
              {{ $t("TEXTS.enterYourDataToRegister") }}
            </p>
          </template>
        </div>

        <!-- Email form -->
        <VeeForm
          v-if="step === 'email'"
          :validation-schema="emailSchema"
          as="div"
          @submit="handleSubmitEmail"
        >
          <form>
            <ValidInput
              id="email"
              type="email"
              name="email"
              :label="$t('LABELS.email')"
              :placeholder="$t('INPUTS.emailPlaceholder')"
            />

            <Button
              type="submit"
              :text="$t('BUTTONS.confirm')"
              :disabled="emailLoading"
              class="mb-3.5 mt-5 w-full"
            />

            <RouterLink
              to="/login"
              class="flex h-[50px] w-full items-center justify-center rounded-xl border border-primary !bg-transparent !text-primary duration-300 dark:border-dark-primary dark:!text-dark-primary [&:not(:disabled)]:hover:!bg-primary [&:not(:disabled)]:hover:!text-white dark:[&:not(:disabled)]:hover:!bg-dark-primary"
              >{{ $t("BUTTONS.backToLogin") }}</RouterLink
            >
          </form>
        </VeeForm>
        <!-- End of the email form -->

        <!-- Start of the verification code form -->
        <div v-else-if="step === 'verify'">
          <v-otp-input
            input-classes="rounded-md xl:text-2xl text-center dark:text-white size-[65px] bg-[#F8F9F9] border border-[#E7E9E9] dark:bg-[#0D0D0D] dark:border-[#262626]"
            class="mb-7 mt-5 flex items-center gap-7"
            separator=" "
            v-model="verify_code"
            value=""
            :num-inputs="4"
            :should-auto-focus="true"
            @on-change="handleOnChange"
            dir="ltr"
          />

          <div class="mb-5 flex items-center gap-3">
            <Button
              type="button"
              :text="$t('BUTTONS.back')"
              class="w-full border border-primary !bg-transparent !text-primary duration-300 dark:border-dark-primary dark:!text-dark-primary [&:not(disabled)]:hover:!bg-primary hover:[&:not(disabled)]:!text-white dark:[&:not(disabled)]:hover:!bg-dark-primary"
              :disabled="verifyCodeLoading || resendCodeLoading"
              @click="
                step = 'email';
                email = '';
              "
            />

            <Button
              type="button"
              :text="$t('BUTTONS.submit')"
              class="w-full"
              :disabled="verifyCodeLoading || resendCodeLoading"
              @btnClick="handleVerificationCode"
            />
          </div>

          <div class="flex items-center justify-center gap-2 font-medium">
            <p class="text-light-text dark:text-dark-text">
              {{ $t("TEXTS.didNotReceiveCode") }}
            </p>

            <button
              type="button"
              class="text-primary underline disabled:cursor-not-allowed disabled:opacity-60 dark:text-dark-primary"
              :disabled="resendCodeLoading || verifyCodeLoading"
              @click="handleResendCode"
            >
              {{ $t("BUTTONS.resend") }}
            </button>
          </div>
        </div>
        <!-- End of the verification code form -->

        <template v-else>
          <!-- Register form -->
          <div
            class="mb-5 grid w-full grid-cols-1 items-center font-medium xl:mb-7 xl:grid-cols-3"
          >
            <button
              type="button"
              class="flex items-center gap-2 pb-5 pe-7 duration-200 xl:border-b-2 xl:pb-3"
              :class="
                registerSteps === 1
                  ? 'border-primary'
                  : 'border-light-border dark:border-dark-border'
              "
              @click="registerSteps = 1"
              disabled
            >
              <span
                class="dark:text-inherit flex size-[24px] items-center justify-center rounded-full text-sm text-white"
                :class="
                  registerSteps === 1
                    ? 'bg-primary text-white'
                    : 'bg-light-border dark:bg-dark-border'
                "
                >1</span
              >

              <span
                :class="
                  registerSteps === 1
                    ? 'text-primary'
                    : 'text-light-border dark:text-dark-text'
                "
              >
                {{ $t("TITLES.corporateInformation") }}
              </span>
            </button>

            <button
              type="button"
              class="flex items-center gap-2 pb-5 pe-7 duration-200 xl:justify-center xl:border-b-2 xl:pb-3"
              :class="
                registerSteps === 2
                  ? 'border-primary'
                  : 'border-light-border dark:border-dark-border'
              "
              @click="registerSteps = 2"
              disabled
            >
              <span
                class="dark:text-inherit flex size-[24px] items-center justify-center rounded-full text-sm text-white"
                :class="
                  registerSteps === 2
                    ? 'bg-primary text-white'
                    : 'bg-light-border dark:bg-dark-border'
                "
                >2</span
              >

              <span
                :class="
                  registerSteps === 2
                    ? 'text-primary'
                    : 'text-light-border dark:text-dark-text'
                "
              >
                {{ $t("TITLES.uploadDocuments") }}
              </span>
            </button>

            <button
              type="button"
              class="flex items-center gap-2 pb-5 pe-7 duration-200 xl:justify-center xl:border-b-2 xl:pb-3"
              :class="
                registerSteps === 3
                  ? 'border-primary'
                  : 'border-light-border dark:border-dark-border'
              "
              @click="registerSteps = 3"
              disabled
            >
              <span
                class="dark:text-inherit flex size-[24px] items-center justify-center rounded-full text-sm text-white"
                :class="
                  registerSteps === 3
                    ? 'bg-primary text-white'
                    : 'bg-light-border dark:bg-dark-border'
                "
                >3</span
              >

              <span
                :class="
                  registerSteps === 3
                    ? 'text-primary'
                    : 'text-light-border dark:text-dark-text'
                "
              >
                {{ $t("TITLES.addBranch") }}
              </span>
            </button>
          </div>
          <!-- End of the register form -->

          <!-- Corporate information form -->
          <VeeForm
            v-if="registerSteps === 1"
            as="div"
            :initial-values="corporateInformationInitialValues"
            :validation-schema="corporateInformationSchema"
            @submit="handleCorporateInformation"
          >
            <form class="grid grid-cols-12 gap-3 xl:gap-5">
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
                disabled
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
                :label="$t('TITLES.type')"
                :placeholder="$t('INPUTS.selectType')"
                :defaultValue="corporateInformationInitialValues.role ?? ''"
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
                id="website"
                class="col-span-12 xl:col-span-6"
                name="website"
                :label="$t('LABELS.website')"
                :placeholder="$t('INPUTS.websitePlaceholder')"
              />

              <ValidInput
                id="address"
                class="col-span-12 xl:col-span-6"
                name="address"
                :label="$t('LABELS.address')"
                :placeholder="$t('INPUTS.addressPlaceholder')"
              />

              <ValidInput
                id="commercialRegistrationNumber"
                class="col-span-12"
                name="commercialRegistrationNumber"
                isNumber
                :label="$t('LABELS.commercialRegistrationNumber')"
                :placeholder="$t('INPUTS.numberPlaceholder')"
              />

              <ValidInput
                id="password"
                class="col-span-12 xl:col-span-6"
                name="password"
                type="password"
                isNumber
                :label="$t('LABELS.password')"
                :placeholder="$t('INPUTS.passwordPlaceholder')"
              />

              <ValidInput
                id="confirmPassword"
                class="col-span-12 xl:col-span-6"
                name="confirmPassword"
                type="password"
                :label="$t('LABELS.confirmPassword')"
                :placeholder="$t('INPUTS.passwordPlaceholder')"
              />

              <Button
                type="submit"
                :text="$t('BUTTONS.next')"
                class="col-span-12 mt-3"
              />
            </form>
          </VeeForm>
          <!-- End of the corporate information form -->

          <!-- Documents form -->
          <VeeForm
            v-else-if="registerSteps === 2"
            :validation-schema="documentsSchema"
            as="div"
            @submit="handleDocuments"
          >
            <form class="space-y-5">
              <div class="flex flex-col gap-2">
                <h5 class="font-semibold dark:text-dark-text xl:text-xl">
                  {{ $t("TITLES.taxId") }}
                </h5>

                <File
                  id="taxId"
                  name="taxId"
                  :placeholder="$t('INPUTS.uploadImage')"
                  type="image"
                  accept="image/*"
                  model="users"
                  :value="taxIdImage || ''"
                  @getImage="taxIdImage = $event"
                />
              </div>

              <div class="flex flex-col gap-2">
                <h5 class="font-semibold dark:text-dark-text xl:text-xl">
                  {{ $t("TITLES.commercialRegistration") }}
                </h5>

                <File
                  id="commercialRegistration"
                  name="commercialRegistration"
                  :placeholder="$t('INPUTS.uploadImage')"
                  type="image"
                  accept="image/*"
                  model="users"
                  :value="commercialRegistrationImage || ''"
                  @getImage="commercialRegistrationImage = $event"
                />
              </div>

              <div class="col-span-12 grid gap-3">
                <Button type="submit" :text="$t('BUTTONS.next')" />

                <Button
                  type="submit"
                  :text="$t('BUTTONS.back')"
                  class="flex h-[50px] w-full items-center justify-center rounded-xl border border-primary !bg-transparent !text-primary duration-300 dark:border-dark-primary dark:!text-dark-primary [&:not(:disabled)]:hover:!bg-primary [&:not(:disabled)]:hover:!text-white dark:[&:not(:disabled)]:hover:!bg-dark-primary"
                  @click="registerSteps = 1"
                />
              </div>
            </form>
          </VeeForm>
          <!-- End of the documents form -->

          <!-- Branches form -->
          <VeeForm
            v-else
            as="div"
            :initial-values="branchesInitialValues"
            :validation-schema="branchesSchema"
            @submit="handleSubmit"
          >
            <form class="space-y-5">
              <FieldArray name="branches" v-slot="{ fields, push, remove }">
                <div
                  v-for="(field, i) in fields"
                  :key="field.id"
                  class="rounded-xl border border-light-border p-3 dark:border-dark-border"
                >
                  <Disclosure v-slot="{ open }" :defaultOpen="true">
                    <DisclosureButton
                      class="flex w-full items-center justify-between text-primary"
                    >
                      <h5 class="font-semibold">
                        {{ field.value?.name || $t("TITLES.branch") }}
                      </h5>

                      <div class="flex items-center gap-3">
                        <div
                          v-if="open"
                          class="hidden items-center justify-between gap-5 rounded-[40px] bg-[#DC06061A] p-2 dark:bg-[#150204] lg:flex"
                          @click.stop
                        >
                          <div class="flex items-center gap-1">
                            <span
                              class="size-[7px] rounded-full"
                              :class="
                                branchesStatus[i].status
                                  ? 'bg-green dark:text-white'
                                  : 'bg-primary dark:text-dark-primary'
                              "
                            />

                            <span
                              class="text-sm font-medium"
                              :class="
                                branchesStatus[i].status
                                  ? 'text-green dark:text-white'
                                  : 'text-primary dark:text-dark-primary'
                              "
                              >{{ $t("INPUTS.mainBranch") }}</span
                            >
                          </div>

                          <Switcher
                            :id="`branchStatus${i}`"
                            :status="branchesStatus[i].status"
                            @change="
                              () => {
                                branchesStatus[i].status =
                                  !branchesStatus[i].status;

                                if (branchesStatus[i].status) {
                                  branchesStatus = branchesStatus.map(
                                    (item, index) => {
                                      if (i !== index) {
                                        item.status = false;
                                      }

                                      return item;
                                    },
                                  );
                                }
                              }
                            "
                          />
                        </div>

                        <button
                          v-if="i !== 0"
                          type="button"
                          @click="
                            remove(fields.indexOf(fields[i]));
                            branchesStatus.splice(i, 1);
                          "
                        >
                          <SvgIcon icon="delete" />
                        </button>

                        <i
                          :class="`fa-solid fa-angle-${open ? 'up' : 'down'}`"
                        />
                      </div>
                    </DisclosureButton>

                    <DisclosurePanel
                      :unmount="false"
                      as="div"
                      class="grid grid-cols-12 gap-3 pt-5 xl:gap-5"
                    >
                      <ValidInput
                        :name="`branches[${i}].name`"
                        :id="`branches[${i}].name`"
                        class="col-span-12 xl:col-span-6"
                        :label="$t('LABELS.branchName')"
                        :placeholder="$t('INPUTS.branchNamePlaceholder')"
                      />

                      <ValidInput
                        :name="`branches[${i}].phone`"
                        :id="`branches[${i}].phone`"
                        class="col-span-12 xl:col-span-6"
                        :label="$t('TITLES.phoneNumber')"
                        :placeholder="$t('INPUTS.phoneNumberPlaceholder')"
                      />

                      <ValidInput
                        :name="`branches[${i}].address`"
                        class="col-span-12"
                        :id="`branches[${i}].address`"
                        :label="$t('LABELS.branchAddress')"
                        :placeholder="$t('INPUTS.branchAddressPlaceholder')"
                      />

                      <div class="col-span-12 flex items-center justify-end">
                        <div
                          class="flex items-center justify-between gap-5 rounded-[40px] bg-[#DC06061A] p-2 dark:bg-[#150204] lg:hidden"
                          @click.stop
                        >
                          <div class="flex items-center gap-1">
                            <span
                              class="size-[7px] rounded-full"
                              :class="
                                branchesStatus[i].status
                                  ? 'bg-green dark:text-white'
                                  : 'bg-primary dark:text-dark-primary'
                              "
                            />

                            <span
                              class="text-sm font-medium"
                              :class="
                                branchesStatus[i].status
                                  ? 'text-green dark:text-white'
                                  : 'text-primary dark:text-dark-primary'
                              "
                              >{{ $t("INPUTS.mainBranch") }}</span
                            >
                          </div>

                          <Switcher
                            :id="`branchStatus${i}`"
                            :status="branchesStatus[i].status"
                            @change="
                              branchesStatus[i].status =
                                !branchesStatus[i].status
                            "
                          />
                        </div>
                      </div>
                    </DisclosurePanel>
                  </Disclosure>
                </div>

                <div
                  class="flex w-full flex-col items-center gap-2 text-sm font-medium text-primary lg:text-base"
                >
                  <button
                    type="button"
                    class="flex h-[50px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary duration-300 hover:bg-primary hover:text-white"
                    @click="
                      push({
                        name: '',
                        phone: '',
                        address: '',
                      });

                      branchesStatus.push({
                        status: false,
                      });
                    "
                  >
                    <i class="fa-solid fa-plus" />

                    <span>{{ $t("BUTTONS.addMoreBranches") }}</span>
                  </button>

                  <p>{{ $t("TEXTS.youCanAddMoreBranches") }}</p>
                </div>
              </FieldArray>

              <div class="col-span-12 grid gap-3">
                <Button
                  type="submit"
                  :loading="isLoading"
                  :text="$t('BUTTONS.confirm')"
                />

                <Button
                  type="submit"
                  :text="$t('BUTTONS.back')"
                  class="flex h-[50px] w-full items-center justify-center rounded-xl border border-primary !bg-transparent !text-primary duration-300 dark:border-dark-primary dark:!text-dark-primary [&:not(:disabled)]:hover:!bg-primary [&:not(:disabled)]:hover:!text-white dark:[&:not(:disabled)]:hover:!bg-dark-primary"
                  @click="registerSteps = 2"
                />
              </div>
            </form>
          </VeeForm>
          <!-- End of the branches form -->

          <div
            class="mt-5 flex w-full flex-wrap items-center justify-center gap-2 text-sm font-medium lg:text-base"
          >
            <h5 class="text-black dark:text-white">
              {{ $t("TITLES.alreadyHaveAnAccount") }}
            </h5>

            <RouterLink to="/login" class="text-primary">{{
              $t("BUTTONS.login")
            }}</RouterLink>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
