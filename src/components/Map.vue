<template>
  <!-- <div style="height: calc(100vh - 200px); width: 100%"> -->
    <div class="map-panel">
      
      <!-- <p>First marker is placed at {{ withPopup.lat }}, {{ withPopup.lng }}. Window height= {{ mapHeight }}</p>
      <p>Center is at {{ currentCenter }} and the zoom is: {{ currentZoom }}</p>
      <button @click="showLongText">
        Toggle long popup
      </button>
      <button @click="showMap = !showMap">
        Toggle map
      </button> -->
    <!-- </div> -->
    <l-map
      v-if="showMap"
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      v-bind:style="mapStyles"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
    >
      <l-tile-layer
        :url="url"
        :attribution="attribution"
      />
      <LeafletHeatmap :lat-lng="latLngArray" :max="maxValue" :radius="15"></LeafletHeatmap>
      <l-marker :lat-lng="withPopup">
        <l-popup>
          <div @click="innerClick">
            I am a popup
            <p v-show="showParagraph">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
              sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi.
              Donec finibus semper metus id malesuada.
            </p>
          </div>
        </l-popup>
      </l-marker>
      <l-marker :lat-lng="withTooltip">
        <l-tooltip :options="{ permanent: true, interactive: true }">
          <div @click="innerClick">
            I am a tooltip
            <p v-show="showParagraph">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
              sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi.
              Donec finibus semper metus id malesuada.
            </p>
          </div>
        </l-tooltip>
      </l-marker>
      
    </l-map>
  </div>
</template>

<script>
import "core-js/modules/es6.number.constructor";
import { latLng } from "leaflet";
import { LMap, LTileLayer, LMarker, LPopup, LTooltip } from "vue2-leaflet";

import LeafletHeatmap from './Vue2LeafletHeatmap';
import { vueWindowSizeMixin } from 'vue-window-size';
 
export default {
  name: "MapPanel",
  mixins: [vueWindowSizeMixin],
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LeafletHeatmap,
    LTooltip
  },
  data() {
    return {
      zoom: 13,
      latLngArray: [[47.41322, -1.219482,100],[47.41322, -1.219482,100],[47.41322, -1.219482,10],[47.41322, -1.219482,100]],
      maxValue: 10,
      center: latLng(47.41322, -1.219482),
      url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3V5bW9ydG9uIiwiYSI6ImNrOHkwNmg3bzAwMzkzZ3RibG9wem43N20ifQ.Lgs-FlpaE3S61_eGyTCEsQ',
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      withPopup: latLng(47.41322, -1.219482),
      withTooltip: latLng(47.41422, -1.250482),
      currentZoom: 11.5,
      currentCenter: latLng(47.41322, -1.219482),
      showParagraph: false,
      accessToken: 'pk.eyJ1IjoiZ3V5bW9ydG9uIiwiYSI6ImNrOHkwNmg3bzAwMzkzZ3RibG9wem43N20ifQ.Lgs-FlpaE3S61_eGyTCEsQ',
      mapOptions: {
        zoomSnap: 0.5
      },
      showMap: true
    };
  },
  computed: {
    mapStyles: function () {
      return {
        height: '1200px'//(window.innerHeight - document.getElementById("Navigation").offsetHeight - document.getElementById("AppHeader").offsetHeight - document.getElementById("AppFooter").offsetHeight) + 'px'
      }
    },
  },
  methods: {
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    showLongText() {
      this.showParagraph = !this.showParagraph;
    },
    innerClick() {
      alert("Click!");
    }
  }
};
</script>

<style scoped>

</style>