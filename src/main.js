import Vue from 'vue'
import App from './App.vue'
import Amplify, * as AmplifyModules from 'aws-amplify';
import { AmplifyPlugin } from 'aws-amplify-vue';
import { AmplifyEventBus } from 'aws-amplify-vue';
import aws_exports from './aws-exports';
import router from './router';
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';
import VueWindowSize from 'vue-window-size';

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);

Amplify.configure(aws_exports);
Vue.use(AmplifyPlugin, AmplifyModules, VueWindowSize);

Vue.config.productionTip = false

new Vue({
  router,
  components: {LMap, LTileLayer, LMarker},
  render: h => h(App),
}).$mount('#app')

AmplifyEventBus.$on('authState', info => {
  console.log(`Here is the auth event that was just emitted by an Amplify component: ${info}`)
});