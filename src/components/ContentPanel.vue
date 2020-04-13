<template>
  <div id="content-panel">
    <div id="sidebar" v-if="sidebar" v-bind:style="mainHeight">
      <div class="sidebar-info" style="height: calc(100vh - 100px)">{{ sidebar }}</div>
    </div>
    <div v-bind:style="mainWidth"><router-view class="view" id="mainContent"></router-view></div>
  </div>
</template>

<script>
export default {
  name: 'ContentPanel',
  computed: {
    sidebar() {
        return this.$route.meta.sidebar
    },
    mainWidth() {
      if (this.$route.meta.sidebar) {
        return { width: "calc(100% - 150px)" }
      }
      return { width: "100%" };
    },
    mainHeight() {
      return { height: "calc(100% - 50px)" };
    }

  }
};

// function newFunction() {
//   return (window.innerHeight - document.getElementById("Navigation").offsetHeight - document.getElementById("AppHeader").offsetHeight - document.getElementById("AppFooter").offsetHeight) + 'px'
// }

</script>

<style scoped>
#content-panel {
  border: 0px solid black;
}
#sidebar {
  float: right;
  width: 130px;
  padding: 10px;
  text-align: center;
}
.sidebar-info {
  border: 1px solid grey;
  border-radius: 10px;
  background-color: #ddd;
  color: #333;
  padding: 10px;
}

</style>