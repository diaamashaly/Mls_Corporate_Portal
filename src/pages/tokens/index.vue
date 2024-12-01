<script setup>
import { useAuthStore } from "@/store/auth";
import axios from "axios";
import { storeToRefs } from "pinia";
import { configure } from "vee-validate";
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import * as yup from "yup";

configure({
  validateOnBlur: true,
  validateOnChange: true,
  validateOnChange: true,
  validateOnModalUpdate: true,
});

const i18n = useI18n();

const route = useRoute();
const router = useRouter();

const toast = useToast();

const authStore = useAuthStore();

/* Start of the filters */
function handleFilter(key, value) {
  router.push({
    path: route.path,
    query: Object.assign({}, route.query, {
      [key]: value,
    }),
  });
}

/* Search */
const keyword = ref(route.query.name || "");
watch(keyword, (value) => {
  handleFilter("keyword", value);
});
/* End of the search filter */
/* End of the filters */

/* Start of the function that fetch data */
const dataForExport = ref([]);
const data = ref({
  columns: [
    {
      label: i18n.t("TITLES.agentName"),
      field: "full_name",
    },
    {
      label: "MLS ID",
      field: "mls_id",
    },
    {
      label: i18n.t("LABELS.numberOfTokens"),
      field: "qty",
    },
    {
      label: i18n.t("TITLES.assignedDate"),
      field: "created_at",
    },
  ],
  rows: [],
});

const page = ref(+route.query.page || 1);

const perPage = ref(0);

const totalPages = ref(0);

const totalTokens = ref(0);

const isLoading = ref(false);
async function fetchData() {
  isLoading.value = true;

  await axios
    .get("dashboard/tokens", {
      params: {
        page: +route.query.page || 1,
        keyword: route.query.keyword || "",
      },
    })
    .then((res) => {
      if (res.data.data) {
        data.value.rows = res.data.data;

        totalPages.value = res.data.meta.links - 2;

        perPage.value = res.data.meta.per_page;

        dataForExport.value = res.data.data.map((item) => {
          return {
            [i18n.t("TITLES.agentName")]:
              item.user.full_name || i18n.t("TEXTS.notFound"),
            ["MLS ID"]: item.user.mls_id || i18n.t("TEXTS.notFound"),
            [i18n.t("LABELS.numberOfTokens")]: item.qty,
            [i18n.t("TITLES.assignedDate")]: item.created_at,
          };
        });
      }
    })
    .catch((e) => console.error(e))
    .finally(() => (isLoading.value = false));
}
/* End of the function that fetch data */

/* Start of the function that handle pay tokens */
const payTokensModal = ref(false);

const schema = yup.object().shape({
  number: yup
    .string()
    .required(i18n.t("ERRORS.tokensNumberRequired"))
    .test("number", i18n.t("ERRORS.numberMustBeGreaterThan0"), (value) => {
      return value && +value > 0;
    }),
});

const tokensNumber = ref(0);

const payTokensLoading = ref(false);
async function handlePayTokens(values) {
  payTokensLoading.value = true;

  await axios
    .post("dashboard/pay-for-tokens", {
      quantity: values.number,
    })
    .then(() => {
      toast.success(i18n.t("TEXTS.tokensPaidSuccessfully"));

      payTokensModal.value = false;

      tokensNumber.value = 0;

      fetchData();

      authStore.getProfileData();
    })
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (payTokensLoading.value = false));
}
/* End of the function that handle pay tokens */

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
  <!-- Start of the pay now tokens modal -->
  <Teleport to="body">
    <Background v-if="payTokensModal" />

    <Transition name="translate">
      <FormModal
        v-if="payTokensModal"
        :title="$t('BUTTONS.buyNowTokens')"
        :loading="payTokensLoading"
        :btnText="$t('BUTTONS.payNow')"
        :schema="schema"
        @close="payTokensModal = false"
        @submit="handlePayTokens"
      >
        <div class="space-y-5">
          <ValidInput
            id="number"
            :label="$t('LABELS.numberOfTokens')"
            :placeholder="$t('INPUTS.numberOfTokenPlaceholder')"
            name="number"
            isNumber
            v-model="tokensNumber"
          />

          <div class="flex flex-col gap-2">
            <h5 class="font-medium text-black dark:text-white">
              {{ $t("TITLES.paymentSummary") }}
            </h5>

            <div
              class="rounded-2xl border border-light-border p-3 dark:border-dark-border"
            >
              <div
                class="mb-3 flex flex-col items-start gap-1.5 border-b border-light-border pb-2 font-medium dark:border-dark-border"
              >
                <div
                  class="flex w-full items-center justify-between gap-3 text-black dark:text-white"
                >
                  <h6>
                    {{ $t("TITLES.amount") }}
                  </h6>

                  <h6>{{ tokensNumber }}</h6>
                </div>

                <div
                  class="flex w-full items-center justify-between gap-3 text-black dark:text-white"
                >
                  <h6>
                    {{ $t("TITLES.individualCost") }}
                  </h6>

                  <h6>{{ authStore.profile.token_price }}</h6>
                </div>
              </div>

              <div
                class="flex w-full items-center justify-between gap-3 text-black dark:text-white"
              >
                <h6>
                  {{ $t("TITLES.totalCost") }}
                </h6>

                <h6>
                  {{ authStore.profile.token_price }} * {{ tokensNumber }} =
                  {{ authStore.profile.token_price * tokensNumber }}
                </h6>
              </div>
            </div>
          </div>
        </div>
      </FormModal>
    </Transition>
  </Teleport>
  <!-- End of the pay now tokens modal -->

  <Card
    :number="totalTokens"
    :add="authStore.profile ? $t('BUTTONS.buyNowTokens') : ''"
    @handleAdd="payTokensModal = true"
  >
    <!-- Start of the filters -->
    <div class="mb-5 grid grid-cols-12 gap-3 lg:mb-7">
      <div class="col-span-12 xl:col-span-8">
        <Search
          v-model="keyword"
          :placeholder="$t('INPUTS.searchByNameOrMlsId')"
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
          name="Tokens"
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
        <template v-slot:full_name="data">
          {{
            data.value.user && data.value.user.full_name
              ? data.value.user.full_name
              : $t("TEXTS.notFound")
          }}
        </template>

        <template v-slot:mls_id="data">
          {{ data.value.user.mls_id || $t("TEXTS.notFound") }}
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
                path: '/tokens',
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
