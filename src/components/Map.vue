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
    </button>-->
    <!-- </div> -->
    <div id="ControlPanel" class="control-panel">
      <div class="control-panel-label">State:</div>
      <dynamic-select
        :options="statesArray"
        v-model="selectedState"
        @input="setState"
        option-value="value"
        option-text="label"
        style="width: 15em;"
      ></dynamic-select>
      <div class="control-panel-label">Date:</div>
      <dynamic-select
        :options="datesArray"
        v-model="selectedDate"
        @input="setDate"
        option-value="value"
        option-text="label"
        style="width: 15em"
      ></dynamic-select>
      <div class="control-panel-label">Area:</div>
      <dynamic-select
        :options="filteredLocationsArray"
        @input="setMapLocation"
        option-value="latlng"
        option-text="label"
        placeholder="type to search"
        style="width: 22em"
      ></dynamic-select>
      <div class="control-panel-label">View:</div>
      <dynamic-select
        :options="viewOptions"
        v-model="selectedView"
        @input="setViewOption"
        option-value="value"
        option-text="label"
        style="width: 10em"
      ></dynamic-select>
    </div>
    <l-map
      id="map"
      v-if="showMap"
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
      ref="map"
      style="width:100%; height: 100vh; z-index: 100"
    >
      <l-tile-layer :url="url" :attribution="attribution" />
      <l-geo-json :geojson="geojson" ref="polygons" :options="geojsonStyle"></l-geo-json>
      <!-- <l-polygon :lat-lngs="activePolygon.latlngs" :color="activePolygon.color"></l-polygon>        :gradient="heatmapGradient"
      -->
      <LeafletHeatmap
        v-if="showHeatmap"
        :lat-lng="latLngPostcodeArray"
        :max="10"
        :radius="10"
        :blur="15"
        :minOpacity="1"
        :maxOpacity="0.9"
        :gradient="heatmapGradient3"
        ref="heatmap_postcodes"
      ></LeafletHeatmap>
      <LeafletHeatmap
        v-if="showHeatmap"
        :lat-lng="latLngArray"
        :max="10"
        :radius="10"
        :blur="15"
        :gradient="heatmapGradient3"
        :minOpacity="1"
        :maxOpacity="0.9"
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
          @click="getPolygon(c)"
        >
          <l-icon
            :icon="icon"
            :options="iconOptions"
            :iconSize="[c.iconSize, c.iconSize]"
            :iconAnchor="c.iconAnchor"
          ></l-icon>
          <l-tooltip :options="{ permanent: false, interactive: true }">
            {{ c.value }} Covid-19 Cases
            <br />
            {{ c.place }}
          </l-tooltip>
        </l-marker>
        <l-marker
          v-for="c in casesPostcodes"
          :lat-lng="c.latlng"
          :value="c.value"
          v-bind:key="c.id"
          :options="markerOptions"
          ref="c.id"
          @click="getPolygon(c)"
        >
          <l-icon
            :icon="icon"
            :options="iconOptions"
            :iconSize="[c.iconSize, c.iconSize]"
            :iconAnchor="c.iconAnchor"
          ></l-icon>
          <l-tooltip :options="{ permanent: false, interactive: true }">
            {{ c.value }} Covid-19 Cases
            <br />
            {{ c.place }}
          </l-tooltip>
        </l-marker>
      </div>
      <l-control-scale position="topright" :imperial="false" :metric="true"></l-control-scale>
      <v-geosearch :options="geosearchOptions"></v-geosearch>
      <l-control position="topleft" style="z-index: 760">
        <!-- map based controls go here -->
      </l-control>
      <l-draw-toolbar position="topleft" />
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
  // LPolygon,
  LGeoJson
} from "vue2-leaflet";

import DynamicSelect from "vue-dynamic-select";

