import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Login from '@/components/Auth';
import Logout from '@/components/Logout';
import MapPanel from '@/components/Map';
import Settings from '@/components/Settings';

Vue.use(Router);

export default new Router({
  routes: [{
      path: '/',
      name: 'home',
      component: MapPanel,
      meta: {
        title: "Contact Map"
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: "Contact Map: Login",
        body: "Please log in"
      }
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout,
      meta: {
        title: "Contact Map: Logout",
        body: "Please log out"
      }
    },
    {
      path: '/about',
      name: 'map',
      component: Home,
      meta: {
        title: "Contact Map: About"
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: {
        title: "Contact Map: Settings"
      }
    },
    {
      path: '*',
      redirect: {
        name: 'home'
      }
    },
  ],
});