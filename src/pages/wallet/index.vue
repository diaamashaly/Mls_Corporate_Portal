<script setup>
import axios from "axios";
import { configure } from "vee-validate";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import * as yup from "yup";

configure({
  validateOnBlur: true,
  validateOnModalUpdate: true,
  validateOnChange: true,
  validateOnInput: true,
});

const route = useRoute();
const router = useRouter();

const i18n = useI18n();

const toast = useToast();

/* Start of the function that handle charge */
const chargeModal = ref(false);

const schema = yup.object().shape({
  amount: yup.string().required(i18n.t("ERRORS.amountRequired")),
});

const currentPaymentTransaction = ref(null);

const chargeLoading = ref(false);
async function handleCharge(values) {
  chargeLoading.value = true;

  await axios
    .post("dashboard/charge", {
      amount: values.amount,
    })
    .then((res) => {
      currentPaymentTransaction.value = res.data.data;

      startPayment();

      chargeModal.value = false;
    })
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (chargeLoading.value = false));
}

/* Start of the function that call the payment gateway */
function startPayment() {
  const payment = new GeideaCheckout(
    onPaymentSuccess,
    onPaymentError,
    onPaymentCancel,
  );

  payment.startPayment(currentPaymentTransaction.value.session_id);
}
/* End of the function that call the payment gateway */

/* Start of the function that handle the success of the payment */
async function onPaymentSuccess() {
  isLoading.value = true;

  await axios
    .post(
      `dashboard/update_wallet_transaction/${currentPaymentTransaction.value.id}`,
    )
    .then(() => location.reload())
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (isLoading.value = false));
}
/* End of the function that handle the success of the payment */

/* Start of the function that handle the error of the payment */
function onPaymentError() {
  return toast.success(t("TEXTS.paymentFailed"));
}
/* End of the function that handle the error of the payment */

/* Start of the function that handle the cancellation of the payment */
function onPaymentCancel() {
  return toast.success(t("TEXTS.paymentCancelled"));
}
/* End of the function that handle the cancellation of the payment */
/* End of the function that handle charge */

/* Start of the function that fetch data */
const page = ref(route.query.page || 1);

const perPage = ref(1);

const totalPages = ref(0);

const balance = ref(0);

const data = ref({
  columns: [
    {
      label: i18n.t("TITLES.balanceBefore"),
      field: "balance_before",
    },
    {
      label: i18n.t("TITLES.balanceAfter"),
      field: "balance_after",
    },
    {
      label: i18n.t("TITLES.amount"),
      field: "amount",
    },
    {
      label: i18n.t("TITLES.type"),
      field: "type",
    },
    {
      label: i18n.t("TITLES.status"),
      field: "status",
    },
    {
      label: i18n.t("TITLES.createdAt"),
      field: "create_at",
    },
    {
      label: i18n.t("TITLES.createdTime"),
      field: "create_time",
    },
  ],
  rows: [],
});

const dataForExport = ref([]);

const isLoading = ref(false);
async function fetchData() {
  isLoading.value = true;

  await axios
    .get("dashboard/all_wallet_transactions", {
      params: {
        page: +route.query.page || 1,
      },
    })
    .then((res) => {
      if (res.data.data) {
        data.value.rows = res.data.data.transactions.data;

        dataForExport.value = res.data.data.transactions.data.map((item) => {
          return {
            [i18n.t("TITLES.balanceBefore")]: item.balance_before,
            [i18n.t("TITLES.balanceAfter")]: item.balance_after,
            [i18n.t("TITLES.amount")]: item.amount,
            [i18n.t("TITLES.type")]: item.type,
            [i18n.t("TITLES.createdAt")]: item.create_at,
            [i18n.t("TITLES.createdTime")]: item.create_time,
          };
        });

        totalPages.value = res.data.data.transactions.meta.links - 2;

        perPage.value = res.data.data.transactions.meta.per_page;

        balance.value = res.data.data.balance;
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
  <!-- Start of the charge modal -->
  <Transition name="fade">
    <Background v-if="chargeModal" />
  </Transition>

  <Transition name="translate">
    <FormModal
      v-if="chargeModal"
      :title="$t('TITLES.chargeWallet')"
      :loading="chargeLoading"
      :schema="schema"
      :btnText="$t('BUTTONS.charge')"
      @close="chargeModal = false"
      @submit="handleCharge"
    >
      <ValidInput
        name="amount"
        id="amount"
        :label="$t('TITLES.amount')"
        :placeholder="$t('INPUTS.amountPlaceholder')"
      />
    </FormModal>
  </Transition>
  <!-- End of the charge modal -->

  <Card
    :title="$t('NAV.wallet')"
    :button="$t('BUTTONS.charge')"
    @handleClick="chargeModal = true"
  >
    <div
      v-if="isLoading"
      class="flex items-center justify-center rounded-[10px] bg-white py-10 dark:bg-transparent"
    >
      <Loader />
    </div>

    <template v-else>
      <div
        class="mb-3 flex flex-col items-start justify-between xl:flex-row xl:items-center"
      >
        <div class="flex flex-col items-center">
          <h6 class="font-medium text-light-title dark:text-dark-title">
            {{ $t("TITLES.totalBalance") }}
          </h6>

          <h3 class="text-lg font-semibold dark:text-dark-title lg:text-2xl">
            {{ balance }}
          </h3>
        </div>

        <JsonExcel
          :data="dataForExport"
          :rtl="i18n.locale.value === 'ar'"
          name="Wallet"
          class="w-fit"
        >
          <button
            type="button"
            class="mb-5 rounded-full bg-primary px-7 py-3 text-white"
          >
            {{ $t("BUTTONS.exportData") }}
          </button>
        </JsonExcel>
      </div>

      <Table
        :is-slot-mode="true"
        :columns="data.columns"
        :rows="data.rows"
        :pagination="false"
        :is-hide-paging="true"
        class="font-medium"
      >
        <template v-slot:type="data">
          <span class="capitalize">{{ data.value.type }}</span>
        </template>

        <template v-slot:status="data">
          <span class="capitalize">{{
            data.value.status || $t("TEXTS.notFound")
          }}</span>
        </template>
      </Table>

      <div v-if="totalPages > 1" class="mt-12">
        <Pagination
          v-model="page"
          :pages="totalPages"
          :rageSize="perPage"
          activeColor=""
          @update:modelValue="
            $router
              .push({
                path: '/agents',
                query: Object.assign({}, route.query, {
                  page,
                }),
              })
              .then(() => fetchData())
          "
        />
      </div>
    </template>
  </Card>
</template>
