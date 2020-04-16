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
      id="map"
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
            Peak Covid-19 Cases
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
// import "core-js/modules/es6.number.constructor";
import { latLng } from "leaflet";
import { LMap, LTileLayer, LMarker, LPopup, LTooltip } from "vue2-leaflet";

import LeafletHeatmap from './Vue2LeafletHeatmap';
import Vue from 'vue';

export default {
  name: "MapPanel",
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
      zoom: 5,
      latLngArray: [
        [-30.742815, 116.809455, 1000],
[-31.1779236, 117.3829447, 1000],
[-32.1946026, 115.9948579, 42000],
[-21.141956, 149.1865149, 15000],
[-16.9404, 145.95891, 24000],
[-33.8342586, 117.1592598, 1000],
[-32.5302495, 115.7208782, 28000],
[-26.5925631, 118.4957043, 1000],
[-32.0178686, 115.7637593, 4000],
[-30.9180298, 118.2064301, 1000],
[-33.9784295, 115.7637655, 1000],
[-29.4410923, 116.2871278, 1000],
[-33.5813455, 120.0473501, 1000],
[-32.546135, 115.730308, 13000],
[-31.6417132, 117.4871435, 1000],
[-33.03700485, 151.529745522461, 50000],
[-34.0312587, 151.0567639, 88000],
[-28.4769459, 151.7052765, 1000],
[-29.6318995, 151.917285606653, 1000],
[-31.02375935, 150.203652729306, 1000],
[-29.31559945, 151.115181378667, 1000],
[-31.0798092, 152.842289, 1000],
[-32.4881159, 150.516408048667, 1000],
[-34.4188403, 149.584931235734, 1000],
[-28.79363905, 153.26708675123, 5000],
[-36.8164249, 149.711854831904, 9000],
[-28.61342775, 153.478355052524, 16000],
[-33.3147678, 117.7393632, 1000] 
      ],
      maxValue: 10,
      center: latLng( -33.8038169, 151.1997539),
      url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3V5bW9ydG9uIiwiYSI6ImNrOHkwNmg3bzAwMzkzZ3RibG9wem43N20ifQ.Lgs-FlpaE3S61_eGyTCEsQ',
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      withPopup: latLng(-33.8858088,151.10248109002),
      withTooltip: latLng(-33.8858088,151.10248109002),
      currentZoom: 11.5,
      currentCenter: latLng(-33.8858088,151.10248109002),
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
      alert("Thanks for clicking!");
    },
    setMapHeight() {
      var heightString = (window.innerHeight - document.getElementById("Navigation").offsetHeight - document.getElementById("AppHeader").offsetHeight - document.getElementById("AppFooter").offsetHeight) + 'px';
      document.getElementById("map").style.height = heightString; 
      console.log("map height set to "+heightString)
    },
    getHeatmapData() {
      var me = this;
      fetch('https://api.contactmap.me/locations/all/all')
        .then(
          function(response) {
            if (response.status !== 200) {
              console.log('Looks like there was a problem. Status Code: ' +
                response.status);
              return;
            }

            // Examine the text in the response
            response.json().then(function(data) {
              // console.log(data);
              // let newArray = [];
              for (var i=0; i<data.length; i++) {
                // console.log(data[i]);
                if (Object.prototype.hasOwnProperty.call(data[i],'lat') && Object.prototype.hasOwnProperty.call(data[i],'lng')) {
                  // me.latLngArray.push();
                  // LeafletHeatmap.addLatLng([data[i].lat,data[i].lng,data[i].cases*10]);
                  // L.HeatLayer.addLatLng([data[i].lat,data[i].lng,data[i].cases*100]);
                  Vue.set(me.latLngArray,i,[data[i].lat,data[i].lng,data[i].cases*100])
                }
              }
              // this.LMap.setZoom(3);
              // console.log(LMap.data);
              setTimeout(function() { window.dispatchEvent(new Event('resize')) }, 20);
              console.log(me.latLngArray);
              // me.latLngArray.items = newArray;
            });
          }
        )
        .catch(function(err) {
          console.log('Fetch Error :-S', err);
        });
    }
  },
  mounted() {
    this.setMapHeight();
    var me = this;
    window.addEventListener('resize', function() {
      me.setMapHeight()
    });
    this.getHeatmapData();
  }
};



</script>

<style scoped>

</style>