<template>
  <div class="map-panel">
    <div id="ControlPanel" class="control-panel">
      <div class="control-panel-label">State:</div>
      <dynamic-select :options="statesArray" v-model="selectedState" @input="setState" option-value="value" option-text="label" style="width: 15em;"></dynamic-select>
      <div class="control-panel-label">Date:</div>
      <dynamic-select :options="datesArray" v-model="selectedDate" @input="setDate" option-value="value" option-text="label" style="width: 15em"></dynamic-select>
      <div class="control-panel-label">Area:</div>
      <dynamic-select :options="filteredLocationsArray" @input="setMapLocation" option-value="value" option-text="label" placeholder="type to search" style="width: 22em"></dynamic-select>
      <div class="control-panel-label">View:</div>
      <dynamic-select :options="viewOptions" v-model="selectedView" @input="setViewOption" option-value="value" option-text="label" style="width: 10em"></dynamic-select>
    </div>
    <l-map id="map" v-if="showMap" :zoom="mapZoom" :center="mapCentre" :options="mapOptions" @update:center="centerUpdate" @update:zoom="zoomUpdate" @click="showDataUnderClick" ref="map" style="width:100%; height: 100vh; z-index: 100">
      <l-tile-layer :url="url" :attribution="attribution" />
      <l-geo-json v-for="g in geojsons" v-bind:key="g.id" @mouseover="showGeojsonPopup(g)" @mouseout="hidePopupGeojson" :geojson="g.geojson" @click="hidePolygon" :options="g.style"></l-geo-json>

      <LeafletHeatmap v-if="showHeatmap" :lat-lng="latLngPostcodeArray" :max="10" :radius="10" :blur="15" :minOpacity="1" :maxOpacity="0.9" :gradient="heatmapGradient3" ref="heatmap_postcodes"></LeafletHeatmap>
      <LeafletHeatmap v-if="showHeatmap" :lat-lng="latLngPlaceArray" :max="10" :radius="10" :blur="15" :gradient="heatmapGradient3" :minOpacity="1" :maxOpacity="0.9" ref="heatmap"></LeafletHeatmap>
      <div v-if="showMarkers" ref="markerLayer">
        <l-marker v-for="c in casePlaceArray" :lat-lng="c.latlng" :value="c.value" v-bind:key="'place-' + c.glid" :options="markerOptions" :name="c.glid" @mouseover="showPopup" @click="showPolygon(c, $event)">
          <l-icon :icon="icon" :options="iconOptions" :iconSize="[c.iconSize, c.iconSize]" :iconAnchor="c.iconAnchor"></l-icon>
          <l-popup :content="c.content" :latLng="c.latlng" :options="{ closeButton: false }"></l-popup>
        </l-marker>
        <l-marker v-for="c in casePostcodeArray" :lat-lng="c.latlng" :value="c.value" v-bind:key="'postcode-' + c.glid" :options="markerOptions" :name="c.glid" @mouseover="showPopup" @click="showPolygon(c, $event)">
          <l-icon :icon="icon" :options="iconOptions" :iconSize="[c.iconSize, c.iconSize]" :iconAnchor="c.iconAnchor"></l-icon>
          <l-popup :content="c.content" :latLng="c.latlng" :options="{ closeButton: false }"></l-popup>
        </l-marker>
      </div>
      <l-control-scale position="topright" :imperial="false" :metric="true"></l-control-scale>
      <v-geosearch :options="geosearchOptions"></v-geosearch>
      <l-control position="bottomleft" style="z-index: 760">
        <div>
          <div class="button-label">Step by day</div>
          <button @click="prevDate"><font-awesome-icon icon="angle-double-left" class="fa-4x"></font-awesome-icon></button>
          <button @click="nextDate"><font-awesome-icon icon="angle-double-right" class="fa-4x"></font-awesome-icon></button>
        </div>
      </l-control>
      <l-control position="bottomright" style="z-index: 760">
        <!-- map based controls go here -->
        <vue-dropzone ref="dropzone" id="dropzone" :options="dropzoneOptions" @vdropzone-success="handleData"></vue-dropzone>
      </l-control>
      <l-draw-toolbar position="topleft" />
      <l-polyline v-for="p in filteredTrackData" v-bind:key="p.id" :lat-lngs="p.points" :color="p.style.color" ref="userTracks" :options="{ pane: 'shadowPane', weight: 4, opacity: 0.4 }">
        <l-tooltip :options="{ permanent: false, interactive: true }">
          <strong>Activity:</strong>
          {{ p.description }}
          <br />
          <strong>From:</strong>
          {{ p.start }} to {{ p.end }}
        </l-tooltip>
      </l-polyline>
      <l-circle v-for="p in filteredLocData" v-bind:key="p.id" :lat-lng="p.points[0]" :radius="200" :color="p.style.color" :stroke="p.style.stroke" :fillColor="p.style.color" :fillOpacity="p.style.fillOpacity" :options="{ pane: 'shadowPane' }">
        <l-tooltip :options="{ permanent: false, interactive: true }">
          <strong>Place:</strong>
          {{ p.description }}
          <br />
          <strong>From:</strong>
          {{ p.start }} to {{ p.end }}
        </l-tooltip>
      </l-circle>
      <l-rectangle :bounds="mapBounds" :fill="false" :weight="0"></l-rectangle>
    </l-map>
  </div>
