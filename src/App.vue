<template>
  <div id="app">
    <!-- <navigation /> -->
    <app-header />
    <content-panel />
    <app-footer />
  </div>
</template>

<script>
  import { components } from 'aws-amplify-vue';
  import AppHeader from '@/components/Header';
  // import Navigation from '@/components/Navigation';
  import ContentPanel from '@/components/ContentPanel';
  import AppFooter from '@/components/Footer';

  // //Record a custom event
  // Analytics.record({
  //   name: 'Album',
  //   attributes: { genre: 'Rock', year: '1989' },
  // });
  export default {
    name: 'app',
    components: {
      AppHeader,
      // Navigation,
      ContentPanel,
      AppFooter,
      ...components,
    },
  };
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* text-align: center; */
    background-color: #2c3e50;
    color: #eeeeee;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    overflow: scroll;
  }
  #auth {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #e5eff8;
    margin-top: 60px;
  }
</style>
