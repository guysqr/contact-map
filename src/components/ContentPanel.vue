<template>
  <div id="content-panel">
    <div id="sidebar" v-if="sidebar" v-bind:style="mainHeight">
      <div class="sidebar-info" v-bind:style="mainHeight">{{ sidebar }}</div>
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
      return { height: document.getElementById("mainContent").offsetHeight + 'px' };
    }

  }
};
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
}
</style>