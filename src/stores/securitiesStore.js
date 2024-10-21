import { defineStore } from "pinia";
import axios from "axios";
import { apiUrl } from "@/config/config";

export const useSecuritiesStore = defineStore({
  id: "securitiesStore",
  state: () => ({
    securities: [],
    loading: false,
    error: null,
  }),
  actions: {
    fetchSecurities() {
      this.loading = true;
      axios
        .get(`${apiUrl}/securities`)
        .then((response) => {
          this.securities = response.data;
          this.loading = false;
        })
        .catch((error) => {
          console.error("Error fetching securities:", error.message);
          this.error = error;
          this.loading = false;
        });
    },
  },
});
