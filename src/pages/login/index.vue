<script setup>
import { useDark, useToggle } from "@vueuse/core";
import axios from "axios";
import { configure } from "vee-validate";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import * as yup from "yup";

configure({
  validateOnBlur: true,
  validateOnChange: true,
  validateOnInput: true,
  validateOnModelUpdate: true,
});

const i18n = useI18n();

const toast = useToast();

/* Start of the function that toggle theme */
const isDark = useDark();

const toggleTheme = useToggle(isDark);
/* End of the function that toggle theme */

const form = ref("login");

/* Start of the login form */
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required(i18n.t("ERRORS.emailRequired"))
    .email(i18n.t("ERRORS.invalidEmail")),
  password: yup.string().required(i18n.t("ERRORS.passwordRequired")),
});

const loginLoading = ref(false);
async function handleLogin(values) {
  loginLoading.value = true;

  await axios
    .post("/dashboard/login", {
      email: values.email,
      password: values.password,
    })
    .then((res) => {
      toast.success(i18n.t("TEXTS.loggedInSuccessfully"));

      localStorage.setItem("corporate_portal_token", res.data.data.token);

      location.reload();
    })
    .catch((e) => {
      loginLoading.value = false;

      console.error(e);

      toast.error(e.response.data.message);
    });
}
/* End of the login form */

/* Start of the function that handle resend code */
const resendCodeLoading = ref(false);
async function handleResendCode() {
  resendCodeLoading.value = true;

  await axios
    .post("dashboard/resend-code", {
      email: forgotPasswordEmail.value,
      type: "reset_password",
    })
    .then(() => toast.success(i18n.t("TEXTS.codeResentSuccessfully")))
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (resendCodeLoading.value = false));
}
/* End of the function that handle resend code */

/* Start of the forgot password form */
const forgotPasswordForm = ref("email");

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required(i18n.t("ERRORS.emailRequired"))
    .email(i18n.t("ERRORS.invalidEmail")),
});

const forgotPasswordEmail = ref(null);

const forgotPasswordLoading = ref(false);
async function handleForgotPassword(values) {
  forgotPasswordLoading.value = true;

  await axios
    .post("/dashboard/forget-password", {
      email: values.email,
    })
    .then(() => {
      toast.success(`${i18n.t("TEXTS.weHaveSentCodeToEmail")} ${values.email}`);

      forgotPasswordEmail.value = values.email;

      forgotPasswordForm.value = "verify";
    })
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (forgotPasswordLoading.value = false));
}

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
        .post("dashboard/check-code", {
          email: forgotPasswordEmail.value,
          code: verify_code.value,
        })
        .then(() => {
          toast.success(i18n.t("TEXTS.codeVerifiedSuccessfully"));

          forgotPasswordForm.value = "new-password";
        });
    } else {
      toast.error(i18n.t("TEXTS.codeRequired"));
    }
  } else {
    toast.error(i18n.t("TEXTS.enterFullCode"));
  }
}
/* End of the verification code form */
/* End of the forgot password form */

/* Start of the new password form */
const newPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required(i18n.t("ERRORS.passwordRequired"))
    .test("newPassword", i18n.t("ERRORS.passwordMinLength"), (value) => {
      if (value) {
        return value.length >= 6;
      }

      return false;
    }),
  confirmPassword: yup
    .string()
    .required(i18n.t("ERRORS.passwordRequired"))
    .when("password", (password, field) =>
      password
        ? field
            .required(i18n.t("ERRORS.passwordRequired"))
            .oneOf([yup.ref("newPassword")], i18n.t("ERRORS.passwordsNotMatch"))
        : field,
    ),
});

const newPasswordLoading = ref(false);
async function handleNewPassword(values) {
  newPasswordLoading.value = true;

  await axios
    .post("/dashboard/reset-password", {
      password: values.newPassword,
      email: forgotPasswordEmail.value,
      code: verify_code.value,
    })
    .then(() => {
      toast.success(i18n.t("TEXTS.passwordChangedSuccessfully"));

      form.value = "login";

      forgotPasswordForm.value = "email";
    })
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (newPasswordLoading.value = false));
}
/* End of the new password form */
</script>

