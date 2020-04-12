<template>
  <div id="Navigation" class="navbar navbar-light">
    <div class="container">
      <ul class="nav navbar-nav pull-xs-right">
        <li class="nav-item">
          <router-link to="/map" class="nav-link" href="">Map</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/register" class="nav-link" href="">Sign up</router-link>
        </li>
         <li class="nav-item">
          <router-link to="/login" class="nav-link">Sign in</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/settings" class="nav-link" href="">Settings</router-link>
        </li>
        <!-- Add "active" class when you're on that page" -->
        <li class="nav-item active">
          <router-link to="/" class="nav-link" href="">Home</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Navigation'
};
</script>

<style scoped>
.router-link-exact-active {
    background-color: red;
}
.nav-item {
    list-style-type: none;
    display: flex;
}
.navbar-nav {
    display:flexbox;
}
</style>