import { defineStore } from "pinia";
import axios from "axios";
import { apiUrl } from "@/config/config";

export const useTransactionsStore = defineStore("transactionsStore", {
  state: () => ({
    transactions: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchTransactions() {
      this.loading = true;
      try {
        const response = await axios.get(`${apiUrl}/transactions`);
        this.transactions = response.data;
        this.error = null;
      } catch (err) {
        this.error = "Failed to load transactions";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async addTransaction(transaction) {
      try {
        await axios.post(`${apiUrl}/transactions`, transaction);
        this.transactions.push(transaction);
        this.error = null;
      } catch (err) {
        this.error = "Failed to add transaction";
        console.error(err);
      }
    },
  },
});
