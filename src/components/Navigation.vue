<template>
  <div id="Navigation" class="navbar navbar-light">
    <div class="container">
      <ul class="navbar-nav" style="padding: 0px 5px;">
        <li class="nav-item">
          <router-link to="/" class="nav-link" href="">Map</router-link>
        </li>
        <li class="nav-item active">
          <router-link to="/about" class="nav-link" href="">About</router-link>
        </li>
        <!-- <li class="nav-item">
          <router-link to="/settings" class="nav-link" href="">Settings</router-link>
        </li> -->
        <!-- <li class="nav-item" v-if="!signedIn">
          <router-link to="/login" class="nav-link">Log In</router-link>
        </li>
        <li class="nav-item" v-if="signedIn">
          <router-link to="/logout" class="nav-link">Log Out</router-link>
        </li> -->
      </ul>
    </div>
  </div>
</template>

<script>
  import { AmplifyEventBus } from 'aws-amplify-vue';

  export default {
    name: 'Navigation',
    data() {
      return {
        signedIn: false,
      };
    },
    async beforeCreate() {
      try {
        await this.$Amplify.Auth.currentAuthenticatedUser();
        this.signedIn = true;
      } catch (err) {
        this.signedIn = false;
      }
      AmplifyEventBus.$on('authState', (info) => {
        this.signedIn = info === 'signedIn';
      });
    },
  };
</script>

<style scoped>
  li {
    display: inline;
  }
  .router-link-exact-active {
    background-color: #2d3e50;
    font-weight: bold;
  }
  .navbar-nav {
    padding: 0px 1px;
  }
  .nav-item {
    list-style-type: none;
    padding: 0px 6px 0px 6px;
  }
  .nav-link {
    padding: 12px 20px;
    display: inline-block;
  }
  .navbar-nav {
    white-space: nowrap;
    background: grey;
    padding-inline-start: 0px;
    height: 46px;
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
