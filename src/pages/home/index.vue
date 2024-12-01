<script setup>
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import StatCard from "@/components/Cards/StatCard.vue";
import axios from "axios";

const i18n = useI18n();

const data = ref([
  {
    title: i18n.t("TITLES.numberOfAgents"),
    icon: "agents",
    number: 800,
    path: "/agents",
  },
  {
    title: i18n.t("TITLES.numberOfBranches"),
    icon: "branches",
    number: 20,
    path: "/branches",
  },
  {
    title: i18n.t("TITLES.totalTokens"),
    icon: "tokens",
    number: 30000,
    path: "/tokens",
  },
]);

/* Start of the function that fetch data */
const isLoading = ref(false);
async function fetchData() {
  isLoading.value = true;

  await axios
    .get("dashboard/home")
    .then((res) => {
      data.value[0].number = res.data.data.agents;
      data.value[1].number = res.data.data.branches;
      data.value[2].number = res.data.data.tokens_count;
    })
    .catch((e) => console.error(e))
    .finally(() => (isLoading.value = false));
}
/* End of the function fetch data */

onMounted(() => {
  fetchData();
});
</script>

<template>
  <Card>
    <div
      class="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-5 2xl:grid-cols-3"
    >
      <StatCard
        v-for="(stat, i) in data"
        :key="i"
        :icon="stat.icon"
        :data="stat"
        :loading="isLoading"
      />
    </div>
  </Card>
</template>
