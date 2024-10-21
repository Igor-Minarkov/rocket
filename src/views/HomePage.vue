<template>
  <div class="container">
    <h1 class="title">Welcome back</h1>

    <!-- Portfolio Overview Section -->
    <section class="wrapper">
      <h2>Portfolio Overview</h2>
      <div
        v-if="portfolioLoading || transactionsLoading || securitiesLoading"
        class="loading"
      >
        Loading portfolio data...
      </div>
      <div
        v-else-if="portfolioError || transactionsError || securitiesError"
        class="error"
      >
        {{ portfolioError || transactionsError || securitiesError }}
      </div>
      <div v-else-if="computedPortfolio.length > 0">
        <div class="portfolio-data">
          <p><strong>Total Holdings:</strong> {{ computedPortfolio.length }}</p>
          <p>
            <strong>Total Market Value:</strong> ${{
              totalMarketValue.toFixed(2)
            }}
          </p>
          <p>
            <strong>Total Unrealized Profit/Loss:</strong> ${{
              totalUnrealizedProfitLoss.toFixed(2)
            }}
          </p>
          <p>
            <strong>Overall Return Rate:</strong>
            {{ overallReturnRate.toFixed(2) }}%
          </p>
        </div>
      </div>
      <div v-else>
        <p>Your portfolio is currently empty.</p>
      </div>
    </section>

    <!-- Recent Transactions Section -->
    <section class="wrapper">
      <h3>Recent Transactions</h3>
      <div v-if="transactionsLoading" class="loading">
        Loading recent transactions...
      </div>
      <div v-else-if="transactionsError" class="error">
        {{ transactionsError }}
      </div>
      <div v-else-if="recentTransactions.length > 0">
        <ul>
          <li v-for="transaction in recentTransactions" :key="transaction.id">
            {{ transaction.type === "sell" ? "Sold" : "Bought" }}
            {{ transaction.quantity }} shares of {{ transaction.ticker }} at ${{
              transaction.price
            }}
            on
            {{ new Date(transaction.date).toLocaleDateString() }}.
          </li>
        </ul>
      </div>
      <div v-else>
        <p>No recent transactions available.</p>
      </div>
    </section>

    <!-- Securities Error Handling -->
    <div v-if="securitiesError" class="error">
      <p>{{ securitiesError }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { useTransactionsStore } from "@/stores/transactionsStore";
import { useSecuritiesStore } from "@/stores/securitiesStore";

const portfolioStore = usePortfolioStore();
const transactionsStore = useTransactionsStore();
const securitiesStore = useSecuritiesStore();

onMounted(() => {
  transactionsStore.fetchTransactions();
  securitiesStore.fetchSecurities();
});

const portfolioLoading = computed(() => portfolioStore.loading);
const transactionsLoading = computed(() => transactionsStore.loading);
const securitiesLoading = computed(() => securitiesStore.loading);

const portfolioError = computed(() => portfolioStore.error);
const transactionsError = computed(() => transactionsStore.error);
const securitiesError = computed(() => securitiesStore.error);

// Function to calculate the portfolio from transactions
const calculatePortfolioFromTransactions = (transactions) => {
  if (!Array.isArray(transactions)) {
    return [];
  }

  const portfolioMap = new Map();

  transactions.forEach((transaction) => {
    const { ticker, type, quantity, price } = transaction;
    if (!portfolioMap.has(ticker)) {
      portfolioMap.set(ticker, { ticker, quantity: 0, costBasis: 0 });
    }

    const position = portfolioMap.get(ticker);

    if (type === "buy") {
      const totalCost = position.costBasis + price * quantity;
      position.quantity += quantity;
      position.costBasis = totalCost;
    } else if (type === "sell") {
      const averageCost = position.costBasis / position.quantity;
      position.quantity -= quantity;
      position.costBasis -= averageCost * quantity;
      if (position.quantity === 0) {
        position.costBasis = 0;
      }
    }

    portfolioMap.set(ticker, position);
  });

  return Array.from(portfolioMap.values()).filter(
    (position) => position.quantity > 0
  );
};

// Computed portfolio based on transactions
const computedPortfolio = computed(() => {
  return calculatePortfolioFromTransactions(transactionsStore.transactions);
});

// Map of securities for easy access
const securitiesMap = computed(() => {
  return securitiesStore.securities.reduce((map, sec) => {
    map[sec.ticker] = sec;
    return map;
  }, {});
});

// Current price of a security
const getCurrentPrice = (ticker) => {
  const security = securitiesMap.value[ticker];
  return security ? security.currentPrice : 0;
};

// Total Market Value
const totalMarketValue = computed(() => {
  return computedPortfolio.value.reduce((sum, item) => {
    const currentPrice = getCurrentPrice(item.ticker);
    return sum + currentPrice * (item.quantity || 0);
  }, 0);
});

// Total Cost Basis
const totalCostBasis = computed(() =>
  computedPortfolio.value.reduce((sum, item) => sum + (item.costBasis || 0), 0)
);

// Total Unrealized Profit/Loss
const totalUnrealizedProfitLoss = computed(
  () => totalMarketValue.value - totalCostBasis.value
);

// Overall Return Rate
const overallReturnRate = computed(() =>
  totalCostBasis.value > 0
    ? (totalUnrealizedProfitLoss.value / totalCostBasis.value) * 100
    : 0
);

// Recent Transactions
const recentTransactions = computed(() =>
  transactionsStore.transactions.slice(-5).reverse()
);
</script>

<style scoped>
.portfolio-data p {
  margin: 5px 0;
}

li:hover {
  background-color: #d1e7dd;
}
</style>
