<template>
  <div id="app">
    <app-header />
    <navigation />
    <app-footer />
  </div>
</template>


<script>
// import HelloWorld from './components/HelloWorld.vue'
import { components } from 'aws-amplify-vue'
import AppHeader from '@/components/Header';
import Navigation from '@/components/Navigation';
import AppFooter from '@/components/Footer';

export default {
  name: 'app',
  components: {
    AppHeader, Navigation, AppFooter,
    ...components
  }
}

</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
#auth {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

</style>