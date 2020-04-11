<template>
  <HelloWorld id="app" />
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
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