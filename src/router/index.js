import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../views/HomePage.vue";
import PortfolioPage from "../views/PortfolioPage.vue";
import TransactionsPage from "../views/TransactionsPage.vue";
import InstrumentHistory from "@/views/InstrumentHistory.vue";

const routes = [
  {
    path: "/",
    name: "HomePage",
    component: HomePage,
  },
  {
    path: "/portfolio",
    name: "PortfolioPage",
    component: PortfolioPage,
  },
  {
    path: "/transactions",
    name: "Transactions",
    component: TransactionsPage,
  },
  {
    path: "/instrument/:ticker",
    name: "InstrumentHistory",
    component: InstrumentHistory,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
