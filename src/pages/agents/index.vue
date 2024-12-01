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

const baseURL = import.meta.env.VITE_API_URL;

const toast = useToast();

const authStore = useAuthStore();
const { profile } = storeToRefs(authStore);

/* Start of the filters */
function handleFilter(key, value) {
  router.push({
    path: route.path,
    query: Object.assign({}, route.query, {
      [key]: value,
    }),
  });
}

/* Search filter */
const keyword = ref(route.query.keyword || "");
watch(keyword, (value) => {
  handleFilter("keyword", value);
});
/* End of the search filter */

/* Status filter */
const status = ref(route.query.status || "");

const statusFilter = ref([
  {
    id: "new",
    name: i18n.t("INPUTS.new"),
  },
  {
    id: "active",
    name: i18n.t("INPUTS.active"),
  },
  {
    id: "deactivated",
    name: i18n.t("INPUTS.deactivated"),
  },
  {
    id: "expired",
    name: i18n.t("INPUTS.expired"),
  },
  {
    id: "training",
    name: i18n.t("INPUTS.training"),
  },
]);

watch(status, (value) => {
  const type = statusFilter.value.find((item) => item.name === value)?.id;

  handleFilter("status", type);
});
/* End of the status filter */

/* Tokens filter */
const minTokensNumber = ref(route.query.min_tokens_count || "");
watch(minTokensNumber, (value) => {
  handleFilter("min_tokens_count", value);
});

const maxTokensNumber = ref(route.query.max_tokens_count || "");
watch(maxTokensNumber, (value) => {
  handleFilter("max_tokens_count", value);
});
/* End of the tokens number filter */
/* End of the filters */

/* Start of the function that handle add new agent */
const addAgentModal = ref(false);

