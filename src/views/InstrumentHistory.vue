<template>
  <div class="container">
    <h1 class="title">Transaction History for {{ ticker }}</h1>
    <div class="wrapper">
      <div v-if="transactionsStore.loading">Loading...</div>
      <div v-if="transactionsStore.error">{{ transactionsStore.error }}</div>

      <div v-if="!transactionsStore.loading && !transactionsStore.error">
        <ul v-if="filteredTransactions.length > 0">
          <li v-for="transaction in filteredTransactions" :key="transaction.id">
            {{ transaction.type === "sell" ? "Sold" : "Bought" }}
            {{ transaction.quantity }} shares at $ {{ transaction.price }} on
            {{ new Date(transaction.date).toLocaleDateString() }}.
          </li>
        </ul>
        <div v-else>
          <p>No transactions found for this instrument.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useTransactionsStore } from "@/stores/transactionsStore";

const route = useRoute();
const ticker = route.params.ticker;
const transactionsStore = useTransactionsStore();

onMounted(() => {
  transactionsStore.fetchTransactions();
});

const filteredTransactions = computed(() =>
  transactionsStore.transactions.filter(
    (transaction) => transaction.ticker === ticker
  )
);
</script>
