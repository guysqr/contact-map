import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Login from '@/components/Auth';
import Mapbox from '@/components/Map';
import Settings from '@/components/Settings';

Vue.use(Router);

export default new Router({
  routes: [
    { path: '/', name: 'home', component: Home, meta: { title: "Homer" } },
    { path: '/login', name: 'login', component: Login, meta: { title: "Login" } },
    { path: '/map', name: 'register', component: Mapbox, meta: { title: "Map" } },
    { path: '/settings', name: 'settings', component: Settings, meta: { title: "Settings" } },
    { path: '*', redirect: { name: 'home' } },
  ],
});