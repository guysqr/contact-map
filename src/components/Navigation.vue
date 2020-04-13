<template>
  <div id="Navigation" class="navbar navbar-light">
    <div class="container">
      <ul class="navbar-nav">
        <li class="nav-item active">
          <router-link to="/" class="nav-link" href="">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/map" class="nav-link" href="">Map</router-link>
        </li>
         <li class="nav-item">
          <router-link to="/login" class="nav-link">Log in</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/settings" class="nav-link" href="">Settings</router-link>
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
li {
  display: inline;
}
.router-link-exact-active {
    background-color: #333;
}
.nav-item {
  list-style-type: none;
  padding: 10px;
  height: 44px;
}
.nav-link {
  padding: 10px;
  display: inline-block;
}
.navbar-nav {
  white-space:nowrap;
  background: grey;
  padding-inline-start: 0px;
  height: 40px;
}
.container {
  float: right;
  height: 40px;
}
a {
  color: white;
  text-decoration: none;
}
</style>