<script setup>
import axios from "axios";
import { configure } from "vee-validate";
import { ref, onMounted, watch } from "vue";
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

const toast = useToast();

const route = useRoute();
const router = useRouter();

const baseURL = import.meta.env.VITE_API_URL;

/* Start of the function that handle add branch */
const addBranchModal = ref(false);

const file = ref(null);

/* Start of the function that handle download form */
const downloadFormLoading = ref(false);
async function handleDownloadForm() {
  downloadFormLoading.value = true;

  await axios
    .get("general/export_branches")
    .then(() => toast.success(i18n.t("TEXTS.excelDownloadedSuccessfully")))
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (downloadFormLoading.value = false));
}
/* End of the function that handle download form */

const schema = yup.object().shape({
  name: yup
    .string()
    .test("name", i18n.t("ERRORS.branchNameRequired"), (value) => {
      if (value) {
        return true;
      } else if (file.value) {
        return true;
      } else {
        return false;
      }
    })
    .notRequired(),
  phone: yup
    .string()
    .test("name", i18n.t("ERRORS.branchPhoneNumberRequired"), (value) => {
      if (value) {
        return true;
      } else if (file.value) {
        return true;
      } else {
        return false;
      }
    })
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
      } else if (file.value) {
        return true;
      } else {
        return false;
      }
    })
    .notRequired(),
  address: yup
    .string()
    .test("address", i18n.t("ERRORS.branchAddressRequired"), (value) => {
      if (value) {
        return true;
      } else if (file.value) {
        return true;
      } else {
        return false;
      }
    }),
});

const addBranchLoading = ref(false);
async function handleAddBranch(values) {
  addBranchLoading.value = true;

  function handleSuccess() {
    toast.success(i18n.t("TEXTS.branchAddedSuccessfully"));

    addBranchModal.value = false;

    fetchData();
  }

  function handleError(e) {
    console.error(e);

    toast.error(e.response.data.message);
  }

  if (file.value) {
    const data = new FormData();

    data.append("attachment", file.value);

    await axios
      .post("dashboard/import_branches", data)
      .then(() => handleSuccess())
      .catch((e) => handleError(e))
      .finally(() => (addBranchLoading.value = false));
  } else {
    await axios
      .post("dashboard/branches", {
        name: values.name,
        address: values.address,
        phone_code: "20",
        phone: values.phone,
        is_master: branchStatus.value ? 1 : 0,
      })
      .then(() => handleSuccess())
      .catch((e) => handleError(e))
      .finally(() => (addBranchLoading.value = false));
  }
}
/* End of the function that handle add branch */

/* Start of the function that handle edit branch */
const editBranchModal = ref(false);

const branchToEditId = ref(null);

const branchAgents = ref(0);

const branchStatus = ref(false);

const branchInitialValues = ref({
  name: "",
  phone: "",
  address: "",
});
const editBranchSchema = yup.object().shape({
  name: yup.string().required(i18n.t("ERRORS.branchNameRequired")),
  phone: yup.string().required(i18n.t("ERRORS.branchPhoneNumberRequired")),
  address: yup.string().required(i18n.t("ERRORS.branchAddressRequired")),
});

const editBranchLoading = ref(false);
async function handleEditBranch(values) {
  editBranchLoading.value = true;

  await axios
    .post(`dashboard/branches/${branchToEditId.value}`, {
      name: values.name,
      address: values.address,
      phone_code: "20",
      phone: values.phone,
      is_master: branchStatus.value ? 1 : 0,
      _method: "PUT",
    })
    .then(() => {
      editBranchModal.value = false;

      toast.success(i18n.t("TEXTS.branchEditedSuccessfully"));

      fetchData();
    })
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (editBranchLoading.value = false));
}
/* End of the function that handle edit branch */

/* Start of the function that handle delete branch */
const deleteBranchModal = ref(false);

const branchToDeleteId = ref(null);

const deleteBranchLoading = ref(false);
async function handleDeleteBranch() {
  deleteBranchLoading.value = true;

  await axios
    .delete(`dashboard/branches/${branchToDeleteId.value}`)
    .then(() => {
      toast.success(i18n.t("TEXTS.branchDeletedSuccessfully"));

      deleteBranchModal.value = false;

      fetchData();
    })
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (deleteBranchLoading.value = false));
}
/* End of the function that handle delete branch */

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
const keyword = ref(route.query.keyword || "");
watch(keyword, (value) => {
  handleFilter("keyword", value);
});
/* End of the search filter 
/* End of the filters */

