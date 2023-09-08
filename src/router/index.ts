// Composables
import { createRouter, createWebHistory } from "vue-router";
import publicTab from "./publicTab";
import login from "./login";
declare module "vue-router" {
  interface RouteMeta {
    // 是可选的
    icon?: string;
    actors?: string[];
    title?: string;
  }
}
const routes = [
  {
    path: "/",
    component: () => import("@/layouts/full.vue"),
    children: [
      {
        path: "",
        component: () => import("@/layouts/contents.vue"),
        children: publicTab,
      },
      {
        path: ":tooth(github.com%2F[a-z0-9-]+%2F[a-z0-9-.]+)",
        component: () => import("@/layouts/contents.vue"),
        children: [
          {
            path: ":version",
            name: "InfoPage",
            component: () => import("@/views/Home/info.vue"),
          },
        ],
      },
      // {
      //   path: "/login",
      //   component: () => import("@/layouts/contents.vue"),
      //   children: login,
      // },
    ],
  },
  {
    path: "/:catchAll(.*)",
    name: "404",
    component: () => import(/* webpackChunkName: "common" */ "@/views/Common/404.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
router.beforeEach((to, from, next) => {
  // 根据路由元信息设置文档标题
  if (to.meta.title) {
    window.document.title = `${to.meta.title} - ${process.env.productName}`;
  } else {
    window.document.title = `${process.env.productName}`;
  }
  next();
});
export default router;