import { defineStore } from "pinia";
import axios from "axios";
import { apiUrl } from "@/config/config";

export const usePortfolioStore = defineStore("portfolioStore", {
  state: () => ({
    portfolio: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchPortfolio() {
      this.loading = true;
      try {
        const response = await axios.get(`${apiUrl}/portfolio`);
        this.portfolio = response.data;
        this.error = null;
      } catch (err) {
        this.error = "Failed to load portfolio";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
});
