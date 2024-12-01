<script setup>
import axios from "axios";
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const i18n = useI18n();

const route = useRoute();
const router = useRouter();

/* Start of the filters */
function handleFilter(key, value) {
  router.push({
    path: route.path,
    query: Object.assign({}, route.query, {
      [key]: value,
    }),
  });
}

/* Start of the status filter */
const status = ref(route.query.status || "");
watch(status, (value) => {
  const type = statusFilter.value.find((item) => item.name === value)?.id;

  handleFilter("status", type);
});

const statusFilter = ref([
  {
    id: "pending",
    name: i18n.t("INPUTS.pending"),
  },
  {
    id: "new",
    name: i18n.t("INPUTS.new"),
  },
  {
    id: "approved",
    name: i18n.t("INPUTS.approved"),
  },
  {
    id: "rejected",
    name: i18n.t("INPUTS.rejected"),
  },
  {
    id: "canceled",
    name: i18n.t("INPUTS.canceled"),
  },
  {
    id: "expired",
    name: i18n.t("INPUTS.expired"),
  },
  {
    id: "refund",
    name: i18n.t("INPUTS.refund"),
  },
]);
/* End of the status filter */

/* Start of the purchase type filters */
const purchaseType = ref(route.query.purchase_type || "");
watch(purchaseType, (value) => {
  const type = purchaseTypeFilters.value.find(
    (item) => item.name === value,
  )?.id;

  handleFilter("purchase_type", type);
});

const purchaseTypeFilters = ref([
  {
    id: "developer",
    name: i18n.t("INPUTS.developer"),
  },
  {
    id: "broker",
    name: i18n.t("INPUTS.broker"),
  },
  {
    id: "subscriptionPayment",
    name: i18n.t("INPUTS.subscriptionPayment"),
  },
  {
    id: "pay-application-fees",
    name: i18n.t("BUTTONS.payApplicationFee"),
  },
  {
    id: "charge-wallet",
    name: i18n.t("TITLES.chargeWallet"),
  },
  {
    id: "pay-tokens",
    name: i18n.t("BUTTONS.payToken"),
  },
]);
/* End of the purchase type filters */

/* Quantity */
const quantity = ref("");
watch(quantity, (value) => {
  handleFilter("quantity", value);
});
/* End of the quantity filter */

/* Unit price */
const unitPrice = ref("");
watch(unitPrice, (value) => {
  handleFilter("unit_price", value);
});
/* End of the unit price filter */

/* Total price */
const totalPrice = ref("");
watch(totalPrice, (value) => {
  handleFilter("total_price", value);
});
/* End of the total price filter */
/* End of the filters */

/* Start of the function that fetch data */
const dataForExport = ref([]);
const data = ref({
  columns: [
    {
      label: i18n.t("TITLES.status"),
      field: "status",
    },
    {
      label: i18n.t("LABELS.name"),
      field: "name",
    },
    {
      label: i18n.t("LABELS.phone"),
      field: "phone",
    },
    {
      label: i18n.t("TITLES.purchaseType"),
      field: "purchase_type",
    },
    {
      label: i18n.t("TITLES.quantity"),
      field: "quantity",
    },
    {
      label: i18n.t("TITLES.unitPrice"),
      field: "unit_price",
    },
    {
      label: i18n.t("TITLES.totalPrice"),
      field: "total_price",
    },
  ],
  rows: [],
});

const isLoading = ref(false);
async function fetchData() {
  isLoading.value = true;

  await axios
    .get("dashboard/payments", {
      params: {
        status: route.query.status || "",
        purchase_type: route.query.purchase_type || "",
        quantity: route.query.quantity || "",
        unit_price: route.query.unit_price || "",
        total_price: route.query.total_price || "",
      },
    })
    .then((res) => {
      if (res.data.data) {
        data.value.rows = res.data.data;

        dataForExport.value = res.data.data.map((item) => {
          return {
            [i18n.t("TITLES.status")]: item.status,
            [i18n.t("TITLES.purchaseType")]: item.purchase_type,
            [i18n.t("TITLES.quantity")]: item.quantity,
            [i18n.t("TITLES.unitPrice")]: item.unit_price,
            [i18n.t("TITLES.totalPrice")]: item.total_price,
          };
        });
      }
    })
    .catch((e) => console.error(e))
    .finally(() => (isLoading.value = false));
}
/* End of the function that fetch data */

watch(
  () => route.query,
  () => {
    fetchData();
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<template>
  <Card :number="data.rows.length">
    <!-- Start of the filters -->
    <div class="mb-5 grid grid-cols-12 gap-3 lg:mb-7">
      <div class="col-span-12 xl:col-span-4">
        <Select
          id="status"
          :label="$t('TITLES.status')"
          :placeholder="$t('INPUTS.select')"
          :defaultValue="route.query.status || ''"
          :disabled="isLoading"
          :options="statusFilter"
          :clearable="true"
          @select="status = $event"
          @clear="status = ''"
        />
      </div>

      <div class="col-span-12 xl:col-span-4">
        <Select
          id="purchase_type"
          :label="$t('TITLES.purchaseType')"
          :placeholder="$t('INPUTS.select')"
          :defaultValue="route.query.purchase_type || ''"
          :disabled="isLoading"
          :options="purchaseTypeFilters"
          :clearable="true"
          @select="purchaseType = $event"
          @clear="purchaseType = ''"
        />
      </div>

      <div class="col-span-12 xl:col-span-4">
        <Search
          v-model="quantity"
          :placeholder="$t('INPUTS.quantityPlaceholder')"
          :disabled="isLoading"
        />
      </div>

      <div class="col-span-12 xl:col-span-4">
        <Search
          v-model="unitPrice"
          :placeholder="$t('INPUTS.unitPricePlaceholder')"
          :disabled="isLoading"
        />
      </div>

      <div class="col-span-12 xl:col-span-4">
        <Search
          v-model="totalPrice"
          :placeholder="$t('INPUTS.totalPricePlaceholder')"
          :disabled="isLoading"
        />
      </div>
    </div>
    <!-- End of the filters -->

    <template v-if="isLoading">
      <div
        class="flex items-center justify-center rounded-[10px] bg-white py-10 dark:bg-transparent"
      >
        <Loader />
      </div>
    </template>

    <template v-else>
      <div class="flex items-center justify-end">
        <JsonExcel
          name="Invoices"
          class="w-fit"
          :data="dataForExport"
          :rtl="i18n.locale.value === 'ar'"
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
        :sortable="{
          sort: 'asc',
        }"
        :pagination="false"
        :is-hide-paging="true"
        class="font-medium"
      >
        <template v-slot:status="data">
          <span class="capitalize">{{ data.value.status }}</span>
        </template>

        <template v-slot:name="data">
          <h5 class="max-w-[200px] truncate">
            {{ data.value.user.full_name || $t("TEXTS.notFound") }}
          </h5>
        </template>

        <template v-slot:phone="data">
          <a
            :href="`tel:${data.value.user.phone_code}${data.value.user.phone}`"
            class="max-w-[200px] truncate"
          >
            {{ data.value.user.phone_code }} {{ data.value.user.phone }}
          </a>
        </template>

        <template v-slot:purchase_type="data">
          <span class="capitalize">{{ data.value.purchase_type }}</span>
        </template>
      </Table>
    </template>
  </Card>
</template>
