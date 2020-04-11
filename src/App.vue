<template>
  <HelloWorld id="app" msg="hey there">
      <amplify-authenticator v-bind:authConfig="authConfig">
  <amplify-sign-in v-bind:signInConfig="signInConfig"></amplify-sign-in>
  </amplify-authenticator>
    
  </HelloWorld>

</template>

<script>
import HelloWorld from './components/Auth.vue'
// import { Auth } from 'aws-amplify-vue'
// import L from 'leaflet';
// import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';

export default {
  name: 'app',
  components: {
    HelloWorld
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
</style>