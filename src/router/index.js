import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Login from '@/components/Auth';
import MapPanel from '@/components/Map';
import Settings from '@/components/Settings';

Vue.use(Router);

export default new Router({
  routes: [
    { path: '/', name: 'home', component: Home, meta: { title: "Homer" } },
    { path: '/login', name: 'login', component: Login, meta: { title: "Login", body: "Please log in" } },
    { path: '/map', name: 'map', component: MapPanel, meta: { title: "Contact Map", sidebar: "here's some explanatory text" } },
    { path: '/settings', name: 'settings', component: Settings, meta: { title: "" } },
    { path: '*', redirect: { name: 'home' } },
  ],
});