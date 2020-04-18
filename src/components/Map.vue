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
      ref="map"
    >
      <l-tile-layer
        :url="url"
        :attribution="attribution"
      />
      <LeafletHeatmap v-if="showHeatmap" :lat-lng="latLngArray" :max="maxValue" :radius="15"></LeafletHeatmap>
      <!-- <l-marker :lat-lng="withPopup">
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
      </l-marker>-->
      <!-- <l-marker :lat-lng="withTooltip">
        
      </l-marker>  -->
      <!-- <v-marker-cluster v-if="showClusters" :options="clusterOptions" ref="myCluster" > -->
        <l-marker v-for="c in cases" :lat-lng="c.latlng" :value="c.value" v-bind:key="c.id" :options="markerOptions" :ref="c.id" >
          <l-icon :icon="icon" :options="iconOptions" :iconSize="[c.iconSize,c.iconSize]" :iconAnchor="c.iconAnchor"></l-icon>
          <!-- <l-popup :content="c.value" :lat-lng="c.latlng" :options="{ permanent: true, interactive: true }"></l-popup> -->
          <l-tooltip :options="{ permanent: false, interactive: true }">
          <!-- <div @click="innerClick"> -->
            {{c.value}} Covid-19 Cases
            <!-- <p v-show="showParagraph">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
              sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi.
              Donec finibus semper metus id malesuada.
            </p> -->
          <!-- </div> -->
        </l-tooltip>
        </l-marker>
      <!-- </v-marker-cluster> -->
      <l-control-scale position="topright" :imperial="false" :metric="true"></l-control-scale>
      <l-control position="bottomleft" >
        <button @click="clickHandler" >
          Toggle Display
        </button>
      </l-control>
      <l-draw-toolbar position="topright"/>
    </l-map>
  </div>
</template>

<script>
// import "core-js/modules/es6.number.constructor";LPopup, 
import L from "leaflet";
import { latLng } from "leaflet";
import { LMap, LTileLayer, LMarker, LTooltip, LControl, LControlScale, LIcon } from "vue2-leaflet";

import LeafletHeatmap from './Vue2LeafletHeatmap';
// import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster'
import Vue2LeafletDrawToolbar from 'vue2-leaflet-draw-toolbar';
import Vue from 'vue';

// L.Icon.Default.mergeOptions({  
//   iconRetinaUrl: require('./../assets/cv2.jpg'),  
//   iconUrl: require('./../assets/cv2.jpg')
// })


export default {
  name: "MapPanel",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    // LPopup,
    LeafletHeatmap,
    LTooltip,
    LControl,
    LControlScale,
    LIcon,
    'l-draw-toolbar': Vue2LeafletDrawToolbar,
    // 'v-marker-cluster': Vue2LeafletMarkerCluster
  },
  data() {
    return {
      zoom: 5,
      showClusters: false,
      showHeatmap: true,
      latLngArray: [],
      maxValue: .1,
      caseArray: [],
      icon: L.icon({
        iconUrl: 'https://www.contactmap.me/img/coronavirus.svg',
        // iconSize: [32, 37],
        // iconAnchor: [16, 37]
      }),
      iconOptions: {
        iconUrl: "https://www.contactmap.me/img/coronavirus.svg",
        // iconSize: [32, 32],
        // iconAnchor: [16, 16],
        // tooltipAnchor:[0,0]
      },
      markerOptions: { },
      clusterOptions: {
        className: "cluster-css",
        // iconCreateFunction: this.iconCreateFunction
      },
      center: latLng(-33.8038169, 151.1997539),
      url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3V5bW9ydG9uIiwiYSI6ImNrOHkwNmg3bzAwMzkzZ3RibG9wem43N20ifQ.Lgs-FlpaE3S61_eGyTCEsQ',
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      withPopup: latLng(-37.799278, 145.059956),
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
    cases: function() {
      return this.caseArray;
    }
  },
  methods: {
    clickHandler() {
      if(this.showClusters) {
        this.showHeatmap = true;
        this.showClusters = false;
      }
      else {
        this.showHeatmap = false;
        this.showClusters = true;
      }
    },
    iconCreateFunction(cluster) {
      // console.log(cluster);
      var markers = cluster.getAllChildMarkers();
      // console.log(this.$refs.myCluster);
      console.log(this.$refs);
      this.$refs['case-2464'][0].$attrs.value
      var n = 0;
      for (var i = 0; i < markers.length; i++) {
        // console.log(Vue.get(markers[i],'id'));
        n += parseInt(markers[i].options.icon.options.className);
      }
      var icon = L.divIcon({ html: '<b>' + n + '</b>', iconSize: L.point(n, n) });
      // console.log(icon);
      // markers.refreshClusters();
      return icon;
    },
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
      fetch('https://api.contactmap.me/locations/all/2020-04-16')
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
                  let myIconSize = data[i].cases > 0 ? Math.log(data[i].cases)/Math.log(10) * 15 + 10 : 0;
                  Vue.set(me.latLngArray,i,[data[i].lat,data[i].lng,data[i].cases])
                  Vue.set(me.caseArray,i,{ latlng: latLng(data[i].lat,data[i].lng), id: 'case-'+data[i].id, iconSize: myIconSize, value: data[i].cases.toString() } )
                }
              }
              // this.LMap.setZoom(3);
              // console.log(LMap.data);
              setTimeout(function() { window.dispatchEvent(new Event('resize')) }, 20);
              console.log(me.latLngArray);
              console.log(me.caseArray);
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

<style>
@import "~leaflet.markercluster/dist/MarkerCluster.css";
@import "~leaflet.markercluster/dist/MarkerCluster.Default.css";
#cluster-css {
    width: 40px;
    height: 40px;
    /* background-color: greenyellow; */
    text-align: center;
    font-size: 24px;
    border: 1px solid black;
    background-color: red;
    border-radius: 40px;
}

.leaflet-div-icon {
  border-radius: 20px;
  background: #fd0000;
  border: 1px solid #666;
  color: white;
}
</style>