</template>

<script>
import L from "leaflet";
import { latLng, latLngBounds } from "leaflet";
import { LMap, LTileLayer, LMarker, LTooltip, LPopup, LControl, LControlScale, LIcon, LRectangle, LCircle, LPolyline, LGeoJson } from "vue2-leaflet";

import DynamicSelect from "vue-dynamic-select";
import LeafletHeatmap from "./Vue2LeafletHeatmap";
import Vue2LeafletDrawToolbar from "vue2-leaflet-draw-toolbar";
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
      showMarkers: false,
      showHeatmap: true,
      //keeps track of currently loaded case data
      caseDataLookup: {},
      // keeps track of current loaded and displayed state of geojson objects
      geoJsonStatusLookup: {},
      geojson: {
        type: "Point",
        coordinates: [30, 10],
      },
      geojsons: [],
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
      filteredTrackData: [],
      filteredLocData: [],
      maxValue: 100,
      latLngPlaceArray: [],
      casePlaceArray: [],
      latLngPostcodeArray: [],
      casePostcodeArray: [],
      locationsLookup: {},
      locationsArray: [],
      filteredLocationsArray: [],
      selectedState: {
        label: "Australia",
        value: {
          geom_id: 1,
          name: "Australia",
          bbox: [
            [-55.11579, 72.5781078],
            [-9.1406926, 167.9965857],
          ],
          geom_table: "australia_polygon",
        },
      },
      datesArray: [],
      statesArray: [],
      selectedDate: { label: "Latest", value: "latest" },
      location: null,
      gettingLocation: false,
      lgaPolygons: {},
      activePolygon: { color: "blue", latLngs: [] },
      viewOptions: [
        { value: "heat", label: "Heatmap" },
        { value: "marker", label: "Markers" },
      ],
      selectedView: { value: "heat", label: "Heatmap" },
      geojsonStyle: { style: { color: "red", fillColor: "green", stroke: 1 } },
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
      url: "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3V5bW9ydG9uIiwiYSI6ImNrOHkwNmg3bzAwMzkzZ3RibG9wem43N20ifQ.Lgs-FlpaE3S61_eGyTCEsQ",
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      withPopup: latLng(-37.799278, 145.059956),
      withTooltip: latLng(-33.8858088, 151.10248109002),
      mapZoom: 5,
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
      geoJsonPopup: L.popup({ closeButton: false }),
      glidWithPopup: null,
    };
  },
  computed: {
    // casesPlaces: function() {
    //   return this.casePlaceArray;
    // },
    // casesPostcodes: function() {
    //   return this.casePostcodeArray;
    // },
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
          response[date][i].style = {
            "z-index": 1000,
            color: "#ee0000",
            stroke: true,
            fillOpacity: 0.5,
          };
          response[date][i].id = i + "-" + response[date][i].start;
          response[date][i].start = formatDatetime(response[date][i].start, true);
          response[date][i].end = formatDatetime(response[date][i].end);
          response[date][i].date = date;
          if (response[date][i].points.length > 1) {
            response[date][i].style.color = "#ee0000";
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
      this.setDateFromIso(dataDates[0]);
    },
    filterUserTrackData() {
      for (var i = 0; i < this.userTracks.length; i++) {
        if (dateFormat(this.selectedDate.value) == this.userTracks[i].date) {
          this.filteredTrackData.push(this.userTracks[i]);
        }
      }
    },
    filterUserLocData() {
      for (var i = 0; i < this.userLocs.length; i++) {
        if (dateFormat(this.selectedDate.value) == this.userLocs[i].date) {
          this.filteredLocData.push(this.userLocs[i]);
        }
      }
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
    setMapLocation(obj) {
      console.log("calling set Map location");
      console.log(obj);
      if (obj && Object.prototype.hasOwnProperty.call(obj, "bbox")) {
        let me = this;
        this.hideAllLayers();
        this.$refs.map.mapObject.on("moveend", function() {
          me.showAllLayers();
        });
        this.showPolygon(obj);
        this.$refs.map.mapObject.fitBounds([obj.bbox]);
      }
    },
    zoomUpdate(zoom) {
      this.mapZoom = zoom;
    },
    centerUpdate(center) {
      this.mapCentre = center;
    },
    showPopup(obj) {
      console.log(obj);
      obj.target.openPopup();
    },
    hidePopupGeojson() {},
    hidePolygon(event) {
      console.log(event);
    },
    showGeojsonPopup(geojson) {
      console.log(geojson);
      this.glidWithPopup = geojson.id;
      this.geoJsonPopup = L.popup({ closeButton: false })
        .setLatLng(geojson.latlng)
        .setContent(geojson.content)
        .openOn(this.$refs.map.mapObject);
    },
    refreshGeojsonPopup() {
      if (this.geoJsonPopup && this.glidWithPopup && Object.prototype.hasOwnProperty.call(this.caseDataLookup, this.glidWithPopup)) {
        this.geoJsonPopup.setContent(this.caseDataLookup[this.glidWithPopup].content);
      }
      else if (this.geoJsonPopup) {
        this.geoJsonPopup.remove();
        this.glidWithPopup = null;
      }
    },
    showDataByLatLng(ll) {
      this.showDataUnderClick({ latlng: latLng(ll) });
    },
    showDataUnderClick(obj) {
      console.log("showDataUnderClick");
      console.log(obj);
      if (Object.prototype.hasOwnProperty.call(obj, "originalEvent")) {
        obj.originalEvent.stopPropagation();
      }
      var me = this;
      fetch("https://api.contactmap.me/glid_for_latlng/" + obj.latlng.lat + "/" + obj.latlng.lng)
        .then(function(response) {
          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " + response.status);
            return;
          }
          response.json().then(function(data) {
            me.showPolygon(me.locationsLookup[data.glid]);
          });
        })
        .catch(function(err) {
          console.log("Fetch Error :-S", err);
        });
    },
    showPolygon(obj, event) {
      if (event) {
        event.originalEvent.stopPropagation();
      }
      console.log("Getting polygon " + obj.glid);
      console.log(obj);
      var me = this;
      console.log(me.caseDataLookup);
      let glid = obj.glid;
      if (Object.prototype.hasOwnProperty.call(me.geoJsonStatusLookup, glid)) {
        console.log("already loaded polygon for " + obj.glid);
        if (this.geoJsonStatusLookup[glid].loading) {
          console.log("already loading " + glid);
          return;
        }
        if (!this.geoJsonStatusLookup[glid].visible) {
          console.log("pushing into geojsons "+JSON.stringify(this.geoJsonStatusLookup[glid].geojsonObj));
          this.geojsons.push(this.geoJsonStatusLookup[glid].geojsonObj);
          this.geoJsonStatusLookup[glid].visible = true;
        } else {
          // if (event) {
          //hide the geojson
          let newArray = [];
          for (let i = 0; i < this.geojsons.length; i++) {
            if (this.geojsons[i].id !== glid) {
              console.log("pushing into newArray "+JSON.stringify(this.geojsons[i]));
              newArray.push(this.geojsons[i]);
            }
          }
          this.geoJsonStatusLookup[glid].visible = false;
          console.log("setting geojsons to "+JSON.stringify(newArray));
          this.geojsons = newArray;
          // }
        }
        return;
      } 
      else {
        this.geoJsonStatusLookup[glid] = { loading: true };
      }
      let geotable = this.locationsLookup[glid].geotable;
      let geoid = this.locationsLookup[glid].geoid;
      fetch("https://api.contactmap.me/geometry/" + geotable + "/" + geoid)
        .then(function(response) {
          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " + response.status);
            return;
          }
          response.json().then(function(data) {
            let colour = "#666666";
            let value = 0;
            let content = "No data";
            let latlng = latLng(me.locationsLookup[glid].lat, me.locationsLookup[glid].lng);
            if (Object.prototype.hasOwnProperty.call(me.caseDataLookup, glid) && Object.prototype.hasOwnProperty.call(me.caseDataLookup[glid], "value")) {
              value = me.caseDataLookup[glid].value;
              colour = value > 39 ? me.dataColorLookup[39] : me.dataColorLookup[value];
              content = me.caseDataLookup[glid].content;
              latlng = me.caseDataLookup[glid].latlng;
            } else {
              console.log("tried to load polygon for " + glid + " but caseDataLookup didn't have a matching record");
              console.log(me.caseDataLookup);
            }
            let geojsonObj = {
              geojson: data.polygon,
              id: obj.glid,
              style: { fillColor: colour, color: colour },
              value: value,
              content: content,
              latlng: latlng,
              bbox: data.bbox,
            };
            me.geojsons.push(geojsonObj);
            me.geoJsonStatusLookup[glid] = { loading: false, loaded: true, visible: true, geojsonObj: geojsonObj };
          });
        })
        .catch(function(err) {
          console.log("Fetch Error :-S", err);
        });
    },
    updatePolygons() {
      console.log("running updatePolygons");
      let newArray = [];
      //if this has been hidden during a previous update, add it back to test it again
      for (let glid in this.geoJsonStatusLookup) {
        if (!this.geoJsonStatusLookup[glid].loading && !this.geoJsonStatusLookup[glid].visible && Object.prototype.hasOwnProperty.call(this.geoJsonStatusLookup[glid], 'geojsonObj')) {
          console.log("pushing into geojsons "+JSON.stringify(this.geoJsonStatusLookup[glid].geojsonObj));
          this.geojsons.push(this.geoJsonStatusLookup[glid].geojsonObj);
          this.geoJsonStatusLookup[glid].visible = true;
        }
      }
      for (let i = 0; i < this.geojsons.length; i++) {
        let glid = this.geojsons[i].id;
        if (Object.prototype.hasOwnProperty.call(this.caseDataLookup, glid)) {
          console.log("updating polygon " + glid + ": " + this.caseDataLookup[glid].value);
          let colour = "#fffffff";
          let value = 0;
          if (Object.prototype.hasOwnProperty.call(this.caseDataLookup[glid], "value")) {
            value = this.caseDataLookup[glid].value;
            colour = value > 39 ? this.dataColorLookup[39] : this.dataColorLookup[value];
          }
          console.log("pushing into newArray "+JSON.stringify(this.geojsons[i]));
          newArray.push({
            geojson: this.geojsons[i].geojson,
            id: this.geojsons[i].id,
            style: { fillColor: colour, color: colour },
            value: value,
            content: this.caseDataLookup[glid].content,
            latlng: this.geojsons[i].latlng,
            bbox: this.geojsons[i].bbox,
          });
        } else {
          console.log("couldn't update polygon " + glid);
          this.geoJsonStatusLookup[glid].visible = false;
          // newArray.push(this.geojsons[i]);
        }
      }
      console.log("setting geojsons to "+JSON.stringify(newArray));
      this.geojsons = newArray;
      this.refreshGeojsonPopup();
    },
    setMapHeight() {
      var heightString =
        window.innerHeight - document.getElementById("Navigation").offsetHeight - document.getElementById("ControlPanel").offsetHeight - document.getElementById("AppHeader").offsetHeight - document.getElementById("AppFooter").offsetHeight + "px";
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
                bbox: data[key].bbox,
                label: label,
                glid: key,
                latlng: latLng(data[key].lat, data[key].lng),
                state: data[key].state,
                geotable: data[key].geotable,
                geoid: data[key].geoid,
              });
            }
            me.locationsArray = me.filteredLocationsArray = locArray;
            console.log(locArray);
            // me.getPlaceData();
            me.getPlaceData();
            // me.getPostcodeData();
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
    nextDate() {
      console.log("next");
      if (this.selectedDate.value === "latest") {
        return;
      }
      var curPos = this.datesArray.indexOf(this.selectedDate);
      if (curPos >= 1) {
        this.selectedDate = this.datesArray[curPos - 1];
        document.dispatchEvent(new Event("DATE_CHANGED"));
      }
    },
    prevDate() {
      console.log("prev");
      var curPos = this.datesArray.indexOf(this.selectedDate);
      if (this.selectedDate.value === "latest") {
        this.selectedDate = this.datesArray[1];
        document.dispatchEvent(new Event("DATE_CHANGED"));
      } else if (this.datesArray.length > curPos + 1) {
        this.selectedDate = this.datesArray[curPos + 1];
        document.dispatchEvent(new Event("DATE_CHANGED"));
      }
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
    setDateFromIso(isodate) {
      for (var i = 0; i < this.datesArray.length; i++) {
        if (dateFormat(this.datesArray[i].value) == isodate) {
          this.setDate(this.datesArray[i]);
        }
      }
    },
    setDate(obj) {
      this.selectedDate = obj;
      console.log(this.selectedDate);
      document.dispatchEvent(new Event("DATE_CHANGED"));
      this.getPlaceData();
    },
    setState(obj) {
      console.log(obj);
      this.selectedState = obj;
      this.latLngPlaceArray = [];
      this.casePlaceArray = [];
      this.latLngPostcodeArray = [];
      this.casePostcodeArray = [];
      if (obj.label === "Australia") {
        this.$refs.map.mapObject.fitBounds(this.mapBounds);
      } else {
        this.$refs.map.mapObject.fitBounds(obj.value.bbox);
      }
      // this.mapBounds = obj.value.bbox;
      this.filterLocations();
      this.getPlaceData();
      // this.getPostcodeData();
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
            let caseLookup = {};
            for (var key in data) {
              if (Object.prototype.hasOwnProperty.call(data[key], "lat") && Object.prototype.hasOwnProperty.call(data[key], "lng")) {
                if (data[key].cases > 0) {
                  let myIconSize = data[key].cases > 0 ? (Math.log(data[key].cases) / Math.log(10)) * 25 + 10 : 0;
                  latLngArray.push([data[key].lat, data[key].lng, data[key].cases]);
                  caseLookup[key] = {
                    latlng: latLng(data[key].lat, data[key].lng),
                    geotable: data[key].geometry_table,
                    geoid: data[key].geometry_table_id,
                    iconSize: myIconSize,
                    value: data[key].cases.toString(),
                    content: data[key].cases.toString() + " Covid-19 Cases<br>" + data[key].place + " " + data[key].state,
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
            me.latLngPlaceArray = latLngArray;
            me.caseDataLookup = caseLookup;
            me.casePlaceArray = caseArray;
            me.showHeatmap = layerView === "heatmap";
            me.showMarkers = layerView === "markers";
            document.dispatchEvent(new Event("PLACE_DATA_LOADED"));
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
            let caseLookup = me.caseDataLookup;
            for (var key in data) {
              if (me.locationsLookup && Object.prototype.hasOwnProperty.call(me.locationsLookup, key) && Object.prototype.hasOwnProperty.call(me.locationsLookup[key], "lat") && Object.prototype.hasOwnProperty.call(me.locationsLookup[key], "lng")) {
                if (data[key].cases > 0 && me.locationsLookup[key].lat && me.locationsLookup[key].lng) {
                  let myIconSize = data[key].cases > 0 ? (Math.log(data[key].cases) / Math.log(10)) * 25 + 10 : 0;
                  latLngArray.push([me.locationsLookup[key].lat, me.locationsLookup[key].lng, data[key].cases]);
                  caseLookup[key] = {
                    latlng: latLng(me.locationsLookup[key].lat, me.locationsLookup[key].lng),
                    // geotable: me.locationsLookup[key].geometry_table,
                    // geoid: me.locationsLookup[key].geometry_table_id,
                    iconSize: myIconSize,
                    value: data[key].cases.toString(),
                    content: data[key].cases.toString() + " Covid-19 Cases<br>" + data[key].place + " " + data[key].postcode + " " + data[key].state,
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
            me.caseDataLookup = caseLookup;
            me.latLngPostcodeArray = latLngArray;
            me.casePostcodeArray = caseArray;
            console.log(me.latLngPostcodeArray);
            console.log(me.casePostcodeArray);
            console.log(me.caseDataLookup);
            me.showHeatmap = layerView === "heatmap";
            me.showMarkers = layerView === "markers";
            document.dispatchEvent(new Event("POSTCODE_DATA_LOADED"));
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
    document.addEventListener("PLACE_DATA_LOADED", {
      handleEvent: function(event) {
        console.log("PLACE_DATA_LOADED!");
        console.log(event);
        me.getPostcodeData();
      },
    });
    document.addEventListener("POSTCODE_DATA_LOADED", {
      handleEvent: function(event) {
        console.log("POSTCODE_DATA_LOADED!");
        console.log(event);
        me.updatePolygons();
      },
    });
    document.addEventListener("DATE_CHANGED", {
      handleEvent: function(event) {
        console.log("DATE_CHANGED!");
        console.log(event);
        me.filteredLocData = [];
        me.filteredTrackData = [];
        me.filterUserTrackData();
        me.filterUserLocData();
      },
    });
    this.$nextTick(() => {
      this.getLocations();
      this.getDates();
      this.getStates();
    });
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

function dateFormat(isoString) {
  return isoString.replace(/T.+$/, "");
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
/* button {
  background-color: #2e2888;
  border: none;
  color: rgb(255, 255, 255);
  padding: 0px 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-weight: bolder;
} */
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
  /* background: #74cff0; */
  background-color: #beccda;
  padding: 2px;
  z-index: 10000;
  display: flex;
}
.leaflet-toolbar-0 > li > .leaflet-toolbar-icon {
  width: 26px !important;
  height: 26px !important;
}
.leaflet-draw-toolbar.leaflet-control-toolbar {
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.5) !important;
}
.leaflet-toolbar-0 {
  border: 0px solid rgba(0, 0, 0, 0.2) !important;
}
button {
  background-color: #dff35e;
}
.button-label {
  background-color: #dff35e;
  color: black;
  text-align: center;
  font-weight: bold;
}
.dropzone .dz-message {
  margin: 0;
}
.dropzone {
  min-height: auto;
  background: #dff35e;
  color: black;
}
.dropzone:hover {
  background: #ddff00;
}
.vue-dropzone {
  border: 1px dashed #1f1f1f;
  border-radius: 10px;
}
</style>
