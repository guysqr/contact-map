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
          <router-link to="/settings" class="nav-link" href="">Settings</router-link>
        </li>
        <li class="nav-item" v-if="!signedIn">
          <router-link to="/login" class="nav-link">Log In</router-link>
        </li>
        <li class="nav-item" v-if="signedIn">
          <!-- <amplify-sign-out></amplify-sign-out> -->
          <router-link to="/logout" class="nav-link">Log Out</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { AmplifyEventBus } from "aws-amplify-vue";

  export default {
    name: "Navigation",
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
      AmplifyEventBus.$on("authState", (info) => {
        this.signedIn = info === "signedIn";
      });
    },
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
    padding: 0px 12px;
  }
  .nav-link {
    padding: 12px 10px;
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
