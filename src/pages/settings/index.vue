<script setup>
import axios from "axios";
import { configure } from "vee-validate";
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import * as yup from "yup";
import { useToast } from "vue-toastification";

configure({
  validateOnBlur: true,
  validateOnChange: true,
  validateOnModalUpdate: true,
  validateOnInput: true,
});

const i18n = useI18n();

const toast = useToast();

/* Start of the function that handle payment contribution */
const agentPayment = ref("");

const contributionPayment = ref([]);

watch(agentPayment, (value) => {
  if (value === "no") {
    contributionPayment.value = [];
  }
});

const submitLoading = ref(false);
async function handleSubmit() {
  submitLoading.value = true;

  let data = {};

  if (agentPayment.value === "no") {
    data = {
      enable_pay_for_agent: 0,
      enable_payment_for_application: 0,
      enable_payment_for_subscription: 0,
    };
  } else {
    data = {
      enable_pay_for_agent: agentPayment.value ? 1 : 0,
      enable_payment_for_application: contributionPayment.value.includes(
        "application",
      )
        ? 1
        : 0,
      enable_payment_for_subscription: contributionPayment.value.includes(
        "subscription",
      )
        ? 1
        : 0,
    };
  }

  await axios
    .post("dashboard/setting", data)
    .then(() => {
      toast.success(i18n.t("TEXTS.updatedSuccessfully"));
    })
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (submitLoading.value = false));
}
/* End of the function that handle payment contribution */

/* Start of the function that fetch data */
const isLoading = ref(false);
async function fetchData() {
  isLoading.value = true;

  await axios
    .get("dashboard/setting")
    .then((res) => {
      const data = res.data.data;

      agentPayment.value = data.enable_pay_for_agent ? "yes" : "no";

      if (agentPayment.value === "yes") {
        if (data.enable_payment_for_application == 1) {
          contributionPayment.value.push("application");
        }

        if (data.enable_payment_for_subscription == 1) {
          contributionPayment.value.push("subscription");
        }
      }
    })
    .catch((e) => console.error(e))
    .finally(() => (isLoading.value = false));
}
/* End of the function that fetch data */

onMounted(() => {
  fetchData();
});
</script>

<template>
  <Card>
    <div v-if="isLoading" class="flex h-[70vh] items-center justify-center">
      <Loader />
    </div>

    <template v-else>
      <div class="card mb-3 lg:mb-5">
        <div class="title">
          <h5>
            {{ $t("TITLES.agentPayment") }}
          </h5>

          <h6>
            {{ $t("TEXTS.doYouWantToPayAgent") }}
          </h6>
        </div>

        <div class="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <label class="label" for="no">
            <span>{{ $t("LABELS.no") }}</span>

            <input
              type="radio"
              name="agentPayment"
              id="no"
              value="no"
              v-model="agentPayment"
            />
          </label>

          <label class="label" for="yes">
            <span>{{ $t("LABELS.yes") }}</span>

            <input
              type="radio"
              name="agentPayment"
              id="yes"
              value="yes"
              v-model="agentPayment"
            />
          </label>
        </div>
      </div>

      <div class="card duration-300">
        <div
          class="title"
          :class="
            (!agentPayment || agentPayment === 'no') &&
            'pointer-events-none select-none opacity-30'
          "
        >
          <h5>
            {{ $t("TITLES.paymentContributions") }}
          </h5>

          <h6>
            {{ $t("TEXTS.selectRequiredSubscription") }}
          </h6>
        </div>

        <div class="mb-3 grid grid-cols-12 gap-3 lg:mb-5">
          <label
            class="label"
            :class="
              (!agentPayment || agentPayment === 'no') &&
              'pointer-events-none select-none opacity-30'
            "
            for="application"
          >
            <span>{{ $t("LABELS.application") }}</span>

            <input
              type="checkbox"
              id="application"
              value="application"
              v-model="contributionPayment"
            />
          </label>

          <label
            class="label"
            :class="
              (!agentPayment || agentPayment === 'no') &&
              'pointer-events-none select-none opacity-30'
            "
            for="subscription"
          >
            <span>{{ $t("LABELS.subscription") }}</span>

            <input
              type="checkbox"
              id="subscription"
              value="subscription"
              v-model="contributionPayment"
            />
          </label>

          <div class="col-span-12 mt-3 flex items-center justify-end">
            <Button
              type="button"
              class="min-w-full lg:min-w-[25%]"
              :text="$t('BUTTONS.saveSettings')"
              :loading="submitLoading"
              :disabled="!agentPayment"
              @click="handleSubmit"
            />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped lang="scss">
.card {
  @apply rounded-2xl border border-light-border bg-white p-3 dark:border-dark-border dark:bg-black;
  .title {
    @apply mb-3.5 flex flex-col items-start gap-[0.5px] lg:gap-1;
    h5 {
      @apply text-black dark:text-white lg:font-semibold xl:text-lg;
    }

    h6 {
      @apply text-sm lg:text-base lg:font-medium;
    }
  }
}

.label {
  @apply col-span-12 flex h-[50px] cursor-pointer select-none items-center justify-between rounded-xl bg-light-bodyBg px-3 font-medium text-primary dark:bg-dark-bodyBg lg:col-span-6 lg:h-[60px];
  input {
    @apply size-[20px] cursor-pointer;
  }
}
</style>
