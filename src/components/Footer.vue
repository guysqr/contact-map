<template>
  <footer id="AppFooter">
    <div class="container">
      <span class="attribution">
        Contact Map is an open source project and can be
        <a
          class="white"
          href="https://github.com/guysqr/contact-map"
          target="_blank"
        >forked on Github</a>. The
        <a class="white" href="https://api.contactmap.me/openapi.json" target="_blank">APIs</a> are also available for other developers to use free of charge for public-facing projects (see terms of use).
      </span>
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
  padding: 10px;
  font-size: smaller;
}
.white {
  color: white;
}
</style>