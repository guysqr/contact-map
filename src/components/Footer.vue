<template>
  <footer id="AppFooter" style="height:">
    <div class="attribution">
      Contact Map is an open source project and can be
      <a
        class="white"
        href="https://github.com/guysqr/contact-map"
        target="_blank"
      >forked on Github</a>. The
      <a class="white" href="https://developers.contactmap.me/" target="_blank">APIs</a> are also available for other developers to use free of charge for public-facing projects (see terms of use).
    </div>
  </footer>
</template>
<script>
export default {
  name: "AppFooter"
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