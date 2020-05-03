<template>
  <!-- <div style="height: calc(100vh - 200px); width: 100%"> -->
  <div class="map-panel">
    <!-- <p>First marker is placed at {{ withPopup.lat }}, {{ withPopup.lng }}. Window height= {{ mapHeight }}</p>
      <p>Center is at {{ mapCentre }} and the zoom is: {{ mapZoom }}</p>
      <button @click="showLongText">
        Toggle long popup
      </button>
      <button @click="showMap = !showMap">
        Toggle map
    </button>-->
    <!-- </div> -->
    <div id="ControlPanel" class="control-panel">
      <div class="control-panel-label">State:</div>
      <dynamic-select :options="statesArray" v-model="selectedState" @input="setState" option-value="value" option-text="label" style="width: 15em;"></dynamic-select>
      <div class="control-panel-label">Date:</div>
      <dynamic-select :options="datesArray" v-model="selectedDate" @input="setDate" option-value="value" option-text="label" style="width: 15em"></dynamic-select>
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
      <dynamic-select :options="viewOptions" v-model="selectedView" @input="setViewOption" option-value="value" option-text="label" style="width: 10em"></dynamic-select>
    </div>
    <l-map
      id="map"
      v-if="showMap"
      :zoom="mapZoom"
      :center="mapCentre"
      :options="mapOptions"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
      @click="showDataUnderClick"
      ref="map"
      style="width:100%; height: 100vh; z-index: 100"
    >
      <l-tile-layer :url="url" :attribution="attribution" />
      <l-geo-json v-for="g in geojsons" v-bind:key="g.id" :geojson="g.geojson" :options="g.style" style="z-index: 100"></l-geo-json>
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
      <div v-if="showMarkers" ref="markerLayer">
        <l-marker
          v-for="c in cases"
          :lat-lng="c.latlng"
          :value="c.value"
          v-bind:key="c.id"
          :options="markerOptions"
          :ref="c.id"
          :name="c.glid"
          @mouseover="showPopup"
          @click="getPolygon(c)"
        >
          <l-icon :icon="icon" :options="iconOptions" :iconSize="[c.iconSize, c.iconSize]" :iconAnchor="c.iconAnchor"></l-icon>
          <l-popup :content="c.content" :latLng="c.latlng"></l-popup>
          <!-- <l-tooltip :options="{ permanent: false, interactive: true, offset: [-((c.iconSize/2)+2),0] }">
            {{ c.value }} Covid-19 Cases
            <br />
            {{ c.place }}
          </l-tooltip> -->
        </l-marker>
        <l-marker
          v-for="c in casesPostcodes"
          :lat-lng="c.latlng"
          :value="c.value"
          v-bind:key="c.id"
          :options="markerOptions"
          :ref="c.id"
          :name="c.glid"
          @mouseover="showPopup"
          @click="getPolygon(c)"
        >
          <l-icon :icon="icon" :options="iconOptions" :iconSize="[c.iconSize, c.iconSize]" :iconAnchor="c.iconAnchor"></l-icon>
          <l-popup :content="c.content" :latLng="c.latlng"></l-popup>
          <!-- <l-tooltip :options="{ permanent: false, interactive: true }">
            {{ c.value }} Covid-19 Cases
            <br />
            {{ c.place }}
          </l-tooltip> -->
        </l-marker>
      </div>
      <l-control-scale position="topright" :imperial="false" :metric="true"></l-control-scale>
      <v-geosearch :options="geosearchOptions"></v-geosearch>
      <l-control position="bottomright" style="z-index: 760">
        <!-- map based controls go here -->
        <vue-dropzone ref="dropzone" id="dropzone" :options="dropzoneOptions" @vdropzone-success="handleData"></vue-dropzone>
      </l-control>
      <l-draw-toolbar position="topleft" />
      <l-polyline v-for="p in userTracks" v-bind:key="p.id" :lat-lngs="p.points" :color="p.style.color" ref="userTracks" :options="{ pane: 'shadowPane' }">
        <l-tooltip :options="{ permanent: false, interactive: true }"
          ><strong>Activity:</strong> {{ p.description }}<br /><strong>From:</strong> {{ p.start }} to {{ p.end }}</l-tooltip
        >
      </l-polyline>
      <l-circle
        v-for="p in userLocs"
        v-bind:key="p.id"
        :lat-lng="p.points[0]"
        :radius="200"
        :color="p.style.color"
        :stroke="p.style.stroke"
        :fillColor="p.style.color"
        :fillOpacity="p.style.fillOpacity"
        :options="{ pane: 'shadowPane' }"
      >
        <l-tooltip :options="{ permanent: false, interactive: true }"
          ><strong>Place:</strong> {{ p.description }}<br /><strong>From:</strong> {{ p.start }} to {{ p.end }}</l-tooltip
        >
      </l-circle>
      <l-rectangle :bounds="mapBounds" :fill="false" :weight="0"></l-rectangle>
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
    LPopup,
    LControl,
    LControlScale,
    LIcon,
    LRectangle,
    LCircle,
    LPolyline,
    // LPolygon,
    LGeoJson,
  } from "vue2-leaflet";

  import DynamicSelect from "vue-dynamic-select";
  import LeafletHeatmap from "./Vue2LeafletHeatmap";
  import Vue2LeafletDrawToolbar from "vue2-leaflet-draw-toolbar";
  // import Vue from "vue";
  import { OpenStreetMapProvider } from "leaflet-geosearch";
  import VGeosearch from "vue2-leaflet-geosearch";
  import vue2Dropzone from "vue2-dropzone";
  import "vue2-dropzone/dist/vue2Dropzone.min.css";

  export default {
    name: "MapPanel",
    components: {
      LMap,
      LTileLayer,
      LMarker,
      LeafletHeatmap,
      LTooltip,
      LPopup,
      LControl,
      LControlScale,
      LIcon,
      LRectangle,
      LCircle,
      LPolyline,
      // LPolygon,
      LGeoJson,
      "l-draw-toolbar": Vue2LeafletDrawToolbar,
      DynamicSelect,
      VGeosearch,
      vueDropzone: vue2Dropzone,
    },

    data() {
      var corner1 = latLng(-44.522768, 160.471576);
      var corner2 = latLng(-8.44428, 110.060151);
      var maxMapBounds = latLngBounds(corner1, corner2);
      var startingMapCentre = maxMapBounds.getCenter();
      return {
        dateFormatConfig: {
          dayOfWeekNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          dayOfWeekNamesShort: ["Su", "Mo", "Tu", "We", "Tr", "Fr", "Sa"],
          monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        },
        showMarkers: false,
        showHeatmap: true,
        caseDataLookup: {},
        mapBounds: [corner1, corner2],
        heatmapGradient: {
          0.3: "rgba(250,1,1,1)",
          0.5: "rgba(250,1,1,1)",
          1: "rgba(250,1,1,1)",
        },
        heatmapGradient2: {
          0.2: "#ffffb2",
          0.4: "#fd8d3c",
          0.6: "#fd8d3c",
          0.8: "#f03b20",
          1: "#bd0026",
        },
        heatmapGradient3: {
          0.0: "yellow",
          0.5: "orange",
          1.0: "red",
        },
        dropzoneOptions: {
          url: "https://api.contactmap.me/upload",
          thumbnailWidth: 100,
          maxFilesize: 2,
          addRemoveLinks: true,
          headers: { "My-Awesome-Header": "header value" },
          dictDefaultMessage: "Drop Google<br>Takeout JSON<br>file here...",
        },
        dataColorLookup: [],
        userTracks: [],
        userLocs: [],
        maxValue: 100,
        latLngArray: [],
        caseArray: [],
        latLngPostcodeArray: [],
        casePostcodeArray: [],
        locationsLookup: {},
        locationsArray: [],
        filteredLocationsArray: [],
        selectedState: {},
        datesArray: [],
        statesArray: [],
        selectedDate: { label: "Latest", value: "latest" },
        location: null,
        gettingLocation: false,
        lgaPolygons: {},
        activePolygon: { color: "blue", latLngs: [] },
        geojson: {
          type: "Point",
          coordinates: [30, 10],
        },
        geojsons: [],
        viewOptions: [
          { value: "heat", label: "Heatmap" },
          { value: "marker", label: "Markers" },
        ],
        selectedView: { value: "heat", label: "Heatmap" },
        geojsonStyle: { style: { color: "red", fillColor: "green", stroke: 1 } },
        loadedGeojson: {},
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
        mapCentre: startingMapCentre,
        url:
          "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3V5bW9ydG9uIiwiYSI6ImNrOHkwNmg3bzAwMzkzZ3RibG9wem43N20ifQ.Lgs-FlpaE3S61_eGyTCEsQ",
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        withPopup: latLng(-37.799278, 145.059956),
        withTooltip: latLng(-33.8858088, 151.10248109002),
        mapZoom: 11.5,
        showParagraph: false,
        accessToken: "pk.eyJ1IjoiZ3V5bW9ydG9uIiwiYSI6ImNrOHkwNmg3bzAwMzkzZ3RibG9wem43N20ifQ.Lgs-FlpaE3S61_eGyTCEsQ",
        mapOptions: {
          zoomSnap: 0.3,
          scrollWheelZoom: true,
          wheelPxPerZoomLevel: 2000,
          wheelDebounceTime: 40,
          fadeAnimation: false,
          maxBounds: maxMapBounds,
          maxZoom: 16,
          minZoom: 5,
        },
        showMap: true,
        geosearchOptions: {
          // Important part Here
          provider: new OpenStreetMapProvider(),
        },
      };
    },
    computed: {
      cases: function() {
        return this.caseArray;
      },
      casesPostcodes: function() {
        return this.casePostcodeArray;
      },
    },
    methods: {
      setViewOption(obj) {
        this.selectedView.value = obj.value;
        console.log(obj);
        if (this.selectedView.value === "heat") {
          this.showHeatmap = true;
          this.showMarkers = false;
        } else {
          this.showHeatmap = false;
          this.showMarkers = true;
        }
      },
      handleData(file, response) {
        console.log(response);
        this.$refs.dropzone.removeFile(file);
        let dataDates = [];
        let setMapBounds = latLngBounds();
        let userTracks = [];
        let userLocs = [];
        for (var date in response) {
          console.log(date);
          dataDates.push(date);
          for (var i = 0; i < response[date].length; i++) {
            response[date][i].style = { "z-index": 1000, color: "black", stroke: false, fillOpacity: 0.4 };
            response[date][i].id = i + "-" + response[date][i].start;
            response[date][i].start = formatDatetime(response[date][i].start, true);
            response[date][i].end = formatDatetime(response[date][i].end);
            if (response[date][i].points.length > 1) {
              response[date][i].style.color = "#777777";
              userTracks.push(response[date][i]);
            } else {
              userLocs.push(response[date][i]);
              setMapBounds.extend(response[date][i].points[0]);
              this.showDataByLatLng(response[date][i].points[0]);
            }
          }
        }
        this.userTracks = userTracks;
        this.userLocs = userLocs;
        this.$refs.map.mapObject.fitBounds(setMapBounds);
        this.$refs.userTracks.mapObject.bringToFront();
      },
      showDataPolygon(obj) {
        console.log(obj);
      },
      hideAllLayers() {
        if (this.showHeatmap) {
          this.$refs.map.mapObject.removeLayer(this.$refs.heatmap.mapObject);
          this.$refs.map.mapObject.removeLayer(this.$refs.heatmap_postcodes.mapObject);
        }
      },
      showAllLayers() {
        if (this.showHeatmap) {
          this.$refs.map.mapObject.addLayer(this.$refs.heatmap.mapObject);
          this.$refs.map.mapObject.addLayer(this.$refs.heatmap_postcodes.mapObject);
        }
      },
      //need to fix this as it does not have the value when calling getPolygon now...
      setMapLocation(obj) {
        console.log("calling set Map location");
        console.log(obj);
        if (obj && Object.prototype.hasOwnProperty.call(obj, "value")) {
          let me = this;
          this.hideAllLayers();
          this.$refs.map.mapObject.on("moveend", function() {
            me.showAllLayers();
          });
          this.getPolygon(obj);
          this.$refs.map.mapObject.setView(obj.value, 11);
        }
      },
      zoomUpdate(zoom) {
        this.mapZoom = zoom;
      },
      centerUpdate(center) {
        this.mapCentre = center;
      },
      showLongText() {
        this.showParagraph = !this.showParagraph;
      },
      showPopup(obj) {
        console.log(obj);
        obj.target.openPopup();
      },
      showDataByLatLng(ll) {
        this.showDataUnderClick({ latlng: latLng(ll) });
      },
      showDataUnderClick(obj) {
        console.log(obj);
        var me = this;
        fetch("https://api.contactmap.me/glid_for_latlng/" + obj.latlng.lat + "/" + obj.latlng.lng)
          .then(function(response) {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            response.json().then(function(data) {
              me.getPolygon(me.locationsLookup["gl-" + data.geocoded_location_id]);
            });
          })
          .catch(function(err) {
            console.log("Fetch Error :-S", err);
          });
      },
      getPolygon(obj) {
        console.log("Getting polygon " + obj.glid);
        console.log(obj);
        var me = this;
        console.log(me.caseDataLookup);
        let glid = obj.glid.toString().match(/^gl/) ? obj.glid : "gl-" + obj.glid;
        if (Object.prototype.hasOwnProperty.call(me.loadedGeojson, glid)) {
          console.log("already loaded polygon for " + obj.glid);
          ///set visible if hidden
          return;
        }
        fetch("https://api.contactmap.me/geometry/" + obj.geotable + "/" + obj.geoid)
          .then(function(response) {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            response.json().then(function(data) {
              if (Object.prototype.hasOwnProperty.call(me.loadedGeojson, glid)) {
                console.log("already loaded, async");
              } else {
                let colour = me.caseDataLookup[glid].value > 39 ? me.dataColorLookup[39] : me.dataColorLookup[me.caseDataLookup[glid].value];
                let geojsonObj = { geojson: data.polygon, id: obj.glid, style: { fillColor: colour, color: colour } };
                me.geojsons.push(geojsonObj);
                me.loadedGeojson[glid] = { loaded: true, visible: true };
              }
            });
          })
          .catch(function(err) {
            console.log("Fetch Error :-S", err);
          });
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
              me.locationsLookup = data;
              console.log(me.locationsLookup);
              let locArray = [];
              for (var key in data) {
                //console.log(key);
                let label = data[key].place_data;
                label += data[key].postal_code ? " - " + data[key].postal_code : "";
                locArray.push({
                  label: label,
                  glid: key,
                  value: latLng(data[key].lat, data[key].lng),
                  state: data[key].state,
                  geotable: data[key].geotable,
                  geoid: data[key].geoid,
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
          // console.log(this.locationsArray[i]);
          if (this.selectedState.label === "Australia" || this.locationsArray[i].state === this.selectedState.label) {
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
              me.selectedState = me.statesArray[0];
            });
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
        console.log(obj);
        this.selectedState = obj;
        this.latLngArray = [];
        this.caseArray = [];
        this.latLngArray = [];
        this.caseArray = [];
        if (obj.label !== "Australia") {
          this.$refs.map.mapObject.fitBounds(obj.value.bbox);
        }
        // this.mapBounds = obj.value.bbox;
        this.filterLocations();
        this.getPlaceData();
        this.getPostcodeData();
      },
      getPlaceData() {
        var me = this;
        var layerView = this.showHeatmap ? "heatmap" : "markers";
        console.log("getting data");
        fetch("https://api.contactmap.me/by_place/" + this.selectedState.value.name + "/" + this.selectedDate.value)
          .then(function(response) {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            me.showHeatmap = false;
            me.showMarkers = false;
            response.json().then(function(data) {
              let latLngArray = [];
              let caseArray = [];
              for (var key in data) {
                if (Object.prototype.hasOwnProperty.call(data[key], "lat") && Object.prototype.hasOwnProperty.call(data[key], "lng")) {
                  if (data[key].cases > 0) {
                    let myIconSize = data[key].cases > 0 ? (Math.log(data[key].cases) / Math.log(10)) * 25 + 10 : 0;
                    latLngArray.push([data[key].lat, data[key].lng, data[key].cases]);
                    me.caseDataLookup[key] = {
                      latlng: latLng(data[key].lat, data[key].lng),
                      geotable: data[key].geometry_table,
                      geoid: data[key].geometry_table_id,
                      iconSize: myIconSize,
                      value: data[key].cases.toString(),
                      place: data[key].place + " " + data[key].state,
                    };
                    caseArray.push({
                      latlng: latLng(data[key].lat, data[key].lng),
                      glid: key,
                      geotable: data[key].geometry_table,
                      geoid: data[key].geometry_table_id,
                      iconSize: myIconSize,
                      value: data[key].cases.toString(),
                      place: data[key].place + " " + data[key].state,
                      content: data[key].cases.toString() + " Covid-19 Cases<br>" + data[key].place + " " + data[key].state,
                    });
                  }
                }
              }
              me.latLngArray = latLngArray;
              me.caseArray = caseArray;
              me.showHeatmap = layerView === "heatmap";
              me.showMarkers = layerView === "markers";
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
        fetch("https://api.contactmap.me/by_postcode/" + this.selectedState.value.name + "/" + this.selectedDate.value)
          .then(function(response) {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            me.showHeatmap = false;
            me.showMarkers = false;
            response.json().then(function(data) {
              console.log(data);
              let latLngArray = [];
              let caseArray = [];
              for (var key in data) {
                if (
                  me.locationsLookup &&
                  Object.prototype.hasOwnProperty.call(me.locationsLookup, key) &&
                  Object.prototype.hasOwnProperty.call(me.locationsLookup[key], "lat") &&
                  Object.prototype.hasOwnProperty.call(me.locationsLookup[key], "lng")
                ) {
                  if (data[key].cases > 0 && me.locationsLookup[key].lat && me.locationsLookup[key].lng) {
                    let myIconSize = data[key].cases > 0 ? (Math.log(data[key].cases) / Math.log(10)) * 25 + 10 : 0;
                    latLngArray.push([me.locationsLookup[key].lat, me.locationsLookup[key].lng, data[key].cases]);
                    me.caseDataLookup[key] = {
                      latlng: latLng(me.locationsLookup[key].lat, me.locationsLookup[key].lng),
                      // geotable: me.locationsLookup[key].geometry_table,
                      // geoid: me.locationsLookup[key].geometry_table_id,
                      iconSize: myIconSize,
                      value: data[key].cases.toString(),
                      place: data[key].place + " " + data[key].postcode + " " + data[key].state,
                    };
                    caseArray.push({
                      latlng: latLng(me.locationsLookup[key].lat, me.locationsLookup[key].lng),
                      glid: key,
                      // geotable: me.locationsLookup[key].geometry_table,
                      // geoid: me.locationsLookup[key].geometry_table_id,
                      iconSize: myIconSize,
                      value: data[key].cases.toString(),
                      place: data[key].place + " " + data[key].postcode + " " + data[key].state,
                      content: data[key].cases.toString() + " Covid-19 Cases<br>" + data[key].place + " " + data[key].postcode + " " + data[key].state,
                    });
                  }
                }
              }
              me.latLngPostcodeArray = latLngArray;
              me.casePostcodeArray = caseArray;
              console.log(me.latLngPostcodeArray);
              console.log(me.casePostcodeArray);
              console.log(me.caseDataLookup);
              me.showHeatmap = layerView === "heatmap";
              me.showMarkers = layerView === "markers";
            });
          })
          .catch(function(err) {
            console.log("Fetch Error :-S", err);
          });
      },
    },
    created() {
      //do we support geolocation
      if (!("geolocation" in navigator)) {
        console.log("Geolocation is not available.");
        return;
      }
      this.gettingLocation = true;
      // get position
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.gettingLocation = false;
          this.location = pos;
        },
        (err) => {
          this.gettingLocation = false;
          console.log(err.message);
        }
      );
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
        this.dataColorLookup.push(rgbToHex(255, 0, 255 - Math.ceil((255 / 20) * i)));
      }
      console.log(this.dataColorLookup);
      this.getLocations();
      this.getDates();
      this.getStates();
    },
  };

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function formatDatetime(isoString, justTime) {
    var dateParts = isoString.split(/\D/);
    if (justTime) {
      return dateParts[3] + ":" + dateParts[4];
    }
    return dateParts[3] + ":" + dateParts[4] + " " + dateParts[2] + "/" + dateParts[1];
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
  .dropzone .dz-message {
    margin: 0;
  }
  .dropzone {
    min-height: auto;
    background: #e8e9ce;
    color: black;
  }
  .dropzone:hover {
    background: rgb(255, 237, 178);
  }
  .vue-dropzone {
    border: 1px dashed #1f1f1f;
    border-radius: 10px;
  }
</style>
