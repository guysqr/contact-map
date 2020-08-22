<template>
  <footer v-if="notMobile" id="AppFooter">
    <div class="attribution">
      Contact Map is an open source project and can be
      <a class="white" href="https://github.com/guysqr/contact-map" target="_blank">forked on Github</a>. The <a class="white" href="https://developers.contactmap.me/" target="_blank">APIs</a> are also available for other developers to use free of charge for public-facing projects (see terms of use).
    </div>
  </footer>
</template>
<script>
  import Vue from 'vue';
  import device from 'vue-device-detector';
  Vue.use(device);
  console.log(Vue.$device);

  export default {
    name: 'AppFooter',
    data() {
      return {
        notMobile: !Vue.$device.mobile,
      };
    },
    methods: {

    },
  };
</script>
<style scoped>
  .attribution {
    padding: 5px;
    font-size: smaller;
    text-align: center;
  }
  .white {
    color: white;
  }
</style>