const file = ref(null);

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
  email: yup
    .string()
    .test("email", i18n.t("ERRORS.emailRequired"), (value) => {
      if (value) {
        return true;
      } else if (file.value) {
        return true;
      } else {
        return false;
      }
    })
    .test("email", i18n.t("ERRORS.invalidEmail"), (value) => {
      if (value) {
        if (file.value) return true;

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }

      return true;
    })
    .notRequired(),
  branch: yup
    .string()
    .test("branch", i18n.t("ERRORS.corporateBranchRequired"), (value) => {
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
    .test("phone", i18n.t("ERRORS.phoneRequired"), (value) => {
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
    .test("phone", i18n.t("ERRORS.phoneNumberLimit"), (value) => {
      if (value) {
        return value.length === 11;
      } else if (file.value) {
        return true;
      } else {
        return false;
      }
    })
    .notRequired(),
  secondPhone: yup
    .string()
    .test("secondPhone", i18n.t("ERRORS.phoneRequired"), (value) => {
      if (value) {
        return true;
      } else if (file.value) {
        return true;
      } else {
        return false;
      }
    })
    .test("secondPhone", i18n.t("ERRORS.invalidPhoneNumber"), (value) => {
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
    .test("secondPhone", i18n.t("ERRORS.phoneNumberLimit"), (value) => {
      if (value) {
        return value.length === 11;
      } else if (file.value) {
        return true;
      } else {
        return true;
      }
    })
    .notRequired(),
});

const addAgentLoading = ref(false);
async function handleAddAgent(values) {
  addAgentLoading.value = true;

  function handleSuccess() {
    toast.success(i18n.t("TEXTS.agentAddedSuccessfully"));

    addAgentModal.value = false;

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
      .post("dashboard/import_agents", data)
      .then(() => handleSuccess())
      .catch((e) => handleError(e))
      .finally(() => (addAgentLoading.value = false));
  } else {
    await axios
      .post("dashboard/agents", {
        name: values.name,
        email: values.email,
        phone_code: "20",
        phone: values.phone,
        second_phone: values.secondPhone,
        branch_id: values.branch,
      })
      .then(() => handleSuccess())
      .catch((e) => handleError(e))
      .finally(() => (addAgentLoading.value = false));
  }
}

/* Start of the function that get all branches */
const allBranches = ref([]);

const allBranchesLoading = ref(false);
async function getAllBranches() {
  allBranchesLoading.value = true;

  await axios
    .get("dashboard/branches-names")
    .then((res) => {
      if (res.data.data) {
        allBranches.value = res.data.data;
      }
    })
    .catch((e) => console.error(e))
    .finally(() => (allBranchesLoading.value = false));
}
/* End of the function that get all branches */
/* End of the function that handle add new agent */

/* Start of the function that handle assigning token */
const assignTokenModal = ref(false);

const agents = ref([]);

const assignTokenSchema = yup.object().shape({
  tokensNumber: yup
    .string()
    .required(i18n.t("ERRORS.tokensNumberRequired"))
    .test(
      "tokensNumber",
      i18n.t("ERRORS.numberMustBeGreaterThan0"),
      (value) => {
        return value && +value > 0;
      },
    )
    .test(
      "tokensNumber",
      i18n.t("ERRORS.tokensNumberMustBeLessThanOrEqualToYourTokens"),
      (value) => {
        return value <= profile.value.tokens_count;
      },
    ),
  agents: yup
    .array()
    .of(yup.string().required())
    .required(i18n.t("ERRORS.agentsRequired")),
});

const tokensNumber = ref(0);

const assignTokenLoading = ref(false);
async function handleAssignToken(values) {
  if (profile.value.tokens_count === 0) {
    return toast.error(i18n.t("ERRORS.buyTokenFirst"));
  }

  assignTokenLoading.value = true;

  const data = new FormData();

  data.append("number_of_tokens", values.tokensNumber);

  values.agents.forEach((agent, i) => {
    return data.append(`agent_ids[${i}]`, agent);
  });

  await axios
    .post("dashboard/assign-tokens", data)
    .then(() => {
      toast.success(i18n.t("TEXTS.tokensAssignedSuccessfully"));

      authStore.getProfileData();

      assignTokenModal.value = false;

      agents.value = [];

      tokensNumber.value = 0;

      fetchData();
    })
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (assignTokenLoading.value = false));
}
/* End of the function that handle assigning token */

/* Start of the function that handle paying application fee */
const payApplicationFeeModal = ref(false);

const applicationFeeSchema = yup.object().shape({
  users: yup
    .array()
    .of(yup.string().required())
    .required(i18n.t("ERRORS.usersRequired")),
});

const applicationFeeLoading = ref(false);
async function handlePayApplicationFee(values) {
  applicationFeeLoading.value = true;

  const data = new FormData();

  values.users.forEach((user, i) => {
    return data.append(`user_ids[${i}]`, user);
  });

  await axios
    .post("dashboard/submit_application", data)
    .then(() => {
      toast.success(i18n.t("TEXTS.subscriptionFeePaidSuccessfully"));

      payApplicationFeeModal.value = false;

      totalAgentsWithoutApplication.value = 0;

      getAgentsWithoutApplications();
    })
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (applicationFeeLoading.value = false));
}

/* Start of the function that get agents without applications */
const agentsWithoutApplication = ref([]);

const totalAgentsWithoutApplication = ref(0);

const agentsWithoutApplicationsLoading = ref(false);
async function getAgentsWithoutApplications() {
  agentsWithoutApplicationsLoading.value = true;

  await axios
    .get("dashboard/agents-without-application-fees")
    .then((res) => {
      if (res.data.data) {
        agentsWithoutApplication.value = res.data.data;
      }
    })
    .catch((e) => console.error(e))
    .finally(() => (agentsWithoutApplicationsLoading.value = false));
}
/* End of the function that get agents without applications */
/* End of the function that handle paying application fee */

/* Start of the function that handle paying package fee */
const payPackageFeeModal = ref(false);

const packageFeeSchema = yup.object().shape({
  package: yup.string().required(i18n.t("ERRORS.packageRequired")),
  users: yup
    .array()
    .of(yup.string().required())
    .required(i18n.t("ERRORS.usersRequired")),
});

/* Start of the function that get all packages */
const allPackages = ref([]);

const currentPackage = ref(null);

function setCurrentPackage(id) {
  currentPackage.value = allPackages.value.find((item) => item.id === id);
}

const totalAgentsWithoutPackages = ref(0);

const packagesLoading = ref(false);
async function getAllPackages() {
  packagesLoading.value = true;

  await axios
    .get("dashboard/all_packages")
    .then((res) => {
      if (res.data.data) {
        allPackages.value = res.data.data;
      }
    })
    .catch((e) => console.error(e))
    .finally(() => (packagesLoading.value = false));
}
/* End of the function that ge all packages */

/* Start of the function that get agents without applications */
const agentsWithoutPackages = ref([]);

const agentsWithoutPackagesLoading = ref(false);
async function getAgentsWithoutPackages() {
  agentsWithoutPackagesLoading.value = true;

  await axios
    .get("dashboard/agents-without-packages")
    .then((res) => {
      if (res.data.data) {
        agentsWithoutPackages.value = res.data.data;
      }
    })
    .catch((e) => console.error(e))
    .finally(() => (agentsWithoutPackagesLoading.value = false));
}
/* End of the function that get agents without applications */

const packageFeeLoading = ref(false);
async function handlePackageFee(values) {
  packageFeeLoading.value = true;

  const data = new FormData();

  data.append("package_id", values.package);
  data.append("plan_id", 1);

  values.users.forEach((user, i) => {
    data.append(`user_ids[${i}]`, user);
  });

  await axios
    .post("dashboard/submit_package", data)
    .then(() => {
      toast.success(i18n.t("TEXTS.packageFeePaidSuccessfully"));

      payPackageFeeModal.value = false;

      totalAgentsWithoutPackages.value = 0;

      currentPackage.value = null;

      getAgentsWithoutPackages();
    })
    .catch((e) => {
      console.error(e);

      toast.error(e.response.data.message);
    })
    .finally(() => (packageFeeLoading.value = false));
}
/* End of the function that handle paying package fee */

/*  Start of the function that get all agents for export */
const dataForExport = ref({});

async function getAllAgents() {
  await axios
    .get("dashboard/all_agents")
    .then((res) => {
      dataForExport.value = res.data.data.map((item) => {
        return {
          [i18n.t("TITLES.agentName")]: item.name,
          ["MLS ID"]: item.mls_id,
          [i18n.t("TITLES.creationDate")]: item.created_at,
          [i18n.t("LABELS.numberOfTokens")]: item.number_of_tokens,
          [i18n.t("TITLES.status")]: item.status,
        };
      });
    })
    .catch((e) => console.error(e));
}
/* End of the function that get all agents for export */

/* Start of the function that fetch data */
const allAgents = ref([]);

const data = ref({
  columns: [
    {
      label: i18n.t("TITLES.agentName"),
      field: "name",
    },
    {
      label: "MLS ID",
      field: "mls_id",
    },
    {
      label: i18n.t("TITLES.creationDate"),
      field: "created_at",
    },
    {
      label: i18n.t("LABELS.numberOfTokens"),
      field: "number_of_tokens",
    },
    {
      label: i18n.t("TITLES.status"),
      field: "status",
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
    .get("dashboard/agents", {
      params: {
        page: +route.query.page || 1,
        keyword: route.query.keyword || "",
        status: route.query.status || "",
        min_tokens_count: route.query.min_tokens_count || "",
        max_tokens_count: route.query.max_tokens_count || "",
      },
    })
    .then((res) => {
      if (res.data.data) {
        data.value.rows = res.data.data;

        allAgents.value = res.data.data.map((agent) => {
          return {
            id: agent.id,
            name: agent.name,
          };
        });

        totalPages.value = res.data.meta.last_page;

        perPage.value = res.data.meta.per_page;
      }
    })
    .catch((e) => console.error(e))
    .finally(() => (isLoading.value = false));

  await axios
    .get("dashboard/all_agents")
    .then((res) => {
      if (res.data.data) {
        dataForExport.value = res.data.data.map((item) => {
          return {
            [i18n.t("TITLES.agentName")]: item.name,
            ["MLS ID"]: item.mls_id,
            [i18n.t("TITLES.creationDate")]: item.created_at,
            [i18n.t("LABELS.numberOfTokens")]: item.number_of_tokens,
            [i18n.t("TITLES.status")]: item.status,
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

onMounted(() => {
  getAllAgents();

  getAllBranches();

  getAgentsWithoutApplications();

  getAgentsWithoutPackages();

  getAllPackages();
});
</script>

<template>
  <Teleport to="body">
    <Background
      v-if="
        addAgentModal ||
        assignTokenModal ||
        payApplicationFeeModal ||
        payPackageFeeModal
      "
    />

    <!-- Start of the add agent modal -->
    <Transition name="translate">
      <FormModal
        v-if="addAgentModal"
        :title="$t('BUTTONS.addNewAgent')"
        :loading="addAgentLoading"
        :schema="schema"
        :btnText="$t('BUTTONS.save')"
        @close="addAgentModal = false"
        @submit="handleAddAgent"
      >
        <div class="w-full space-y-3">
          <ValidInput
            id="name"
            :label="$t('LABELS.name')"
            :placeholder="$t('INPUTS.namePlaceholder')"
            name="name"
          />

          <ValidInput
            id="email"
            type="email"
            :label="$t('LABELS.email')"
            :placeholder="$t('INPUTS.emailPlaceholder')"
            name="email"
          />

          <ValidSelect
            id="branch"
            name="branch"
            class="lg:col-span-2"
            :label="$t('LABELS.corporateBranch')"
            :loading="addAgentLoading"
            :placeholder="$t('INPUTS.selectBranch')"
            :options="allBranches"
          />

          <ValidInput
            id="phone"
            class="col-span-12 xl:col-span-6"
            name="phone"
            isNumber
            :label="$t('LABELS.personalNumber')"
            placeholder="00 000 000 000"
          />

          <ValidInput
            id="secondPhone"
            class="col-span-12 xl:col-span-6"
            name="secondPhone"
            isNumber
            :label="$t('LABELS.corporateNumber')"
            placeholder="00 000 000 000"
          />
        </div>

        <div class="my-5 flex w-full flex-col items-center gap-2">
          <a
            :href="`${baseURL}/general/export_agents`"
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
    <!-- End of the add agent modal -->

    <!-- Start of the assign token modal -->
    <Transition name="translate">
      <FormModal
        v-if="assignTokenModal"
        :title="$t('TITLES.assignTokenTo')"
        :loading="assignTokenLoading"
        :schema="assignTokenSchema"
        :btnText="$t('BUTTONS.confirm')"
        @close="
          assignTokenModal = false;
          agents = [];
        "
        @submit="handleAssignToken"
      >
        <div class="space-y-5">
          <div class="flex flex-col items-start gap-2">
            <h5 class="text-light-title dark:text-dark-title">
              {{ $t("TITLES.availableTokens") }}
            </h5>

            <div
              class="flex w-full items-center justify-center rounded-2xl bg-light-bodyBg px-5 py-7 font-medium text-primary dark:bg-dark-bodyBg"
            >
              {{ profile.tokens_count }} {{ $t("NAV.tokens") }}
            </div>
          </div>

          <ValidMultiSelect
            name="agents"
            search
            :options="allAgents"
            :title="$t('NAV.agents')"
            :noOptionsText="$t('TEXTS.noAgents')"
            @select="agents = $event"
          />

          <ValidInput
            id="tokensNumber"
            :label="$t('LABELS.numberOfToken')"
            :placeholder="$t('INPUTS.numberOfTokenPlaceholder')"
            name="tokensNumber"
            isNumber
            v-model="tokensNumber"
          />

          <div
            class="rounded-xl border border-light-border p-3 dark:border-dark-border"
          >
            <h5 class="mb-2 text-light-text dark:text-dark-text">
              {{ $t("TITLES.totalTokens") }}
            </h5>

            <div
              class="flex flex-wrap items-start gap-1.5 font-semibold text-black dark:text-white"
            >
              <span
                >{{ agents.length }} x {{ tokensNumber || 0 }} =
                {{ agents.length * tokensNumber || 0 }}</span
              >

              <span>{{ $t("TEXTS.tokenWillBeAssigned") }}</span>
            </div>
          </div>
        </div>
      </FormModal>
    </Transition>
    <!-- End of the assign token modal -->

    <!-- Start of the pay application fee modal -->
    <Transition name="translate">
      <FormModal
        v-if="payApplicationFeeModal"
        :title="$t('BUTTONS.payApplicationFee')"
        :loading="applicationFeeLoading"
        :btnText="$t('BUTTONS.pay')"
        :schema="applicationFeeSchema"
        @close="
          payApplicationFeeModal = false;
          totalAgentsWithoutApplication = 0;
        "
        @submit="handlePayApplicationFee"
      >
        <div
          class="space-y-5 rounded-2xl border border-light-border p-3 dark:border-dark-border"
        >
          <h5
            class="border-b border-light-border pb-2 font-semibold text-black dark:border-dark-border dark:text-white"
          >
            {{ $t("TITLES.mlsSubscription") }}
          </h5>

          <ValidMultiSelect
            name="users"
            search
            :options="agentsWithoutApplication"
            :title="$t('NAV.agents')"
            :noOptionsText="$t('TEXTS.noAgents')"
            @select="totalAgentsWithoutApplication = $event.length"
          />

          <div
            class="flex flex-col items-start gap-2"
            :class="
              totalAgentsWithoutApplication > 0
                ? 'border-b border-light-border pb-2 dark:border-dark-border'
                : ''
            "
          >
            <h5 class="font-medium text-light-text dark:text-dark-text">
              {{ $t("TITLES.subscriptionPrice") }}
            </h5>

            <h5 class="font-semibold text-black dark:text-white">
              {{ profile.application_fees }}
              {{ i18n.locale === "ar" ? "ج.م" : "EGP" }}
            </h5>
          </div>

          <div
            v-if="totalAgentsWithoutApplication > 0"
            class="flex flex-col items-start gap-2"
          >
            <h5 class="font-medium text-light-text dark:text-dark-text">
              {{ $t("TITLES.totalCost") }}
            </h5>

            <h5 class="font-semibold text-black dark:text-white">
              {{ profile.application_fees }} x
              {{ totalAgentsWithoutApplication }} =
              {{ profile.application_fees * totalAgentsWithoutApplication }}
              {{ i18n.locale === "ar" ? "ج.م" : "EGP" }}
            </h5>
          </div>
        </div>
      </FormModal>
    </Transition>
    <!-- End of the pay application fee modal -->

    <!-- Start of the pay package fee modal -->
    <Transition name="translate">
      <FormModal
        v-if="payPackageFeeModal"
        :title="$t('BUTTONS.payPackageFee')"
        :loading="packageFeeLoading"
        :btnText="$t('BUTTONS.pay')"
        :schema="packageFeeSchema"
        @submit="handlePackageFee"
        @close="
          payPackageFeeModal = false;
          totalAgentsWithoutPackages = 0;
          currentPackage = null;
        "
      >
        <div
          class="space-y-5 rounded-2xl border border-light-border p-3 dark:border-dark-border"
        >
          <div
            class="flex flex-col items-start gap-2 border-b border-light-border pb-2 dark:border-dark-border"
          >
            <ValidSelect
              id="package"
              name="package"
              class="w-full"
              :label="$t('TITLES.package')"
              :loading="packagesLoading"
              :placeholder="$t('INPUTS.selectPackage')"
              :options="allPackages"
              @select="setCurrentPackage"
            />
          </div>

          <div
            class="flex flex-col items-start gap-2"
            :class="
              currentPackage &
              'border-b border-light-border pb-2 dark:border-dark-border'
            "
          >
            <h5 class="font-medium text-light-text dark:text-dark-text">
              {{ $t("LABELS.agentsNumber") }}
            </h5>

            <ValidMultiSelect
              class="w-full"
              name="users"
              search
              :options="agentsWithoutPackages"
              :title="$t('NAV.agents')"
              :noOptionsText="$t('TEXTS.noAgents')"
              @select="totalAgentsWithoutPackages = $event.length"
            />
          </div>

          <div
            v-if="currentPackage"
            class="flex flex-col items-start gap-2 border-b border-light-border pb-2 dark:border-dark-border"
          >
            <h5 class="font-medium text-light-text dark:text-dark-text">
              {{ $t("TITLES.packagePrice") }}
            </h5>

            <h5 class="font-semibold text-black dark:text-white">
              {{ currentPackage.price }}
              {{ i18n.locale === "ar" ? "ج.م" : "EGP" }}
            </h5>
          </div>

          <div v-if="currentPackage" class="flex flex-col items-start gap-2">
            <h5 class="font-medium text-light-text dark:text-dark-text">
              {{ $t("TITLES.totalCost") }}
            </h5>

            <h5 class="font-semibold text-black dark:text-white">
              {{ currentPackage.price }} * {{ totalAgentsWithoutPackages }} =
              {{ currentPackage.price * totalAgentsWithoutPackages }}
              {{ i18n.locale === "ar" ? "ج.م" : "EGP" }}
            </h5>
          </div>
        </div>
      </FormModal>
    </Transition>
    <!-- End of the pay package fee modal -->
  </Teleport>

  <Card
    specialBtn
    icon="add"
    :number="allAgents.length"
    :button="$t('BUTTONS.addNewAgent')"
    @handleClick="addAgentModal = true"
  >
    <!-- Start of the filters -->
    <div class="grid grid-cols-12 gap-3">
      <div class="col-span-12 xl:col-span-8">
        <Search
          v-model="keyword"
          :placeholder="$t('INPUTS.agentNameOrMlsIdSearch')"
          :disabled="isLoading"
        />
      </div>

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
        <Search
          v-model="minTokensNumber"
          :placeholder="$t('INPUTS.minTokensCount')"
          :disabled="isLoading"
        />
      </div>

      <div class="col-span-12 xl:col-span-4">
        <Search
          v-model="maxTokensNumber"
          :placeholder="$t('INPUTS.maxTokensCount')"
          :disabled="isLoading"
        />
      </div>
    </div>
    <!-- End of the filters -->

    <div class="my-5 flex flex-wrap items-center gap-3 lg:my-7">
      <Button
        :text="$t('BUTTONS.assignToken')"
        class="btn"
        @click="assignTokenModal = true"
      />

      <Button
        :text="$t('BUTTONS.payApplicationFee')"
        class="btn"
        @click="payApplicationFeeModal = true"
      />

      <Button
        :text="$t('BUTTONS.payPackageFee')"
        class="btn"
        @click="payPackageFeeModal = true"
      />
    </div>

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
          name="Agents"
          class="w-full lg:w-fit"
          :data="dataForExport"
          :rtl="i18n.locale.value === 'ar'"
        >
          <button
            type="button"
            class="mb-5 w-full rounded-full bg-primary px-7 py-3 text-white"
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
        <template v-slot:mls_id="data">
          {{ data.value.mls_id || $t("TEXTS.notFound") }}
        </template>

        <template v-slot:status="data">
          <div class="flex items-center gap-2">
            <span
              class="inline-block size-[5px] rounded-full"
              :class="[data.value.status === 'new' && 'bg-primary']"
            />

            <span
              class="capitalize"
              :class="[data.value.status === 'new' && 'text-primary']"
              >{{ data.value.status }}</span
            >
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

<style scoped lang="scss">
.btn {
  @apply w-full rounded-3xl px-10 lg:w-fit;
}
</style>
