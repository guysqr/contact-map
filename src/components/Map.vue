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
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
      ref="map"
      style="width:100%; height: 100vh;"
    >
      <l-tile-layer :url="url" :attribution="attribution" />
      <l-geo-json :geojson="geojson"></l-geo-json>
      <l-polygon :lat-lngs="activePolygon.latlngs" :color="activePolygon.color"></l-polygon>
      <LeafletHeatmap
        v-if="showHeatmap"
        :lat-lng="latLngArray"
        :max="1"
        :radius="10"
        :blur="15"
        :gradient="heatmapGradient"
        :minOpacity="0.6"
      ></LeafletHeatmap>
      <div v-if="showClusters">
        <l-marker
          v-for="c in cases"
          :lat-lng="c.latlng"
          :value="c.value"
          v-bind:key="c.id"
          :options="markerOptions"
          :ref="c.id"
        >
          <l-icon
            :icon="icon"
            :options="iconOptions"
            :iconSize="[c.iconSize, c.iconSize]"
            :iconAnchor="c.iconAnchor"
          ></l-icon>
          <l-tooltip :options="{ permanent: false, interactive: true }"
            >{{ c.value }} Covid-19 Cases<br />{{ c.place }}</l-tooltip
          >
        </l-marker>
      </div>
      <l-control-scale position="topright" :imperial="false" :metric="true"></l-control-scale>
      <l-control position="bottomleft">
        <button @click="clickHandler">
          Toggle Display
        </button>
      </l-control>
      <l-draw-toolbar position="topright" />
    </l-map>
  </div>
</template>

