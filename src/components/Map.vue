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
        ref="heatmap"
      ></LeafletHeatmap>
      <div v-if="showClusters">
        <l-marker
          v-for="c in cases"
          :lat-lng="c.latlng"
          :value="c.value"
          v-bind:key="c.id"
          :options="markerOptions"
          ref="c.id"
          @click="getPolygon(c.geometry_table,c.geometry_table_id)"
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
      <l-control position="topleft">
        <button @click="clickHandler">
          Toggle Display
        </button>
      </l-control>
      <l-control position="topleft">
        <dynamic-select
          :options="filteredLocationsArray"
          @input="setMapLocation"
          option-value="latlng"
          option-text="label"
          placeholder="type to search"
        >
        </dynamic-select>
      </l-control>
      <l-control position="topleft">
        <dynamic-select
          :options="datesArray"
          v-model="selectedDate"
          @input="setDate"
          option-value="value"
          option-text="label"
        >
        </dynamic-select>
      </l-control>
      <l-control position="topleft">
        <dynamic-select
          :options="statesArray"
          v-model="selectedState"
          @input="setState"
          option-value="value"
          option-text="label"
        >
        </dynamic-select>
      </l-control>
      <l-draw-toolbar position="topright" />
    </l-map>
  </div>
</template>

<script>
  import L from "leaflet";
  import { latLng, latLngBounds } from "leaflet";
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

  import DynamicSelect from "vue-dynamic-select";

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
      DynamicSelect,
    },
    data() {
      var corner1 = latLng(-55.11579, 72.5781078),
        corner2 = latLng(-9.1406926, 167.9965857 ),
        bounds = latLngBounds(corner1, corner2);
      return {
        zoom: 5,
        showClusters: false,
        showHeatmap: true,
        heatmapGradient: { 0.3: "rgba(250,1,1,1)", 0.5: "rgba(250,1,1,1)", 1: "rgba(250,1,1,1)" },
        latLngArray: [],
        maxValue: 0.1,
        caseArray: [],
        locations: {},
        locationsArray: [],
        filteredLocationsArray: [],
        selectedState: { label: "Australia", value: "all" },
        datesArray: [],
        statesArray: [],
        selectedDate: { label: "Latest", value: "latest" },
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
          zoomSnap: 0.25,
          scrollWheelZoom: true,
          wheelPxPerZoomLevel: 120,
          maxBounds: bounds,
          maxZoom: 16,
          minZoom: 5,
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
      showDataPolygon(obj) {
        console.log(obj);
      },
      setMapLocation(obj) {
        //console.log(obj);
        if (obj && Object.prototype.hasOwnProperty.call(obj, "value")) {
          this.$refs.map.mapObject.flyTo(obj.value, 12);
          this.getPolygon(obj.geotable, obj.geoid);
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
        //console.log("map height set to " + heightString);
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
              Vue.set(me.locations, data);
              let locArray = [];
              for (var key in data) {
                //console.log(key);
                let label = data[key].place_data;
                label += data[key].postal_code ? " - " + data[key].postal_code : "";
                locArray.push({
                  label: label,
                  code: key,
                  value: latLng(data[key].lat, data[key].lng),
                  state: data[key].state,
                  geotable: data[key].geometry_table,
                  geoid: data[key].geometry_table_id,
                });
              }
              me.locationsArray = me.filteredLocationsArray = locArray;
              console.log(locArray);
              // me.getData();
            });
          })
          .catch(function(err) {
            console.log("Fetch Error :-S", err);
          });
      },
      filterLocations() {
        let locArray = [];
        for (var i = 0; i < this.locationsArray.length; i++) {
          console.log(this.locationsArray[i]);
          if (this.locationsArray[i].state === this.selectedState.label) {
            locArray.push(this.locationsArray[i]);
          }
        }
        console.log(locArray);
        this.filteredLocationsArray = locArray;
      },
      getDates() {
        var me = this;
        fetch("https://api.contactmap.me/dates")
          .then(function(response) {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            response.json().then(function(data) {
              me.datesArray = data;
            });
          })
          .catch(function(err) {
            console.log("Fetch Error :-S", err);
          });
      },
      getStates() {
        var me = this;
        fetch("https://api.contactmap.me/states")
          .then(function(response) {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            response.json().then(function(data) {
              //console.log(data);
              me.statesArray = data;
            });
          })
          .catch(function(err) {
            console.log("Fetch Error :-S", err);
          });
      },
      getPolygon(table, id) {
        var me = this;
        fetch("https://api.contactmap.me/geometry/" + table + "/" + id)
          .then(function(response) {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            response.json().then(function(data) {
              //console.log(data.polygon);
              // let polygonArray = [];
              // for (var i=0; i< data.polygon.coordinates.length; i++) {
              //   polygonArray.push(latLng(data.polygon.coordinates[i]))
              // }
              // Vue.set(me.geojson, data.polygon);
              me.geojson = data.polygon;
              me.$refs.map.mapObject.flyToBounds(data.bbox);
            });
            // me.activePolygon = me.lgaPolygons[id];
            //console.log(me.geojson);
          })
          .catch(function(err) {
            console.log("Fetch Error :-S", err);
          });
      },
      setDate(obj) {
        this.selectedDate.value = obj.value;
        this.getData();
      },
      setState(obj) {
        this.selectedState.value = obj.value;
        this.filterLocations();
        this.getData();
      },
      getData() {
        var me = this;
        var layerView = this.showHeatmap ? "heatmap" : "markers";
        console.log("getting data");
        fetch("https://api.contactmap.me/locations/" + this.selectedState.value + "/" + this.selectedDate.value)
          .then(function(response) {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            me.showHeatmap = false;
            me.showClusters = false;
            response.json().then(function(data) {
              // var index = 0;
              let latLngArray = [];
              let caseArray = [];
              for (var i = 0; i < data.length; i++) {
                if (
                  Object.prototype.hasOwnProperty.call(data[i], "lat") &&
                  Object.prototype.hasOwnProperty.call(data[i], "lng")
                ) {
                  if (data[i].cases > 0) {
                    //console.log(data[i]);
                    let myIconSize = data[i].cases > 0 ? (Math.log(data[i].cases) / Math.log(10)) * 25 + 10 : 0;
                    latLngArray.push([data[i].lat, data[i].lng, data[i].cases]);
                    caseArray.push({
                      latlng: latLng(data[i].lat, data[i].lng),
                      id: "case-" + data[i].id,
                      geometry_table: data[i].geometry_table,
                      geometry_table_id: data[i].geometry_table_id,
                      iconSize: myIconSize,
                      value: data[i].cases.toString(),
                      place: data[i].place + " " + data[i].state,
                    });
                    // index++;
                  }
                }
              }
              me.latLngArray = latLngArray;
              me.caseArray = caseArray;
              me.showHeatmap = layerView === "heatmap";
              me.showClusters = layerView === "markers";

              setTimeout(function() {
                console.log("resizing");
                // me.$refs.heatmap.mapObject.redraw();
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
      this.getDates();
      this.getStates();
      this.getData();
    },
  };
</script>

<style>
  @import "~leaflet.markercluster/dist/MarkerCluster.css";
  @import "~leaflet.markercluster/dist/MarkerCluster.Default.css";
  @import "~vue-select/dist/vue-select.css";
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
  .v-select {
    background: white;
    color: black;
    text-align: left;
  }
  .vue-dynamic-select {
    width: 250px;
    background: white;
    color: black;
  }
  .leaflet-div-icon {
    border-radius: 20px;
    background: #fd0000;
    border: 1px solid #666;
    color: white;
  }
  .vue-dynamic-select .search {
    width: 250px;
  }
  .vue-dynamic-select .result-list {
    overflow: scroll;
    background-color: #fff;
    height: 50vh;
  }
</style>
