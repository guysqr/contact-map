import Vue from 'vue'
import App from './App.vue'
import Amplify, * as AmplifyModules from 'aws-amplify';
import { AmplifyPlugin } from 'aws-amplify-vue';
import { AmplifyEventBus } from 'aws-amplify-vue';
import aws_exports from './aws-exports';


Amplify.configure(aws_exports);
Vue.use(AmplifyPlugin, AmplifyModules);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

AmplifyEventBus.$on('authState', info => {
  console.log(`Here is the auth event that was just emitted by an Amplify component: ${info}`)
});