import Vue from "vue";
import App from "./App.vue";
import {
  Amplify
} from "aws-amplify";
import {
  AmplifyPlugin
} from "aws-amplify-vue";
import {
  AmplifyEventBus
} from "aws-amplify-vue";
import aws_exports from "./aws-exports";
import router from "./router";
import {
  LMap,
  LTileLayer,
  LMarker
} from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
import VueWindowSize from "vue-window-size";
// import VueMoment from 'vue-moment';
import {
  library
} from '@fortawesome/fontawesome-svg-core'
import {
  faAngleDoubleRight,
  faAngleDoubleLeft,
  faCopy,
  faLink,
  faEye,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons'
import {
  FontAwesomeIcon
} from '@fortawesome/vue-fontawesome'
import L from 'leaflet';
require('leaflet/dist/leaflet.css');
import GridLoader from 'vue-spinner/src/GridLoader.vue';
import './registerServiceWorker'

// FIX leaflet's default icon path problems with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

Vue.component("l-map", LMap);
Vue.component("l-tile-layer", LTileLayer);
Vue.component("l-marker", LMarker);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('pulse-loader', GridLoader);

library.add(faAngleDoubleRight);
library.add(faAngleDoubleLeft);
library.add(faCopy);
library.add(faLink);
library.add(faEye);
library.add(faCheckCircle);

Amplify.configure(aws_exports);
Vue.use(AmplifyPlugin, VueWindowSize); //VueMoment,AmplifyModules, 

Vue.config.productionTip = false;

new Vue({
  router,
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  render: (h) => h(App),
}).$mount("#app");

AmplifyEventBus.$on("authState", (info) => {
  console.log(`Here is the auth event that was just emitted by an Amplify component: ${info}`);
});