<script>
  import L from "leaflet";
  import { latLng } from "leaflet";
  import {
    LMap,
    LTileLayer,
    LMarker,
    LTooltip,
    LControl,
    LControlScale,
    LIcon,
    LPolygon,
    LGeoJson,
  } from "vue2-leaflet";

  import LeafletHeatmap from "./Vue2LeafletHeatmap";
  import Vue2LeafletDrawToolbar from "vue2-leaflet-draw-toolbar";
  import Vue from "vue";

  export default {
    name: "MapPanel",
    components: {
      LMap,
      LTileLayer,
      LMarker,
      LeafletHeatmap,
      LTooltip,
      LControl,
      LControlScale,
      LIcon,
      LPolygon,
      LGeoJson,
      "l-draw-toolbar": Vue2LeafletDrawToolbar,
    },
    data() {
      return {
        zoom: 5,
        showClusters: false,
        showHeatmap: true,
        heatmapGradient: { 0.3: "rgba(250,1,1,1)", 0.5: "rgba(250,1,1,1)", 1: "rgba(250,1,1,1)" },
        latLngArray: [],
        maxValue: 0.1,
        caseArray: [],
        locationIds: {},
        lgaPolygons: {},
        activePolygon: { color: "blue", latLngs: [] },
        geojson: {
          type: "Point",
          coordinates: [30, 10],
        },
        icon: L.icon({
          iconUrl: "https://www.contactmap.me/img/coronavirus.svg",
        }),
        iconOptions: {
          iconUrl: "https://www.contactmap.me/img/coronavirus.svg",
        },
        markerOptions: {},
        clusterOptions: {
          className: "cluster-css",
        },
        center: latLng(-33.8038169, 151.1997539),
        url:
          "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3V5bW9ydG9uIiwiYSI6ImNrOHkwNmg3bzAwMzkzZ3RibG9wem43N20ifQ.Lgs-FlpaE3S61_eGyTCEsQ",
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        withPopup: latLng(-37.799278, 145.059956),
        withTooltip: latLng(-33.8858088, 151.10248109002),
        currentZoom: 11.5,
        currentCenter: latLng(-33.8858088, 151.10248109002),
        showParagraph: false,
        accessToken: "pk.eyJ1IjoiZ3V5bW9ydG9uIiwiYSI6ImNrOHkwNmg3bzAwMzkzZ3RibG9wem43N20ifQ.Lgs-FlpaE3S61_eGyTCEsQ",
        mapOptions: {
          zoomSnap: 0.5,
        },
        showMap: true,
      };
    },
    computed: {
      cases: function() {
        return this.caseArray;
      },
    },
    methods: {
      clickHandler() {
        if (this.showClusters) {
          this.showHeatmap = true;
          this.showClusters = false;
        } else {
          this.showHeatmap = false;
          this.showClusters = true;
        }
      },
      // iconCreateFunction(cluster) {
      //   // console.log(cluster);
      //   var markers = cluster.getAllChildMarkers();
      //   // console.log(this.$refs.myCluster);
      //   console.log(this.$refs);
      //   this.$refs["case-2464"][0].$attrs.value;
      //   var n = 0;
      //   for (var i = 0; i < markers.length; i++) {
      //     // console.log(Vue.get(markers[i],'id'));
      //     n += parseInt(markers[i].options.icon.options.className);
      //   }
      //   var icon = L.divIcon({
      //     html: "<b>" + n + "</b>",
      //     iconSize: L.point(n, n),
      //   });
      //   // console.log(icon);
      //   // markers.refreshClusters();
      //   return icon;
      // },
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
        var heightString =
          window.innerHeight -
          document.getElementById("Navigation").offsetHeight -
          document.getElementById("AppHeader").offsetHeight -
          document.getElementById("AppFooter").offsetHeight +
          "px";
        document.getElementById("map").style.height = heightString;
        console.log("map height set to " + heightString);
      },
      getLocations() {
        var me = this;
        fetch("https://api.contactmap.me/geolocations")
          .then(function(response) {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            response.json().then(function(data) {
              Vue.set(me.locationIds, data);
              me.getHeatmapData();
              me.getLgaPolygon(142);
            });
          })
          .catch(function(err) {
            console.log("Fetch Error :-S", err);
          });
      },
      getLgaPolygon(id) {
        var me = this;
        fetch("https://api.contactmap.me/geometry/aust_lgas/" + id)
          .then(function(response) {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            response.json().then(function(data) {
              console.log(data.polygon);
              // let polygonArray = [];
              // for (var i=0; i< data.polygon.coordinates.length; i++) {
              //   polygonArray.push(latLng(data.polygon.coordinates[i]))
              // }
              // Vue.set(me.geojson, data.polygon);
              me.geojson = data.polygon;
            });
            // me.activePolygon = me.lgaPolygons[id];
            console.log(me.geojson);
          })
          .catch(function(err) {
            console.log("Fetch Error :-S", err);
          });
      },
      getHeatmapData() {
        var me = this;
        fetch("https://api.contactmap.me/locations/all/2020-04-16")
          .then(function(response) {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            response.json().then(function(data) {
              var index = 0;
              for (var i = 0; i < data.length; i++) {
                if (
                  Object.prototype.hasOwnProperty.call(data[i], "lat") &&
                  Object.prototype.hasOwnProperty.call(data[i], "lng")
                ) {
                  if (data[i].cases > 0) {
                    console.log(data[i])
                    let myIconSize = data[i].cases > 0 ? (Math.log(data[i].cases) / Math.log(10)) * 25 + 10 : 0;
                    Vue.set(me.latLngArray, index, [data[i].lat, data[i].lng, data[i].cases]);
                    Vue.set(me.caseArray, index, {
                      latlng: latLng(data[i].lat, data[i].lng),
                      id: "case-" + data[i].id,
                      iconSize: myIconSize,
                      value: data[i].cases.toString(),
                      place: data[i].place + " " + data[i].state,
                    });
                    index++;
                  }
                }
              }
              setTimeout(function() {
                window.dispatchEvent(new Event("resize"));
              }, 20);
            });
          })
          .catch(function(err) {
            console.log("Fetch Error :-S", err);
          });
      },
    },
    mounted() {
      this.setMapHeight();
      var me = this;
      window.addEventListener("resize", function() {
        me.setMapHeight();
      });
      this.getLocations();
    },
  };
</script>

<style>
  @import "~leaflet.markercluster/dist/MarkerCluster.css";
  @import "~leaflet.markercluster/dist/MarkerCluster.Default.css";
  #cluster-css {
    width: 40px;
    height: 40px;
    opacity: 0.2;
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
