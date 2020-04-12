<template>
  <footer id="AppFooter">
      <div class="container">
        <router-link :to="{ name: 'home' }" class="logo-font">Home</router-link>
        <span class="attribution">
          &copy; Guy Morton.
        </span>
      </div>
    </footer>
</template>
<script>
  export default {
    name: 'AppFooter',
  };
</script>
<style scoped>
</style>