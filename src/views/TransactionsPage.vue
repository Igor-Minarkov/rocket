<template>
  <div class="container">
    <h1 class="title">Transactions</h1>
    <div class="wrapper">
      <form @submit.prevent="handleSearch" class="search-form">
        <div>
          <label for="ticker">Ticker:</label>
          <input v-model="ticker" id="ticker" type="text" required />
          <button type="submit">Search</button>
        </div>
      </form>

      <div v-if="security">
        <h2>{{ security.name }} ({{ security.ticker }})</h2>
        <p>Current Price: {{ security.currentPrice || "N/A" }}</p>
        <p>Bid: {{ security.bid || "N/A" }}</p>
        <p>Ask: {{ security.ask || "N/A" }}</p>
        <p>Change (Value): {{ security.changeValue || "N/A" }}</p>
        <p>Change (Percentage): {{ security.changePercentage || "N/A" }}%</p>

        <form @submit.prevent="handleTransaction" class="transaction-form">
          <div>
            <label for="quantity">Quantity:</label>
            <input
              v-model.number="quantity"
              id="quantity"
              type="number"
              required
            />
          </div>
          <div>
            <label for="type">Transaction Type:</label>
            <select v-model="transactionType" id="type" required>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <button type="submit" :disabled="!isStockSupported">Submit</button>
          <p
            v-if="!isStockSupported"
            :disabled="!isStockSupported"
            class="unsupported-message"
          >
            Currently, this stock is not supported for transactions.
          </p>
        </form>
      </div>

      <p v-if="transactionMessage">{{ transactionMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import axios from "axios";
import { useTransactionsStore } from "@/stores/transactionsStore";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { apiUrl } from "@/config/config";
import Swal from "sweetalert2";

const ticker = ref("");
const quantity = ref(0);
const transactionType = ref("buy");
const security = ref(null);
const transactionMessage = ref("");
const loading = ref(false);

const transactionsStore = useTransactionsStore();
const portfolioStore = usePortfolioStore();

const isStockSupported = computed(() => {
  return !!(security.value && security.value.currentPrice);
});

const handleSearch = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`https://yfapi.net/v6/finance/quote`, {
      params: {
        symbols: ticker.value,
        region: "US",
        lang: "en",
      },
      headers: {
        "x-api-key": "tR16jbIZWi8iCvGBI261w6e7pRbfSa468P3o9ewb",
      },
    });

    if (response.data.quoteResponse.result.length) {
      const result = response.data.quoteResponse.result[0];
      security.value = {
        ticker: result.symbol,
        name: result.longName || result.shortName,
        bid: result.bid,
        ask: result.ask,
        currentPrice: result.regularMarketPrice,
        changeValue: result.regularMarketChange,
        changePercentage: result.regularMarketChangePercent,
      };
      transactionMessage.value = "";
    } else {
      transactionMessage.value =
        "Stock not found. Please enter a valid ticker.";
      security.value = null;
    }
  } catch (error) {
    transactionMessage.value = "Failed to search for the stock.";
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleTransaction = async () => {
  if (!security.value || quantity.value <= 0) {
    transactionMessage.value =
      "Please enter a valid quantity and search for a stock first.";
    return;
  }

  const transaction = {
    ticker: security.value.ticker,
    type: transactionType.value,
    quantity: quantity.value,
    price: security.value.currentPrice,
    date: new Date().toISOString(),
  };

  const result = await Swal.fire({
    title: `Are you sure you want to ${transactionType.value} ${quantity.value} shares of ${security.value.ticker}?`,
    text: "Please confirm your action.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, proceed",
    cancelButtonText: "No, cancel",
    confirmButtonColor: "#007bff",
  });

  // Check if the user confirmed the action
  if (!result.isConfirmed) {
    transactionMessage.value = "Transaction cancelled.";
    return;
  }

  try {
    const response = await axios.get(
      `${apiUrl}/portfolio?ticker=${security.value.ticker}`
    );
    const portfolioEntry = response.data[0];

    if (transactionType.value === "sell") {
      if (!portfolioEntry || portfolioEntry.quantity < transaction.quantity) {
        transactionMessage.value = "Not enough shares to sell.";
        return;
      }

      await handleSellTransaction(portfolioEntry, transaction);
    } else if (transactionType.value === "buy") {
      await handleBuyTransaction(portfolioEntry, transaction);
    }

    resetForm();
    portfolioStore.fetchPortfolio();
  } catch (error) {
    transactionMessage.value = "Transaction failed. Please try again.";
    console.error(error);
  }
};

const handleSellTransaction = async (portfolioEntry, transaction) => {
  await transactionsStore.addTransaction(transaction);
  const newQuantity = portfolioEntry.quantity - transaction.quantity;

  await axios.put(`${apiUrl}/portfolio/${portfolioEntry.id}`, {
    ...portfolioEntry,
    quantity: newQuantity,
  });

  transactionMessage.value = `Successfully sold ${transaction.quantity} shares of ${transaction.ticker}.`;
};

const handleBuyTransaction = async (portfolioEntry, transaction) => {
  await transactionsStore.addTransaction(transaction);

  if (portfolioEntry) {
    const newQuantity = portfolioEntry.quantity + transaction.quantity;
    const newCostBasis =
      portfolioEntry.costBasis + transaction.price * transaction.quantity;

    await axios.put(`${apiUrl}/portfolio/${portfolioEntry.id}`, {
      ...portfolioEntry,
      quantity: newQuantity,
      costBasis: newCostBasis,
    });
  } else {
    await axios.post(`${apiUrl}/portfolio`, {
      ticker: transaction.ticker,
      quantity: transaction.quantity,
      costBasis: transaction.price * transaction.quantity,
    });
  }

  transactionMessage.value = `Successfully purchased  ${transaction.quantity} shares of ${transaction.ticker}.`;
};

const resetForm = () => {
  ticker.value = "";
  quantity.value = 0;
  security.value = null;
  transactionType.value = "buy";
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* Form Styles */
.search-form label,
.transaction-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.search-form input,
.transaction-form input,
.transaction-form select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 13px;
}

/* Security Info Styles */
.security-info {
  margin-top: 20px;
}

.security-info h2 {
  margin: 0;
  font-size: 1.5em;
}

.security-info p {
  margin: 5px 0;
}

/* Messages */
.transaction-message {
  font-weight: bold;
  margin-top: 20px;
}

.unsupported-message {
  color: #dc3545;
  font-style: italic;
  margin-top: 10px;
}
</style>
