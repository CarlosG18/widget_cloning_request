import { createRouter, createWebHashHistory } from "vue-router";
//import FormsView from "../views/Forms.vue";
import BasicView from "../views/Basic.vue";
//import HomeView from "../views/Home.vue";

const router = createRouter({
  //history: createWebHashHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),

  routes: [
    {
      path: "/",
      name: "Home",
      component: BasicView,
    },
    // {
    //   path: "/oauth",
    //   name: "oauth",
    //   component: FormsView,
    // },
    // {
    //   path: "/basic",
    //   name: "basic",
    //   component: BasicView,
    // },
  ],
});

export default router;