<template>
  <div class="flex size-full items-center justify-center p-3">
    <div
      class="w-full rounded-xl border border-transparent bg-white p-2 shadow-[0,0,32px,0_#00000026] dark:border-black dark:bg-[#00000080] lg:w-[700px]"
    >
      <div class="max-h-[90vh] overflow-y-auto px-5 pb-3">
        <div
          class="mb-5 flex flex-wrap items-start justify-between gap-5 pt-3 md:items-center lg:mb-10"
        >
          <!-- <img
            v-if="isDark"
            src="/logo/dark.svg"
            class="block h-[60px]"
            alt="light-logo"
            :draggable="false"
          /> -->
          <SvgIcon v-if="isDark" icon="dark" class="block h-[60px]" />

          <!-- <img
            v-else
            src="/logo/light.svg"
            class="block h-[60px]"
            alt="light-logo"
            :draggable="false"
          /> -->
          <SvgIcon v-else icon="light" class="block h-[60px]" />

          <button
            type="button"
            class="flex size-[50px] items-center justify-center rounded-full border-2 border-light-border dark:border-dark-border"
            @click="toggleTheme()"
          >
            <SvgIcon icon="moon" />
          </button>
        </div>

        <!-- Start of the login form -->
        <VeeForm
          v-if="form === 'login'"
          as="div"
          :validation-schema="loginSchema"
          @submit="handleLogin"
        >
          <form>
            <div class="mb-5 flex flex-col gap-1 lg:mb-7">
              <h6 class="text-light-text dark:text-dark-text">
                {{ $t("TITLES.welcomeBack") }}
              </h6>

              <h5 class="font-bold dark:text-white">
                {{ $t("TITLES.signIntoYourAccount") }}
              </h5>
            </div>

            <ValidInput
              id="email"
              type="email"
              class="mb-3"
              name="email"
              :label="$t('LABELS.email')"
              :placeholder="$t('INPUTS.emailPlaceholder')"
            />

            <ValidInput
              id="password"
              type="password"
              name="password"
              :label="$t('LABELS.password')"
              :placeholder="$t('INPUTS.passwordPlaceholder')"
            />

            <div class="mb-5 mt-3 flex items-center justify-end">
              <button
                type="button"
                class="font-medium text-light-title disabled:cursor-not-allowed disabled:opacity-60 dark:text-dark-title"
                :disabled="loginLoading"
                @click="
                  form = 'forgot-password';
                  forgotPasswordForm = 'email';
                "
              >
                {{ $t("BUTTONS.forgotPassword") }}
              </button>
            </div>

            <Button
              type="submit"
              :text="$t('BUTTONS.signIn')"
              :disabled="loginLoading"
              class="mb-3.5 w-full"
            />

            <div
              class="flex flex-wrap items-center justify-center gap-2 text-sm lg:text-base lg:font-medium"
            >
              <h5 class="text-light-title dark:text-dark-title">
                {{ $t("TITLES.donNotHaveAnAccount") }}
              </h5>

              <RouterLink to="/register" class="text-primary">
                {{ $t("BUTTONS.createOne") }}
              </RouterLink>
            </div>
          </form>
        </VeeForm>
        <!-- End of the login form -->

        <template v-else>
          <!-- Start of the forgot password form -->
          <VeeForm
            v-if="forgotPasswordForm === 'email'"
            as="div"
            :validation-schema="forgotPasswordSchema"
            @submit="handleForgotPassword"
          >
            <form>
              <div class="mb-5 flex flex-col gap-1 lg:mb-7">
                <h6 class="text-light-text dark:text-dark-text">
                  {{ $t("TITLES.welcomeBack") }}
                </h6>

                <h5 class="font-bold">
                  {{ $t("TITLES.forgotYourPassword") }}
                </h5>
              </div>

              <ValidInput
                id="email"
                class="my-5 lg:my-7"
                type="email"
                name="email"
                :label="$t('LABELS.email')"
                :placeholder="$t('INPUTS.emailPlaceholder')"
              />

              <Button
                type="submit"
                :text="$t('BUTTONS.confirm')"
                :disabled="forgotPasswordLoading"
                class="mb-3.5 w-full"
              />

              <Button
                type="button"
                class="mb-3.5 w-full border border-primary !bg-transparent !text-primary dark:border-dark-primary dark:!text-dark-primary [&:not(:disabled)]:hover:!bg-primary [&:not(:disabled)]:hover:!text-white dark:[&:not(:disabled)]:hover:!bg-dark-primary"
                :text="$t('BUTTONS.backToLogin')"
                :disabled="forgotPasswordLoading"
                @click="
                  form = 'login';
                  forgotPasswordForm = 'email';
                "
              />
            </form>
          </VeeForm>
          <!-- End of the forgot password form -->

          <!-- Start of the verification code form -->
          <div v-else-if="forgotPasswordForm === 'verify'">
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="disabled:cursor-not-allowed disabled:opacity-60"
                @click="
                  verificationCodeForm = false;
                  login = true;
                "
                :disabled="verifyCodeLoading || resendCodeLoading"
              >
                <i
                  :class="`fa-solid fa-arrow-${
                    i18n.locale.value === 'ar' ? 'right' : 'left'
                  } text-light-text dark:text-dark-text`"
                />
              </button>

              <div class="flex flex-wrap items-center gap-1">
                <span class="font-medium text-light-text dark:text-dark-text">{{
                  $t("TITLES.enterCodeWeSent")
                }}</span>
                <span class="font-bold dark:text-white">{{
                  forgotPasswordEmail
                }}</span>
              </div>
            </div>

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
                @click="forgotPasswordForm = 'email'"
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

          <!-- Start of the new password form -->
          <VeeForm
            v-else-if="forgotPasswordForm === 'new-password'"
            as="div"
            :validation-schema="newPasswordSchema"
            @submit="handleNewPassword"
          >
            <form>
              <div class="mb-7 flex flex-col gap-1">
                <h6 class="text-light-text dark:text-dark-text">
                  {{ $t("TITLES.welcomeBack") }}
                </h6>

                <h5 class="font-bold">
                  {{ $t("TITLES.forgotYourPassword") }}
                </h5>
              </div>

              <ValidInput
                id="newPassword"
                type="password"
                name="newPassword"
                :label="$t('LABELS.newPassword')"
                :placeholder="$t('INPUTS.newPasswordPlaceholder')"
              />

              <ValidInput
                id="confirmPassword"
                class="my-5 lg:my-7"
                type="password"
                name="confirmPassword"
                :label="$t('LABELS.confirmPassword')"
                :placeholder="$t('INPUTS.confirmPasswordPlaceholder')"
              />

              <Button
                type="submit"
                :loading="newPasswordLoading"
                :text="$t('BUTTONS.confirm')"
                class="mb-3.5 w-full"
              />

              <Button
                type="button"
                :loading="newPasswordLoading"
                class="mb-3.5 w-full border border-primary !bg-transparent !text-primary hover:!bg-primary hover:!text-white dark:border-dark-primary dark:!text-dark-primary dark:hover:!bg-dark-primary"
                :text="$t('BUTTONS.backToLogin')"
                @click="
                  form = 'login';
                  forgotPasswordForm = 'email';
                "
              />
            </form>
          </VeeForm>
          <!-- End of the new password form -->
        </template>
      </div>
    </div>
  </div>
</template>
