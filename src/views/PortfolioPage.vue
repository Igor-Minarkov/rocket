<template>
  <div class="container">
    <h1 class="title">Portfolio</h1>

    <!-- Loading and Error Handling -->
    <div v-if="transactionsLoading || securitiesLoading" class="loading">
      Loading...
    </div>
    <div v-if="transactionsError || securitiesError" class="error">
      <p>Error loading data. Please try again later.</p>
    </div>

    <!-- Portfolio Table -->
    <div
      v-if="
        !transactionsLoading &&
        !securitiesLoading &&
        !transactionsError &&
        !securitiesError
      "
      class="wrapper"
    >
      <h2 class="subtitle">Positions</h2>
      <div v-if="computedPortfolio.length > 0" class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Quantity</th>
              <th>Cost Basis</th>
              <th>Market Value</th>
              <th>Unrealized Profit/Loss</th>
              <th>Unrealized Return Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="position in computedPortfolioWithCalculations"
              :key="position.ticker"
            >
              <td>
                <router-link
                  :to="{
                    name: 'InstrumentHistory',
                    params: { ticker: position.ticker },
                  }"
                >
                  {{ position.ticker }}
                </router-link>
              </td>
              <td>{{ position.quantity }}</td>
              <td>${{ position.costBasis.toFixed(2) }}</td>
              <td>${{ position.marketValue.toFixed(2) }}</td>
              <td
                :class="{
                  positive: position.unrealizedProfitLoss >= 0,
                  negative: position.unrealizedProfitLoss < 0,
                }"
              >
                ${{ position.unrealizedProfitLoss.toFixed(2) }}
              </td>
              <td
                :class="{
                  positive: position.unrealizedReturnRate >= 0,
                  negative: position.unrealizedReturnRate < 0,
                }"
              >
                {{ position.unrealizedReturnRate.toFixed(2) }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <p>You currently have no positions in your portfolio.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useTransactionsStore } from "@/stores/transactionsStore";
import { useSecuritiesStore } from "@/stores/securitiesStore";

const transactionsStore = useTransactionsStore();
const securitiesStore = useSecuritiesStore();

onMounted(() => {
  transactionsStore.fetchTransactions();
  securitiesStore.fetchSecurities();
});

const transactionsLoading = computed(() => transactionsStore.loading);
const securitiesLoading = computed(() => securitiesStore.loading);

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

// Function to get the current price of a security
const getCurrentPrice = (ticker) => {
  const security = securitiesMap.value[ticker];
  return security ? security.currentPrice : 0;
};

// Portfolio with calculations
const computedPortfolioWithCalculations = computed(() => {
  return computedPortfolio.value.map((position) => {
    const currentPrice = getCurrentPrice(position.ticker);
    const marketValue = currentPrice * (position.quantity || 0);
    const unrealizedProfitLoss = marketValue - (position.costBasis || 0);
    const unrealizedReturnRate =
      position.costBasis > 0
        ? (unrealizedProfitLoss / position.costBasis) * 100
        : 0;

    return {
      ...position,
      marketValue,
      unrealizedProfitLoss,
      unrealizedReturnRate,
    };
  });
});
</script>

<style scoped>
.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-top: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  text-align: left;
  border-bottom: 2px solid #ccc;
  padding: 8px;
}

tbody td {
  padding: 8px;
  border-bottom: 1px solid #eee;
}

th,
td {
  padding: 12px;
  text-align: left;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
}

td {
  transition: background-color 0.2s;
}

td:hover {
  background-color: #f1f1f1;
}

.positive {
  color: green;
}

.negative {
  color: red;
}
</style>