import LeafletHeatmap from "./Vue2LeafletHeatmap";
import Vue2LeafletDrawToolbar from "vue2-leaflet-draw-toolbar";
// import Vue from "vue";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import VGeosearch from "vue2-leaflet-geosearch";

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
    // LPolygon,
    LGeoJson,
    "l-draw-toolbar": Vue2LeafletDrawToolbar,
    DynamicSelect,
    VGeosearch
  },
  data() {
    var corner1 = latLng(-44.276671, 110.742188),
      corner2 = latLng(-9.622414, 156.577148),
      bounds = latLngBounds(corner1, corner2);
    return {
      zoom: 5,
      showClusters: false,
      showHeatmap: true,
      heatmapGradient: {
        0.3: "rgba(250,1,1,1)",
        0.5: "rgba(250,1,1,1)",
        1: "rgba(250,1,1,1)"
      },
      heatmapGradient2: {
        0.2: "#ffffb2",
        0.4: "#fd8d3c",
        0.6: "#fd8d3c",
        0.8: "#f03b20",
        1: "#bd0026"
      },
      heatmapGradient3: {
        0.0: "yellow",
        0.5: "orange",
        1.0: "red"
      },
      dataColorLookup: [],
      maxValue: 100,
      latLngArray: [],
      caseArray: [],
      latLngPostcodeArray: [],
      casePostcodeArray: [],
      locationsLookup: {},
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
        coordinates: [30, 10]
      },
      viewOptions: [
        { value: "heat", label: "Heatmap" },
        { value: "marker", label: "Markers" }
      ],
      selectedView: { value: "heat", label: "Heatmap" },
      geojsonStyle: { style: { color: "red", fillColor: "green" } },
      icon: L.icon({
        iconUrl: "https://www.contactmap.me/img/coronavirus.svg"
      }),
      iconOptions: {
        iconUrl: "https://www.contactmap.me/img/coronavirus.svg"
      },
      markerOptions: {},
      clusterOptions: {
        className: "cluster-css"
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
      accessToken:
        "pk.eyJ1IjoiZ3V5bW9ydG9uIiwiYSI6ImNrOHkwNmg3bzAwMzkzZ3RibG9wem43N20ifQ.Lgs-FlpaE3S61_eGyTCEsQ",
      mapOptions: {
        zoomSnap: 0.25,
        scrollWheelZoom: true,
        wheelPxPerZoomLevel: 120,
        maxBounds: bounds,
        maxZoom: 16,
        minZoom: 5
      },
      showMap: true,
      geosearchOptions: {
        // Important part Here
        provider: new OpenStreetMapProvider()
      }
    };
  },
  computed: {
    cases: function() {
      return this.caseArray;
    },
    casesPostcodes: function() {
      return this.casePostcodeArray;
    }
  },
  methods: {
    setViewOption(obj) {
      this.selectedView.value = obj.value;
      console.log(obj);
      if (this.selectedView.value === "heat") {
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
        this.getPolygon(obj);
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
        document.getElementById("ControlPanel").offsetHeight -
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
            console.log(
              "Looks like there was a problem. Status Code: " + response.status
            );
            return;
          }
          response.json().then(function(data) {
            me.locationsLookup = data;
            console.log(me.locationsLookup);
            let locArray = [];
            for (var key in data) {
              //console.log(key);
              let label = data[key].place_data;
              label += data[key].postal_code
                ? " - " + data[key].postal_code
                : "";
              locArray.push({
                label: label,
                code: key,
                value: latLng(data[key].lat, data[key].lng),
                state: data[key].state,
                geotable: data[key].geometry_table,
                geoid: data[key].geometry_table_id
              });
            }
            me.locationsArray = me.filteredLocationsArray = locArray;
            console.log(locArray);
            // me.getPlaceData();
            me.getPlaceData();
            me.getPostcodeData();
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
    dataForLocation(id) {
      var me = this;
      fetch("https://api.contactmap.me/by_glid/" + id)
        .then(function(response) {
          if (response.status !== 200) {
            console.log(
              "Looks like there was a problem. Status Code: " + response.status
            );
            return;
          }
          response.json().then(function(data) {
            me.dataLookup["gl-" + id] = data;
          });
        })
        .catch(function(err) {
          console.log("Fetch Error :-S", err);
        });
    },
    getDates() {
      var me = this;
      fetch("https://api.contactmap.me/dates")
        .then(function(response) {
          if (response.status !== 200) {
            console.log(
              "Looks like there was a problem. Status Code: " + response.status
            );
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
            console.log(
              "Looks like there was a problem. Status Code: " + response.status
            );
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
    getPolygon(obj) {
      var me = this;
      fetch(
        "https://api.contactmap.me/geometry/" +
          obj.geometry_table +
          "/" +
          obj.geometry_table_id
      )
        .then(function(response) {
          if (response.status !== 200) {
            console.log(
              "Looks like there was a problem. Status Code: " + response.status
            );
            return;
          }
          response.json().then(function(data) {
            console.log(data);
            // let polygonArray = [];
            // for (var i=0; i< data.polygon.coordinates.length; i++) {
            //   polygonArray.push(latLng(data.polygon.coordinates[i]))
            // }
            // Vue.set(me.geojson, data.polygon);
            console.log(Math.floor(obj.value % 5));
            me.geojson = data.polygon;
            let colour =
              obj.value > 39
                ? me.dataColorLookup[39]
                : me.dataColorLookup[obj.value];
            console.log(colour);
            me.geojsonStyle.style.color = me.geojsonStyle.style.fillColor = colour;
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
      this.getPlaceData();
      this.getPostcodeData();
    },
    setState(obj) {
      this.selectedState.value = obj.value;
      this.filterLocations();
      this.getPlaceData();
      this.getPostcodeData();
    },
    getPlaceData() {
      var me = this;
      var layerView = this.showHeatmap ? "heatmap" : "markers";
      console.log("getting data");
      fetch(
        "https://api.contactmap.me/by_place/" +
          this.selectedState.value +
          "/" +
          this.selectedDate.value
      )
        .then(function(response) {
          if (response.status !== 200) {
            console.log(
              "Looks like there was a problem. Status Code: " + response.status
            );
            return;
          }
          me.showHeatmap = false;
          me.showClusters = false;
          response.json().then(function(data) {
            // var index = 0;
            let latLngArray = [];
            let caseArray = [];
            for (var key in data) {
              if (
                Object.prototype.hasOwnProperty.call(data[key], "lat") &&
                Object.prototype.hasOwnProperty.call(data[key], "lng")
              ) {
                if (data[key].cases > 0) {
                  //console.log(data[i]);
                  let myIconSize =
                    data[key].cases > 0
                      ? (Math.log(data[key].cases) / Math.log(10)) * 25 + 10
                      : 0;
                  latLngArray.push([
                    data[key].lat,
                    data[key].lng,
                    data[key].cases
                  ]);
                  caseArray.push({
                    latlng: latLng(data[key].lat, data[key].lng),
                    id: "place-" + data[key].id,
                    geometry_table: data[key].geometry_table,
                    geometry_table_id: data[key].geometry_table_id,
                    iconSize: myIconSize,
                    value: data[key].cases.toString(),
                    place: data[key].place + " " + data[key].state
                  });
                  // index++;
                }
              }
            }
            me.latLngArray = latLngArray;
            me.caseArray = caseArray;
            me.showHeatmap = layerView === "heatmap";
            me.showClusters = layerView === "markers";

            // setTimeout(function() {
            //   console.log("resizing");
            //   // me.$refs.heatmap.mapObject.redraw();
            //   window.dispatchEvent(new Event("resize"));
            // }, 20);
          });
        })
        .catch(function(err) {
          console.log("Fetch Error :-S", err);
        });
    },
    getPostcodeData() {
      var me = this;
      var layerView = this.showHeatmap ? "heatmap" : "markers";
      console.log("getting data");
      fetch(
        "https://api.contactmap.me/by_postcode/" +
          this.selectedState.value +
          "/" +
          this.selectedDate.value
      )
        .then(function(response) {
          if (response.status !== 200) {
            console.log(
              "Looks like there was a problem. Status Code: " + response.status
            );
            return;
          }
          me.showHeatmap = false;
          me.showClusters = false;
          response.json().then(function(data) {
            console.log(data);
            let latLngArray = [];
            let caseArray = [];
            for (var key in data) {
              if (
                me.locationsLookup &&
                Object.prototype.hasOwnProperty.call(me.locationsLookup, key) &&
                Object.prototype.hasOwnProperty.call(
                  me.locationsLookup[key],
                  "lat"
                ) &&
                Object.prototype.hasOwnProperty.call(
                  me.locationsLookup[key],
                  "lng"
                )
              ) {
                if (
                  data[key].cases > 0 &&
                  me.locationsLookup[key].lat &&
                  me.locationsLookup[key].lng
                ) {
                  let myIconSize =
                    data[key].cases > 0
                      ? (Math.log(data[key].cases) / Math.log(10)) * 25 + 10
                      : 0;
                  latLngArray.push([
                    me.locationsLookup[key].lat,
                    me.locationsLookup[key].lng,
                    data[key].cases
                  ]);
                  caseArray.push({
                    latlng: latLng(
                      me.locationsLookup[key].lat,
                      me.locationsLookup[key].lng
                    ),
                    id: "postcode-" + key,
                    geometry_table: me.locationsLookup[key].geometry_table,
                    geometry_table_id:
                      me.locationsLookup[key].geometry_table_id,
                    iconSize: myIconSize,
                    value: data[key].cases.toString(),
                    place:
                      data[key].place +
                      " " +
                      data[key].postcode +
                      " " +
                      data[key].state
                  });
                }
              }
            }
            me.latLngPostcodeArray = latLngArray;
            me.casePostcodeArray = caseArray;
            console.log(me.latLngPostcodeArray);
            console.log(me.casePostcodeArray);
            me.showHeatmap = layerView === "heatmap";
            me.showClusters = layerView === "markers";
          });
        })
        .catch(function(err) {
          console.log("Fetch Error :-S", err);
        });
    }
  },
  mounted() {
    this.setMapHeight();
    var me = this;
    window.addEventListener("resize", function() {
      me.setMapHeight();
    });
    for (let i = 0; i < 20; i++) {
      this.dataColorLookup.push(rgbToHex((255 / 20) * i, 0, 255));
    }
    for (let i = 0; i < 20; i++) {
      this.dataColorLookup.push(
        rgbToHex(255, 0, 255 - Math.ceil((255 / 20) * i))
      );
    }
    console.log(this.dataColorLookup);
    this.getLocations();
    this.getDates();
    this.getStates();
  }
};

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
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
  width: auto;
  height: 1.1em;
  background: white;
  margin-top: 2px;
  color: black;
  z-index: 1000;
}
.leaflet-div-icon {
  border-radius: 20px;
  background: #fd0000;
  border: 1px solid #666;
  color: white;
}
.vue-dynamic-select .search {
  width: auto;
}
.vue-dynamic-select .result-list {
  overflow: scroll;
  background-color: #fff;
  max-height: 50vh;
}
button {
  background-color: #2e2888; /* Green */
  border: none;
  color: rgb(255, 255, 255);
  padding: 0px 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-weight: bolder;
}
.leaflet-control-geosearch .results > * {
  color: black;
}
.leaflet-control {
  z-index: 2000;
}
.control-panel-label {
  padding: 8px 10px;
  color: black;
  font-weight: bolder;
}
.control-panel {
  background: #74cff0;
  padding: 2px;
  z-index: 10000;
  display: flex;
}
/* .leaflet-control-geosearch .leaflet-bar-part {
  width: 26px;
  height: 26px;
} */
.leaflet-toolbar-0 > li > .leaflet-toolbar-icon {
  width: 26px;
  height: 26px;
}
.leaflet-draw-toolbar.leaflet-control-toolbar {
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}
.leaflet-toolbar-0 {
  border: 0px solid rgba(0, 0, 0, 0.2);
}
</style>