/* Start of the function that fetch data */
const dataForExport = ref([]);
const data = ref({
  columns: [
    {
      label: i18n.t("LABELS.branchName"),
      field: "name",
    },
    {
      label: i18n.t("TITLES.creationDate"),
      field: "created_at",
    },
    {
      label: i18n.t("TITLES.branchLocation"),
      field: "address",
    },
    {
      label: i18n.t("TITLES.phoneNumber"),
      field: "phone",
    },
    {
      label: i18n.t("TITLES.status"),
      field: "is_master",
    },
    {
      label: "",
      field: "control",
    },
  ],
  rows: [],
});

const page = ref(+route.query.page || 1);

const perPage = ref(0);

const totalPages = ref(0);

const isLoading = ref(false);
async function fetchData() {
  isLoading.value = true;

  await axios
    .get("dashboard/branches", {
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
            [i18n.t("LABELS.branchName")]: item.name,
            [i18n.t("TITLES.creationDate")]: item.created_at,
            [i18n.t("TITLES.branchLocation")]: item.address,
            [i18n.t("TITLES.status")]: item.is_master
              ? i18n.t("INPUTS.mainBranch")
              : i18n.t("INPUTS.unMainBranch"),
            [i18n.t("TITLES.phoneNumber")]: `+${item.phone_code} ${item.phone}`,
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
  <!-- Start of the add branch modal -->
  <Teleport to="body">
    <Background v-if="addBranchModal || editBranchModal" />

    <Transition name="translate">
      <FormModal
        v-if="addBranchModal"
        :title="$t('BUTTONS.addNewBranch')"
        :loading="addBranchLoading"
        :schema="schema"
        :btnText="$t('BUTTONS.save')"
        @close="addBranchModal = false"
        @submit="handleAddBranch"
      >
        <div class="w-full space-y-3">
          <ValidInput
            id="name"
            :label="$t('LABELS.branchName')"
            :placeholder="$t('INPUTS.branchNamePlaceholder')"
            name="name"
          />

          <ValidInput
            id="phone"
            :label="$t('TITLES.phoneNumber')"
            :placeholder="$t('INPUTS.phoneNumberPlaceholder')"
            name="phone"
            isNumber
          />

          <ValidInput
            id="address"
            :label="$t('LABELS.branchAddress')"
            :placeholder="$t('INPUTS.branchAddressPlaceholder')"
            name="address"
          />
        </div>

        <div class="my-5 flex w-full flex-col items-center gap-2">
          <a
            :href="`${baseURL}/general/export_branches`"
            download
            class="flex h-[50px] w-full cursor-pointer select-none items-center justify-center rounded-2xl border border-primary bg-transparent text-primary duration-300 enabled:hover:bg-primary enabled:hover:text-white"
          >
            {{ $t("BUTTONS.downloadForm") }}
          </a>

          <span>{{ $t("LABELS.or") }}</span>

          <DropFile
            id="file"
            name="file"
            type="excel"
            :placeholder="$t('INPUTS.dragOrDropExcel')"
            @getFile="file = $event"
          />
        </div>
      </FormModal>
    </Transition>
  </Teleport>
  <!-- End of the add branch modal -->

  <!-- Start of the edit branch modal -->
  <Teleport to="body">
    <Transition name="translate">
      <FormModal
        v-if="editBranchModal"
        :title="$t('TITLES.branchData')"
        :loading="editBranchLoading"
        :btnText="$t('BUTTONS.edit')"
        :initialValues="branchInitialValues"
        :schema="editBranchSchema"
        @close="editBranchModal = false"
        @submit="handleEditBranch"
      >
        <template #title>
          <div class="flex items-center gap-1.5">
            <span class="block size-[5px] rounded-full bg-green" />

            <span class="text-green">Active</span>
          </div>
        </template>

        <template #button>
          <div
            class="flex w-fit min-w-[200px] items-center justify-between gap-5 rounded-[40px] bg-[#DC06061A] p-2 dark:bg-[#150204]"
          >
            <div class="flex items-center gap-1">
              <span
                class="size-[8px] rounded-full"
                :class="
                  branchStatus
                    ? 'bg-green dark:text-white'
                    : 'bg-primary dark:text-dark-primary'
                "
              />

              <span
                class="font-medium"
                :class="
                  branchStatus
                    ? 'text-green dark:text-white'
                    : 'text-primary dark:text-dark-primary'
                "
                >{{
                  branchStatus
                    ? $t("INPUTS.mainBranch")
                    : $t("INPUTS.unMainBranch")
                }}</span
              >
            </div>

            <Switcher
              id="userStatus"
              :status="branchStatus"
              @change="branchStatus = !branchStatus"
            />
          </div>
        </template>

        <div class="space-y-5">
          <div
            class="flex items-center justify-between rounded-2xl bg-light-bodyBg px-5 py-7 font-medium dark:bg-dark-bodyBg"
          >
            <div class="flex items-center gap-2">
              <SvgIcon icon="agents" />

              <h5 class="text-light-title dark:text-dark-title">
                {{ $t("TITLES.assignedAgents") }}
              </h5>
            </div>

            <h5 class="text-primary xl:text-lg">
              {{ branchAgents }} {{ $t("TITLES.agent") }}
            </h5>
          </div>

          <ValidInput
            id="name"
            :label="$t('LABELS.branchName')"
            :placeholder="$t('INPUTS.branchNamePlaceholder')"
            name="name"
          />

          <ValidInput
            id="phone"
            :label="$t('TITLES.phoneNumber')"
            :placeholder="$t('INPUTS.phoneNumberPlaceholder')"
            name="phone"
            isNumber
          />

          <ValidInput
            id="address"
            :label="$t('LABELS.branchAddress')"
            :placeholder="$t('INPUTS.branchAddressPlaceholder')"
            name="address"
          />
        </div>
      </FormModal>
    </Transition>
  </Teleport>
  <!-- End of th edit branch modal -->

  <!-- Start of the delete branch modal -->
  <Modal
    v-if="deleteBranchModal"
    :title="$t('TITLES.deleteBranch')"
    :text="$t('TEXTS.confirmDeleteBranch')"
    :btnText="$t('BUTTONS.delete')"
    :loading="deleteBranchLoading"
    @handleClick="handleDeleteBranch"
    @close="deleteBranchModal = false"
  />
  <!-- End of the delete branch form -->

  <Card
    :number="data.rows.length"
    :add="$t('BUTTONS.addNewBranch')"
    @handleAdd="
      file = null;
      branchStatus = false;
      addBranchModal = true;
    "
  >
    <!-- Start of the filters -->
    <div class="mb-5 grid grid-cols-12 gap-3 lg:mb-7">
      <div class="col-span-12 xl:col-span-8">
        <Search
          v-model="keyword"
          :placeholder="$t('INPUTS.nameSearchPlaceholder')"
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
          name="Branches"
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
        <template v-slot:address="data">
          <p
            class="max-w-[200px] truncate"
            :title="data.value.address"
            v-tooltip
          >
            {{ data.value.address }}
          </p>
        </template>

        <template v-slot:phone="data">
          <a
            v-if="data.value.phone"
            :href="`tel:${data.value.phone_code}${data.value.phone}`"
            class="underline"
            >+{{ data.value.phone_code }} {{ data.value.phone }}</a
          >
          <span v-else>{{ $t("TEXTS.notFound") }}</span>
        </template>

        <template v-slot:is_master="data">
          <div class="flex items-center gap-2">
            <span
              class="inline-block size-[5px] rounded-full"
              :class="data.value.is_master ? 'bg-[#13b76a]' : 'bg-primary'"
            />

            <span
              class="capitalize"
              :class="data.value.is_master ? 'text-[#13b76a]' : 'text-primary'"
              >{{
                data.value.is_master
                  ? $t("INPUTS.mainBranch")
                  : $t("INPUTS.unMainBranch")
              }}</span
            >
          </div>
        </template>

        <template v-slot:control="data">
          <div class="flex items-center justify-center gap-5">
            <button
              type="button"
              @click="
                branchToDeleteId = data.value.id;
                deleteBranchModal = true;
              "
            >
              <i
                class="fa-solid fa-trash-alt text-primary dark:text-dark-primary"
              />
            </button>

            <button
              type="button"
              @click="
                () => {
                  branchToEditId = data.value.id;
                  branchStatus = data.value.is_master;
                  branchAgents = data.value.agents_count;
                  branchInitialValues = {
                    name: data.value.name,
                    address: data.value.address,
                    phone: data.value.phone,
                  };
                  editBranchModal = true;
                }
              "
            >
              <i class="fa-solid fa-pen text-light-text dark:text-dark-text" />
            </button>
          </div>
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
                path: '/branches',
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
