import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Login from '@/components/Auth';
import Logout from '@/components/Logout';
import MapPanel from '@/components/Map';
import Settings from '@/components/Settings';

Vue.use(Router);

export default new Router({
  routes: [
    { path: '/', name: 'home', component: Home, meta: { title: "About" } },
    { path: '/login', name: 'login', component: Login, meta: { title: "Login", body: "Please log in" } },
    { path: '/logout', name: 'logout', component: Logout, meta: { title: "Logout", body: "Please log out" } },
    { path: '/map', name: 'map', component: MapPanel, meta: { title: "Contact Map" } },
    { path: '/settings', name: 'settings', component: Settings, meta: { title: "Settings" } },
    { path: '*', redirect: { name: 'map' } },
  ],
});