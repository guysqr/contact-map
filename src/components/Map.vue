<template>
  <div class="map-panel">
    <div id="ControlPanel" class="control-panel">
      <!-- <div class="control-panel-label">State:</div>
      <dynamic-select :options="statesArray" v-model="selectedState" @input="setState" option-value="value" option-text="label" style="width: 15em;"></dynamic-select>-->
      <div v-if="notMobile" class="control-panel-label">Date:</div>
      <vue-select :clearable="false" :options="datesArray" v-model="selectedDate" @input="setDate" option-value="value" option-text="label" style="width: 9em"></vue-select>
      <!-- <div class="control-panel-label">Area:</div>
      <dynamic-select :options="locationsArray" @input="setMapLocation" option-value="value" option-text="label" placeholder="type to search" style="width: 22em"></dynamic-select>-->
      <div v-if="notMobile" class="control-panel-label">Grouping:</div>
      <vue-select :clearable="false" :options="groupTypesArray" v-model="selectedGroupType" @input="showPolygonsInView(true)" option-value="value" option-text="label" placeholder="type to search" style="width: 10em"></vue-select>
      <div v-if="notMobile" class="control-panel-label">Colour Metric:</div>
      <vue-select :clearable="false" :options="colourMetricsArray" v-model="selectedColourMetric" @input="showPolygonsInView(true)" option-value="value" option-text="label" placeholder="type to search" style="width: 20em"></vue-select>
      <span class="message">{{ message }}</span>
      <!-- <div class="control-panel-label">View:</div>
      <dynamic-select :options="viewOptions" v-model="selectedView" @input="setViewOption" option-value="value" option-text="label" style="width: 10em"></dynamic-select>-->
    </div>
    <l-map id="map" v-if="showMap" :zoom="mapZoom" :center="mapCentre" :options="mapOptions" @update:center="centerUpdate" @update:zoom="zoomUpdate" ref="map" style="width:100%; height: 100vh; z-index: 100">
      <!--      @click="showDataUnderClick"-->
      <l-tile-layer :url="url" :attribution="attribution" />
      <l-control-scale position="topright" :imperial="false" :metric="true" :options="{ pane: 'shadowPane' }"></l-control-scale>
      <l-geo-json v-for="g in geojsons" v-bind:key="g.id" @layeradd="showSpinner" @click="showGeojsonPopup(g)" :geojson="g.geojson" :optionsStyle="g.style" :options="geoOptions"></l-geo-json>

      <v-geosearch :options="geosearchOptions" style="z-index: 660"></v-geosearch>
      <l-control position="bottomright" style="z-index: 660" v-if="notMobile">
        <div class="vue-dropzone dropzone" style="padding:10px 16px">
          <div class="button-label">Step by day</div>
          <button @click="prevDate" style="padding:5px">
            <font-awesome-icon icon="angle-double-left" class="fa-3x"></font-awesome-icon>
          </button>
          <button @click="nextDate" style="padding:5px">
            <font-awesome-icon icon="angle-double-right" class="fa-3x"></font-awesome-icon>
          </button>
        </div>
      </l-control>
      <l-control position="bottomright" style="z-index: 660" v-if="notMobile">
        <!-- map based controls go here -->
        <vue-dropzone ref="dropzone" id="dropzone" :options="dropzoneOptions" @vdropzone-success="handleData"></vue-dropzone>
      </l-control>
      <l-control position="bottomleft">
        <div>
          <button class="dropzone" @click="linkToView" style="padding:5px"><font-awesome-icon icon="copy" class="fa-1x"></font-awesome-icon> Copy View <font-awesome-icon icon="eye" class="fa-1x"></font-awesome-icon></button>
          <font-awesome-icon icon="check-circle" v-if="tickDisplayed" class="fa-2x" style="padding-left: 5px; color: green; margin-bottom: -5px"></font-awesome-icon>
        </div>
      </l-control>
      <l-draw-toolbar v-if="notMobile" position="topleft" />
      <l-polyline v-for="p in filteredTrackData" v-bind:key="p.id" :lat-lngs="p.points" :color="p.style.color" ref="userTracks" :weight="p.style.weight" :options="{ pane: 'shadowPane' }">
        <l-tooltip :options="{ permanent: false, interactive: true }">
          <strong>Activity:</strong>
          {{ p.description }}
          <br />
          <strong>From:</strong>
          {{ p.start }} to {{ p.end }}
        </l-tooltip>
      </l-polyline>
      <l-circle v-for="p in filteredLocData" v-bind:key="p.id" :lat-lng="p.points[0]" :radius="200" :color="p.style.color" :stroke="p.style.stroke" :weight="p.style.weight" :fillColor="p.style.color" :fillOpacity="p.style.fillOpacity" :options="{ pane: 'shadowPane' }">
        <l-tooltip :options="{ permanent: false, interactive: true }">
          <strong>Place:</strong>
          {{ p.description }}
          <br />
          <strong>From:</strong>
          {{ p.start }} to {{ p.end }}
        </l-tooltip>
      </l-circle>
      <!-- <l-popup v-for="p in dataDiffsArray" v-bind:key="p.glid">
          {{ p.diff }}
      </l-popup>-->

      <!-- <l-rectangle :bounds="mapBounds" :fill="false" :weight="0"></l-rectangle> -->
    </l-map>
    <pulse-loader v-if="displaySpinner" color="rgba(0,0,0,0.3)" radius="100%" size="20px" margin="5px" style="position: absolute; top: calc(50vh - 50px); margin-left: calc(50vw - 45px); z-index: 2001;"></pulse-loader>
  </div>
</template>

<script>
  import L from 'leaflet';
  import { latLng, latLngBounds } from 'leaflet';
  // import { LMap, LTileLayer, LMarker, LTooltip, LPopup, LControl, LControlScale, LIcon, LRectangle, LCircle, LPolyline, LGeoJson } from "vue2-leaflet";, LPopup
  import { LMap, LTileLayer, LTooltip, LControl, LControlScale, LCircle, LPolyline, LGeoJson } from 'vue2-leaflet';

  // import DynamicSelect from 'vue-dynamic-select';
  import VueSelect from 'vue-select';
  // import LeafletHeatmap from "./Vue2LeafletHeatmap";
  import Vue2LeafletDrawToolbar from 'vue2-leaflet-draw-toolbar';
  import { OpenStreetMapProvider } from 'leaflet-geosearch';
  import VGeosearch from 'vue2-leaflet-geosearch';
  import vue2Dropzone from 'vue2-dropzone';
  import 'vue2-dropzone/dist/vue2Dropzone.min.css';
  import Vue from 'vue';
  import device from 'vue-device-detector';
  import Analytics from '@aws-amplify/analytics';
  import Auth from '@aws-amplify/auth';
  const copy = require('copy-text-to-clipboard');

  const amplifyConfig = {
    Auth: {
      identityPoolId: 'ap-southeast-2:02653fea-9a5c-4f23-988d-515a807e6fdc',
      region: 'ap-southeast-2',
    },
  };
  //Initialize Amplify
  Auth.configure(amplifyConfig);

  const analyticsConfig = {
    AWSPinpoint: {
      // Amazon Pinpoint App Client ID
      appId: 'b6a323ab2b56450aa01f1efacdeaf9ee',
      // Amazon service region
      region: 'us-west-2',
      mandatorySignIn: false,
    },
  };

  Analytics.configure(analyticsConfig);

  //Record an event
  Analytics.record('loading');

  Vue.use(device);

  export default {
    name: 'MapPanel',
    components: {
      LMap,
      LTileLayer,
      // LMarker,
      // LeafletHeatmap,
      LTooltip,
      // LPopup,
      LControl,
      LControlScale,
      // LIcon,
      // LRectangle,
      LCircle,
      LPolyline,
      LGeoJson,
      'l-draw-toolbar': Vue2LeafletDrawToolbar,
      // DynamicSelect,
      VueSelect,
      VGeosearch,
      vueDropzone: vue2Dropzone,
    },

    data() {
      var corner1 = latLng(-44.522768, 160.471576);
      var corner2 = latLng(-8.44428, 110.060151);
      var maxMapBounds = latLngBounds(corner1, corner2);
      var startingMapCentre = maxMapBounds.getCenter();
      if (localStorage.startingMapCentre) {
        startingMapCentre = JSON.parse(localStorage.startingMapCentre);
      }
      var startingMapZoom = 5;
      if (localStorage.startingMapZoom) {
        startingMapZoom = Number(localStorage.startingMapZoom);
      }

      var colourMetricsArray = [
        { label: 'Total Cases', value: 'relativeHighest' },
        { label: 'Active Cases', value: 'activeHighest' },
        { label: 'Totals per Capita', value: 'totalPerCap' },
        { label: 'Active per Capita', value: 'activePerCap' },
      ];

      var startingColourMetric = colourMetricsArray[0];
      if (this.$route.query.metric) {
        for (var i = 0; i < colourMetricsArray.length; i++) {
          if (colourMetricsArray[i].value === this.$route.query.metric) {
            startingColourMetric = colourMetricsArray[i];
          }
        }
      } else if (localStorage.startingColourMetric) {
        startingColourMetric = JSON.parse(localStorage.startingColourMetric);
      }

      var groupTypesArray = [
        { label: 'LGAs', value: 'places' },
        { label: 'QLD HHS', value: 'qld' },
        { label: 'Postcodes', value: 'postcodes' },
      ];

      var startingGroupType = groupTypesArray[0];
      if (this.$route.query.group) {
        for (i = 0; i < groupTypesArray.length; i++) {
          if (groupTypesArray[i].value === this.$route.query.group) {
            startingGroupType = groupTypesArray[i];
          }
        }
      } else if (localStorage.startingGroupType) {
        startingGroupType = JSON.parse(localStorage.startingGroupType);
      }

      return {
        notMobile: !Vue.$device.mobile,
        tickDisplayed: false,
        initComplete: false,
        displaySpinner: true,
        spinnerStackDepth: 0,
        message: 'Loading...',
        // colourMetric: 'relativeHighest',
        geoOptions: { onEachFeature: this.showSpinnerTemporarily },
        dataCache: {
          places: {},
          postcodes: {},
          glidsInView: {},
          statesLoaded: false,
        },
        polygonsInView: [],
        showMarkers: true,
        showHeatmap: true,
        hideHeatmap: false,
        //keeps track of currently loaded case data
        caseDataLookup: {},
        // keeps track of current loaded and displayed state of geojson objects
        geoJsonStatusLookup: {},
        geojson: {
          type: 'Point',
          coordinates: [30, 10],
        },
        geojsons: [],
        mapBounds: [corner1, corner2],
        dropzoneOptions: {
          url: 'https://api.contactmap.me/upload',
          thumbnailWidth: 100,
          maxFilesize: 2,
          addRemoveLinks: true,
          dictDefaultMessage: 'Drop Google<br>Takeout JSON<br>file here...',
        },
        dataColorLookup: [],
        // placeDataColorLookup: [],
        // postcodeDataColorLookup: [],
        userTracks: [],
        userLocs: [],
        userDataTrackStyle: {
          'z-index': 1000,
          color: '#666666',
          stroke: true,
          weight: 2,
          fillOpacity: 0.8,
          strokeOpacity: 0.8,
        },
        userDataLocStyle: {
          'z-index': 1000,
          color: '#666666',
          stroke: true,
          weight: 1,
          fillOpacity: 0.2,
          strokeOpacity: 0.8,
        },
        filteredTrackData: [],
        filteredLocData: [],
        maxValue: 100,
        latLngPlaceArray: [],
        filteredLatLngPlaceArray: [],
        casePlaceArray: [],
        filteredCasePlaceArray: [],
        latLngPostcodeArray: [],
        filteredLatLngPostcodeArray: [],
        casePostcodeArray: [],
        filteredCasePostcodeArray: [],
        locationsLookup: {},
        // locationsArray: [],
        filteredLocationsArray: [],
        selectedState: {
          label: 'Australia',
          value: {
            geom_id: 1,
            name: 'Australia',
            bbox: [
              [-55.11579, 72.5781078],
              [-9.1406926, 167.9965857],
            ],
            geom_table: 'australia_polygon',
          },
        },
        groupTypesArray: groupTypesArray,
        selectedGroupType: startingGroupType,
        colourMetricsArray: colourMetricsArray,
        selectedColourMetric: startingColourMetric,
        defaultColourMetric: startingColourMetric,
        datesArray: [],
        dataDiffsArray: [],
        diffPopups: [],
        statesArray: [],
        lastMapClickLoc: null,
        selectedDate: { label: 'Latest', value: 'latest' },
        selectedIsoDate: null,
        previousDate: null,
        previousIsoDate: null,
        usersLocation: null,
        gettingLocation: false,
        lgaPolygons: {},
        activePolygon: { color: 'blue', latLngs: [] },
        viewOptions: [
          { value: 'heat', label: 'Heatmap' },
          { value: 'marker', label: 'Markers' },
        ],
        selectedView: { value: 'heat', label: 'Heatmap' },
        // geojsonStyle: { style: { color: 'red', fillColor: 'green', stroke: 1 } },
        icon: L.icon({
          iconUrl: 'https://www.contactmap.me/img/coronavirus.svg',
        }),
        iconOptions: {
          iconUrl: 'https://www.contactmap.me/img/coronavirus.svg',
        },
        markerOptions: {},
        clusterOptions: {
          className: 'cluster-css',
        },
        mapCentre: startingMapCentre,
        url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3V5bW9ydG9uIiwiYSI6ImNrOHkwNmg3bzAwMzkzZ3RibG9wem43N20ifQ.Lgs-FlpaE3S61_eGyTCEsQ',
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        // withPopup: latLng(-37.799278, 145.059956),
        // withTooltip: latLng(-33.8858088, 151.10248109002),
        mapZoom: startingMapZoom,
        showParagraph: false,
        accessToken: 'pk.eyJ1IjoiZ3V5bW9ydG9uIiwiYSI6ImNrOHkwNmg3bzAwMzkzZ3RibG9wem43N20ifQ.Lgs-FlpaE3S61_eGyTCEsQ',
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
        geoJsonPopup: L.popup({ closeButton: true, autoPan: true }),
        glidWithPopup: null,
      };
    },
    computed: {},
    methods: {
      setViewOption(obj) {
        this.selectedView.value = obj.value;
        //console.log(obj);
        // if (this.selectedView.value === 'heat') {
        //   this.showHeatmap = true;
        //   this.showMarkers = false;
        // } else {
        //   this.showHeatmap = false;
        //   this.showMarkers = true;
        // }
      },
      handleData(file, response) {
        //console.log(response);
        this.$refs.dropzone.removeFile(file);
        let dataDates = [];
        let setMapBounds = latLngBounds();
        let userTracks = [];
        let userLocs = [];
        for (var date in response) {
          //console.log(date);
          dataDates.push(date);
          for (var i = 0; i < response[date].length; i++) {
            response[date][i].style = this.userDataLocStyle;
            response[date][i].id = i + '-' + response[date][i].start;
            response[date][i].start = formatDatetime(response[date][i].start, true);
            response[date][i].end = formatDatetime(response[date][i].end);
            response[date][i].date = date;
            if (response[date][i].points.length > 1) {
              response[date][i].style = this.userDataTrackStyle;
              userTracks.push(response[date][i]);
            } else {
              userLocs.push(response[date][i]);
              setMapBounds.extend(response[date][i].points[0]);
              // this.showDataByLatLng(latLng(response[date][i].points[0]));
            }
          }
        }
        this.userTracks = userTracks;
        this.userLocs = userLocs;
        //console.log("fitting map to userdata bounds " + JSON.stringify(setMapBounds));
        this.hidePopup();
        this.$refs.map.mapObject.fitBounds(setMapBounds);
        this.setDateFromIso(dataDates[0]);
      },
      filterUserTrackData() {
        this.filteredTrackData.splice(0, this.filteredTrackData.length);
        for (var i = 0; i < this.userTracks.length; i++) {
          if (dateFormat(this.selectedDate.value) == this.userTracks[i].date) {
            this.filteredTrackData.push(this.userTracks[i]);
          }
        }
      },
      filterUserLocData() {
        this.filteredLocData.splice(0, this.filteredLocData.length);
        for (var i = 0; i < this.userLocs.length; i++) {
          if (dateFormat(this.selectedDate.value) == this.userLocs[i].date) {
            this.filteredLocData.push(this.userLocs[i]);
          }
        }
      },
      hideHeatmapLayers() {
        this.hideHeatmap = true;
      },
      showHeatmapLayers() {
        this.hideHeatmap = false;
      },
      hideMarkerLayer() {
        //console.log("hiding markers");
        this.showMarkers = false;
        this.filteredCasePlaceArray = [];
        this.filteredCasePostcodeArray = [];
      },
      showMarkerLayer() {
        //console.log("showing markers");
        this.showMarkers = true;
      },
      setMapLocation(obj) {
        if (!this.initComplete) {
          return;
        }
        if (obj && Object.prototype.hasOwnProperty.call(obj, 'bbox')) {
          this.showPolygon(obj);
          this.$refs.map.mapObject.fitBounds([obj.bbox]);
        }
      },
      zoomUpdate(zoom) {
        //console.log(zoom);
        if (this.mapZoom !== zoom) {
          localStorage.startingMapZoom = this.mapZoom = zoom;
          this.showPolygonsInView();
        }
      },
      centerUpdate(center) {
        if (this.mapCentre !== center) {
          this.mapCentre = center;
          if (this.initComplete) {
            localStorage.startingMapCentre = JSON.stringify(this.mapCentre);
            this.showPolygonsInView();
          }
        } else {
          console.log("center hasn't changed");
        }
      },
      showPopup(obj) {
        obj.target.openPopup();
      },
      hidePopup() {
        this.geoJsonPopup.remove();
        this.glidWithPopup = null;
      },
      showGeojsonPopup(geojson) {
        if (this.glidWithPopup === geojson.id) {
          this.hidePopup();
          return;
        }
        // delay = delay ? delay : 0;
        this.glidWithPopup = geojson.id;
        var content = geojson.content;
        for (var i = 0; i < this.dataDiffsArray.length; i++) {
          if (this.dataDiffsArray[i].glid === 'diff-' + geojson.id) {
            content += '<br>Difference: ' + this.dataDiffsArray[i].diff + ' between ' + this.dataDiffsArray[i].dates.replace(/ 2020/g, '');
          }
        }
        var me = this;
        // setTimeout(function() {
        me.geoJsonPopup = L.popup({
          closeButton: true,
          autoPan: true,
          offset: [0, -20],
        })
          .setLatLng(geojson.latlng)
          .setContent(content)
          .openOn(me.$refs.map.mapObject)
          .bringToFront();
        // }, delay);
      },
      refreshGeojsonPopup() {
        if (this.geoJsonPopup && this.glidWithPopup && Object.prototype.hasOwnProperty.call(this.caseDataLookup, this.glidWithPopup + '-' + this.selectedIsoDate)) {
          var content = this.caseDataLookup[this.glidWithPopup + '-' + this.selectedIsoDate].content;
          for (var i = 0; i < this.dataDiffsArray.length; i++) {
            if (this.dataDiffsArray[i].glid === 'diff-' + this.glidWithPopup) {
              content += '<br>Difference: ' + this.dataDiffsArray[i].diff + ' between ' + this.dataDiffsArray[i].dates.replace(/ 2020/g, '');
            }
          }
          this.geoJsonPopup.setContent(content);
        } else if (this.geoJsonPopup) {
          this.hidePopup();
          this.glidWithPopup = null;
        }
      },
      showDataByLatLng(latlng) {
        this.showDataUnderClick({ latlng: latlng });
      },
      showDataUnderClick(obj) {
        if (Object.prototype.hasOwnProperty.call(obj, 'originalEvent')) {
          obj.originalEvent.stopPropagation();
        }
        var me = this;
        if (this.lastMapClickLoc !== obj.latlng.lat + '/' + obj.latlng.lng) {
          this.lastMapClickLoc = obj.latlng.lat + '/' + obj.latlng.lng;
          fetch('https://api.contactmap.me/glid_for_latlng/' + obj.latlng.lat + '/' + obj.latlng.lng)
            .then(function(response) {
              if (response.status !== 200) {
                //console.log("Looks like there was a problem. Status Code: " + response.status);
                return;
              }
              response.json().then(function(data) {
                if (data.error) {
                  //console.log(data.error);
                  return;
                }
                var chosenGlid = data.glids[0];
                if (data.glids.length > 1) {
                  for (var i = 0; i < data.glids.length; i++) {
                    if (Object.prototype.hasOwnProperty.call(me.caseDataLookup, data.glids[i] + '-' + me.selectedIsoDate)) {
                      if (!Object.prototype.hasOwnProperty.call(me.geoJsonStatusLookup, data.glids[i])) {
                        chosenGlid = data.glids[i];
                      }
                    }
                  }
                }
                me.showPolygon(me.locationsLookup[chosenGlid]);
              });
            })
            .catch(function(err) {
              console.log('Fetch Error :-S', err);
            });
        } else {
          //console.log("double-click");
        }
      },
      hideOffscreenPolygons() {
        let newArray = [];
        for (let i = 0; i < this.geojsons.length; i++) {
          if (typeof this.geojsons[i] === 'undefined' || this.geojsons[i].loaded === false) {
            continue;
          }
          // console.log(i + " is the current index");
          if (this.polygonsInView.indexOf(this.geojsons[i].id) > -1) {
            newArray.push(this.geojsons[i]);
            // console.log("showing " + this.geojsons[i].id);
          } else {
            this.geoJsonStatusLookup[this.geojsons[i].id].visible = false;
            // console.log("hiding " + this.geojsons[i].id);
          }
        }
        this.geojsons.splice(0, this.geojsons.length);
        this.geojsons.push(...newArray);
      },
      showPolygonsInView(replace) {
        if (!this.initComplete) {
          return;
        }
        if (replace === true) {
          this.hideAllPolygons();
          //change colouring model if we need to
          console.log(this.selectedColourMetric);
          localStorage.startingGroupType = JSON.stringify(this.selectedGroupType);
          localStorage.startingColourMetric = JSON.stringify(this.selectedColourMetric);
          this.processPlaceData();
        }

        var me = this;
        if (Object.prototype.hasOwnProperty.call(this.$refs, 'map')) {
          var bbKey =
            this.selectedGroupType.value +
            '/' +
            this.$refs.map.mapObject
              .getBounds()
              .toBBoxString()
              .split(',')
              .join('/');
          if (Object.prototype.hasOwnProperty.call(me.dataCache.glidsInView, bbKey)) {
            var data = me.dataCache.glidsInView[bbKey];
            if (data === 'Requested') {
              return;
            }
            if (data.glids.length > 0) {
              me.polygonsInView = data.glids;
              me.hideOffscreenPolygons();
              for (var i = 0; i < data.glids.length; i++) {
                me.showPolygon(me.locationsLookup[data.glids[i]]);
              }
            }
          } else {
            me.dataCache.glidsInView[bbKey] = 'Requested';
            fetch('https://api.contactmap.me/glid_for_bounds/' + bbKey)
              .then(function(response) {
                if (response.status !== 200) {
                  console.log('Looks like there was a problem. Status Code: ' + response.status);
                  return;
                }
                response.json().then(function(data) {
                  console.log('Glids in view');
                  console.log(data);
                  if (data.error) {
                    //console.log(data.error);
                    return;
                  }
                  me.dataCache.glidsInView[bbKey] = data;
                  if (data.glids.length > 0) {
                    me.polygonsInView = data.glids;
                    me.hideOffscreenPolygons();
                    for (var i = 0; i < data.glids.length; i++) {
                      me.showPolygon(me.locationsLookup[data.glids[i]]);
                    }
                  }
                });
              })
              .catch(function(err) {
                console.log('Fetch Error :-S', err);
              });
          }
        }
      },
      hideAllPolygons() {
        for (var geo in this.geoJsonStatusLookup) {
          this.geoJsonStatusLookup[geo].visible = false;
        }
        this.geojsons.splice(0, this.geojsons.length);
        //hide all popups
        this.clearDiffPopups();
      },
      hideHiddenPolygons() {
        console.log('hiding hidden polygons');
        let newArray = [];
        for (var glid in this.geoJsonStatusLookup) {
          if (!this.geoJsonStatusLookup[glid].visible && this.polygonsInView.indexOf(glid) > -1) {
            //console.log("pushing into geojsons "+JSON.stringify(this.geoJsonStatusLookup[glid].geojsonObj));
            this.geojsons.push(this.geoJsonStatusLookup[glid].geojsonObj);
            this.geoJsonStatusLookup[glid].visible = true;
          }
          if (this.geoJsonStatusLookup[glid].visible) {
            newArray.push(this.geoJsonStatusLookup[glid].geojsonObj);
          }
        }
        this.geojsons.splice(0, this.geojsons.length);
        this.geojsons.push(...newArray);
      },
      showPolygon(obj, event) {
        if (event) {
          event.originalEvent.stopPropagation();
        }
        //console.log("Getting polygon " + obj.glid);
        //console.log(obj);
        var me = this;
        //console.log(me.caseDataLookup);
        let glid = obj.glid;
        if (Object.prototype.hasOwnProperty.call(me.geoJsonStatusLookup, glid)) {
          //console.log("already loaded polygon for " + obj.glid);
          if (this.geoJsonStatusLookup[glid].loading) {
            // console.log("already loading " + glid);
            return;
          }
          if (!this.geoJsonStatusLookup[glid].visible && this.polygonsInView.indexOf(glid) > -1) {
            //console.log("pushing into geojsons "+JSON.stringify(this.geoJsonStatusLookup[glid].geojsonObj));
            if (this.caseDataLookup[glid + '-' + this.selectedIsoDate]) {
              var colour = this.dataColorLookup[this.caseDataLookup[glid + '-' + this.selectedIsoDate].colourIndex];
              var content = this.caseDataLookup[glid + '-' + this.selectedIsoDate].content;

              this.geoJsonStatusLookup[glid].geojsonObj.style.fillColor = colour;
              this.geoJsonStatusLookup[glid].geojsonObj.style.color = 'silver';
              this.geoJsonStatusLookup[glid].geojsonObj.content = content;
            }

            this.geojsons.push(this.geoJsonStatusLookup[glid].geojsonObj);
            this.geoJsonStatusLookup[glid].visible = true;
          } else {
            if (event) {
              //hide the geojson
              let newArray = [];
              for (let i = 0; i < this.geojsons.length; i++) {
                if (typeof this.geojsons[i] === 'undefined' || this.geojsons[i].loaded === false) {
                  continue;
                }
                if (this.geojsons[i].id !== glid) {
                  //console.log("pushing into newArray "+JSON.stringify(this.geojsons[i]));
                  newArray.push(this.geojsons[i]);
                }
              }
              this.geoJsonStatusLookup[glid].visible = false;
              //console.log("setting geojsons to "+JSON.stringify(newArray));

              this.geojsons.splice(0, this.geojsons.length);
              this.geojsons.push(...newArray);
            }
          }
          return;
        } else {
          this.geoJsonStatusLookup[glid] = { loading: true };
        }
        let geotable = this.locationsLookup[glid].geotable;
        let geoid = this.locationsLookup[glid].geoid;
        fetch('https://api.contactmap.me/geometry/' + geotable + '/' + geoid)
          .then(function(response) {
            if (response.status !== 200) {
              //console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            response.json().then(function(data) {
              let colour = 'rgba(0,0,0,0)';
              let value = 0;
              let content = 'No data';
              let latlng = latLng(me.locationsLookup[glid].lat, me.locationsLookup[glid].lng);
              let geojsonObj = {
                geojson: data.polygon,
                id: obj.glid,
                latlng: latlng,
                content: content,
                value: value,
                bbox: data.bbox,
                style: {
                  fillColor: colour,
                  color: 'silver',
                  strokeWidth: 0.5,
                  weight: 0.5,
                  fillOpacity: 0.4,
                },
              };
              me.geoJsonStatusLookup[glid] = {
                loading: false,
                loaded: true,
              };
              if (Object.prototype.hasOwnProperty.call(me.caseDataLookup, glid + '-' + me.selectedIsoDate) && Object.prototype.hasOwnProperty.call(me.caseDataLookup[glid + '-' + me.selectedIsoDate], 'value')) {
                value = me.caseDataLookup[glid + '-' + me.selectedIsoDate].value;
                //get lookup based on data position relative to peak
                // colour = value >= me.dataColorLookup.length ? me.dataColorLookup[me.dataColorLookup.length - 1] : me.dataColorLookup[value];
                colour = me.dataColorLookup[me.caseDataLookup[glid + '-' + me.selectedIsoDate].colourIndex];
                content = me.caseDataLookup[glid + '-' + me.selectedIsoDate].content;
                geojsonObj.style = {
                  fillColor: colour,
                  color: 'silver',
                  strokeWidth: 0.5,
                  weight: 0.5,
                  fillOpacity: 0.4,
                };
                geojsonObj.value = value;
                geojsonObj.content = content;
                me.geojsons.push(geojsonObj);
                me.geoJsonStatusLookup[glid].visible = true;
              } else {
                // console.log("tried to load polygon for " + glid + " but caseDataLookup didn't have a matching record");
                me.geoJsonStatusLookup[glid].visible = false;
              }
              me.geoJsonStatusLookup[glid].geojsonObj = geojsonObj;
            });
          })
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
            me.geoJsonStatusLookup[glid] = { loading: false };
          });
      },
      updatePolygons() {
        console.log('running updatePolygons');
        // this.showSpinnerTemporarily(3000);
        // let newArray = [];
        //if this has been hidden during a previous update, add it back to test it again
        for (let glid in this.geoJsonStatusLookup) {
          if (!this.geoJsonStatusLookup[glid].loading && !this.geoJsonStatusLookup[glid].visible && Object.prototype.hasOwnProperty.call(this.geoJsonStatusLookup[glid], 'geojsonObj')) {
            //console.log("pushing into geojsons "+JSON.stringify(this.geoJsonStatusLookup[glid].geojsonObj));
            this.geojsons.push(this.geoJsonStatusLookup[glid].geojsonObj);
            this.geoJsonStatusLookup[glid].visible = true;
          }
        }
        for (let i = 0; i < this.geojsons.length; i++) {
          if (typeof this.geojsons[i] === 'undefined' || this.geojsons[i].loaded === false) {
            continue;
          }
          let glid = this.geojsons[i].id;
          // let dataKey = glid + '-' + this.selectedIsoDate;
          // console.log(glid);
          // console.log(dataKey);
          // console.log(Object.prototype.hasOwnProperty.call(this.caseDataLookup, dataKey));
          // console.log(this.polygonsInView.indexOf(glid));
          if (this.polygonsInView.indexOf(glid) > -1 && Object.prototype.hasOwnProperty.call(this.caseDataLookup, glid + '-' + this.selectedIsoDate)) {
            // console.log('updating polygon ' + this.geojsons[i].content + ': ' + this.caseDataLookup[glid + '-' + this.selectedIsoDate].value);
            let colour = this.dataColorLookup[0];
            let value = 0;
            if (Object.prototype.hasOwnProperty.call(this.caseDataLookup[glid + '-' + this.selectedIsoDate], 'value')) {
              value = this.caseDataLookup[glid + '-' + this.selectedIsoDate].value;
              // colour = value >= this.dataColorLookup.length ? this.dataColorLookup[this.dataColorLookup.length - 1] : this.dataColorLookup[value];
              colour = this.dataColorLookup[this.caseDataLookup[glid + '-' + this.selectedIsoDate].colourIndex];
            }
            // console.log("pushing into newArray "+JSON.stringify(this.geojsons[i]));
            let geojsonObj = {
              geojson: this.geojsons[i].geojson,
              id: this.geojsons[i].id,
              style: {
                fillColor: colour,
                color: 'silver',
                strokeWidth: 0.5,
                weight: 0.5,
                fillOpacity: 0.4,
              },
              value: value,
              content: this.caseDataLookup[glid + '-' + this.selectedIsoDate].content,
              latlng: this.geojsons[i].latlng,
              bbox: this.geojsons[i].bbox,
            };
            // newArray.push(geojsonObj);
            this.geoJsonStatusLookup[glid].geojsonObj = geojsonObj;
          } else {
            // console.log("couldn't update polygon " + this.geojsons[i].content + ': ' + glid + '-' + this.selectedIsoDate);
            this.geoJsonStatusLookup[glid].visible = false;
            // newArray.push(this.geojsons[i]);
          }
        }
        this.$nextTick(() => {
          this.hideHiddenPolygons();
          this.refreshGeojsonPopup();
          // this.hideSpinner();
        });
      },
      setMapHeight() {
        console.log('setting map height');
        var footerHeight = document.getElementById('AppFooter') ? document.getElementById('AppFooter').offsetHeight : 0;
        var heightString = window.innerHeight - document.getElementById('ControlPanel').offsetHeight - document.getElementById('AppHeader').offsetHeight - footerHeight + 'px';
        document.getElementById('map').style.height = heightString;
        this.$refs.map.mapObject.invalidateSize();
      },
      getLocations() {
        var me = this;
        fetch('https://api.contactmap.me/geolocations')
          .then(function(response) {
            if (response.status !== 200) {
              //console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            response.json().then(function(data) {
              me.locationsLookup = data;
              document.dispatchEvent(new Event('LOCATIONS_LOADED'));
            });
          })
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });
      },
      getDates() {
        var me = this;
        fetch('https://api.contactmap.me/dates')
          .then(function(response) {
            if (response.status !== 200) {
              //console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            response.json().then(function(data) {
              me.datesArray = data;
              if (me.$route.query.date) {
                //find date in data
                var dateIndex = 0;
                for (var i = 0; i < me.datesArray.length; i++) {
                  if (me.datesArray[i].value.substr(0, 10) === me.$route.query.date.substr(0, 10)) {
                    dateIndex = i;
                  }
                }
                me.selectedIsoDate = me.datesArray[dateIndex].value;
                me.selectedDate = me.datesArray[dateIndex];
              } else if (localStorage.startingDate) {
                me.selectedIsoDate = JSON.parse(localStorage.startingIsoDate);
                me.selectedDate = JSON.parse(localStorage.startingDate);
              } else {
                me.selectedIsoDate = me.datesArray[0].value;
                me.selectedDate = me.datesArray[0];
              }
              document.dispatchEvent(new Event('DATES_LOADED'));
            });
          })
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });
      },
      nextDate() {
        if (this.selectedDate.value === 'latest') {
          return;
        }
        var curPos = this.datesArray.indexOf(this.selectedDate);
        if (curPos >= 1) {
          this.selectedDate = this.datesArray[curPos - 1];
        }
        this.setDate(this.selectedDate);
      },
      prevDate() {
        //console.log("prev");
        var curPos = this.datesArray.indexOf(this.selectedDate);
        if (this.selectedDate.value === 'latest') {
          this.selectedDate = this.datesArray[1];
        } else if (this.datesArray.length > curPos + 1) {
          this.selectedDate = this.datesArray[curPos + 1];
        }
        this.setDate(this.selectedDate);
      },
      getStates() {
        if (this.dataCache.statesLoaded) {
          return;
        }
        this.dataCache.statesLoaded = true;
        var me = this;
        fetch('https://api.contactmap.me/states')
          .then(function(response) {
            if (response.status !== 200) {
              //console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            response.json().then(function(data) {
              //console.log(data);
              me.statesArray = data;
              me.selectedState = me.statesArray[0];
              document.dispatchEvent(new Event('STATES_LOADED'));
            });
          })
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });
      },
      setDateFromIso(isodate) {
        this.selectedDate = this.getDateFromIso(isodate);
      },
      getDateFromIso(isodate) {
        for (var i = 0; i < this.datesArray.length; i++) {
          if (dateFormat(this.datesArray[i].value) === dateFormat(isodate)) {
            return this.datesArray[i];
          }
        }
        console.log(isodate + ' not found');
      },
      setDate(obj) {
        if (!this.initComplete) {
          return;
        }
        this.previousIsoDate = this.selectedIsoDate;
        this.previousDate = this.getDateFromIso(this.previousIsoDate);
        if (obj.value === 'latest') {
          this.selectedIsoDate = this.datesArray[1].value; //swap for first real date
        } else {
          this.selectedIsoDate = obj.value;
        }
        this.selectedDate = obj;
        // this.hideAllPolygons();
        console.log('date set to ' + this.selectedIsoDate);
        localStorage.startingDate = JSON.stringify(this.selectedDate);
        localStorage.startingIsoDate = JSON.stringify(this.selectedIsoDate);
        document.dispatchEvent(new Event('DATE_CHANGED'));
      },
      calculateChangesBetweenDates() {
        this.dataDiffsArray = [];
        var from = this.previousIsoDate,
          to = this.selectedIsoDate;
        for (var glid in this.geoJsonStatusLookup) {
          if (this.geoJsonStatusLookup[glid].visible) {
            if (Object.prototype.hasOwnProperty.call(this.caseDataLookup, glid + '-' + from) && Object.prototype.hasOwnProperty.call(this.caseDataLookup, glid + '-' + to)) {
              if (this.caseDataLookup[glid + '-' + to].value - this.caseDataLookup[glid + '-' + from].value !== 0) {
                this.dataDiffsArray.push({
                  glid: 'diff-' + glid,
                  latlng: this.geoJsonStatusLookup[glid].geojsonObj.latlng,
                  diff: this.caseDataLookup[glid + '-' + to].value - this.caseDataLookup[glid + '-' + from].value,
                  dates: this.previousDate.label + ' &amp; ' + this.selectedDate.label,
                });
              } else {
                console.log('data diff for ' + glid + '=0');
              }
            } else {
              console.log("didn't have data for " + glid + ' from ' + from + ' and ' + to);
            }
          }
        }
        console.log('data diffs');
        this.showDataChanges();
        console.log(this.dataDiffsArray);
      },
      clearDiffPopups() {
        for (var i = 0; i < this.diffPopups.length; i++) {
          this.diffPopups[i].removeFrom(this.$refs.map.mapObject);
        }
      },
      showDataChanges() {
        if (Object.prototype.hasOwnProperty.call(this.$refs, 'map')) {
          this.clearDiffPopups();
          for (var i = 0; i < this.dataDiffsArray.length; i++) {
            var classChoice = this.dataDiffsArray[i].diff > 0 ? 'diff-popup-up' : 'diff-popup-down';
            var size = 'pop-size-small';
            size = this.dataDiffsArray[i].diff > 5 ? 'pop-size-medium' : size;
            size = this.dataDiffsArray[i].diff > 10 ? 'pop-size-large' : size;
            this.diffPopups.push(
              L.popup({
                closeButton: false,
                autoPan: false,
                className: classChoice + ' ' + size,
                closeOnClick: false,
                offset: [0, 20],
              })
                .setLatLng(this.dataDiffsArray[i].latlng)
                .setContent('' + this.dataDiffsArray[i].diff)
                .addTo(this.$refs.map.mapObject)
                .bringToBack()
            );
          }
        }
      },
      getPlaceData() {
        this.message = 'Loading data...';
        if (Object.prototype.hasOwnProperty.call(this.dataCache.places, this.selectedState.value.name + '/' + this.selectedDate.value)) {
          console.log('** place data retrieved from dataCache for ' + this.selectedState.value.name + '/' + this.selectedDate.value);
          document.dispatchEvent(new Event('PLACE_DATA_LOADED'));
          return;
        }
        this.dataCache.places[this.selectedState.value.name + '/' + this.selectedDate.value] = true;
        var me = this;

        fetch('https://api.contactmap.me/by_place/' + this.selectedState.value.name + '/' + this.selectedDate.value)
          .then(function(response) {
            if (response.status !== 200) {
              //console.log("Looks like there was a problem. Status Code: " + response.status);
              return;
            }
            response.json().then(function(data) {
              console.log(data);
              me.dataCache.places[me.selectedState.value.name + '/' + me.selectedDate.value] = data;

              me.processPlaceData();

              me.$nextTick(() => {
                document.dispatchEvent(new Event('PLACE_DATA_LOADED'));
              });
            });
          })
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });
      },
      processPlaceData() {
        var data = this.dataCache.places[this.selectedState.value.name + '/' + this.selectedDate.value];
        for (var key in data) {
          if (data[key].geometry_table_id !== null && Object.prototype.hasOwnProperty.call(data[key], 'lat') && Object.prototype.hasOwnProperty.call(data[key], 'lng')) {
            var activeCases = data[key].active ? data[key].active : 'Unknown';
            var decorated = this.decorateData(data, key);
            Vue.set(this.caseDataLookup, key + '-' + this.selectedIsoDate, {
              latlng: latLng(this.locationsLookup[key].lat, this.locationsLookup[key].lng),
              colourIndex: decorated.colourIndex,
              value: data[key].cases.toString(),
              cases: data[key].cases,
              active: activeCases,
              population: decorated.population,
              casesPerCapita: decorated.casesPerCapita,
              activePerCapita: decorated.activePerCapita,
              content: decorated.content,
              place: data[key].place + ' ' + data[key].state,
            });
          }
        }
        console.log(this.caseDataLookup, 'Case data lookup:');
      },
      getPostcodeData() {
        this.showSpinnerTemporarily(3000);
        if (Object.prototype.hasOwnProperty.call(this.dataCache.postcodes, this.selectedState.value.name + '/' + this.selectedDate.value)) {
          console.log('** postcode data retrieved from dataCache for ' + this.selectedState.value.name + '/' + this.selectedDate.value);
          document.dispatchEvent(new Event('ALL_DATA_LOADED'));
          return;
        }
        this.dataCache.postcodes[this.selectedState.value.name + '/' + this.selectedDate.value] = true;
        var me = this;
        // var layerView = this.showHeatmap ? 'heatmap' : 'markers';
        //console.log("getting data");
        fetch('https://api.contactmap.me/by_postcode/' + this.selectedState.value.name + '/' + this.selectedDate.value)
          .then(function(response) {
            if (response.status !== 200) {
              //console.log("Looks like there was a problem. Status Code: " + response.status);
              me.hideSpinner();
              return;
            }
            // me.showHeatmap = false;
            // me.showMarkers = false;
            response.json().then(function(data) {
              // me.setPostcodeColours(data.highest_cases);
              for (var key in data) {
                if (Object.prototype.hasOwnProperty.call(me.locationsLookup, key) && Object.prototype.hasOwnProperty.call(me.locationsLookup[key], 'lat') && Object.prototype.hasOwnProperty.call(me.locationsLookup[key], 'lng')) {
                  var activeCases = data[key].active ? data[key].active : 'Unknown';
                  Vue.set(me.caseDataLookup, key + '-' + me.selectedIsoDate, {
                    latlng: latLng(me.locationsLookup[key].lat, me.locationsLookup[key].lng),
                    colourIndex: Math.ceil((data[key].cases / data.highest_cases) * 239),
                    value: data[key].cases.toString(),
                    cases: data[key].cases.toString(),
                    active: activeCases,
                    content: data[key].cases.toString() + ' Covid-19 Cases<br>' + data[key].place + ' ' + data[key].postcode + ' ' + data[key].state,
                    place: data[key].place + ' ' + data[key].postcode + ' ' + data[key].state,
                  });
                }
              }

              console.log(me.caseDataLookup, 'Case data lookup:');

              if (me.initComplete === false) {
                me.initComplete = true;
                document.dispatchEvent(new Event('INIT_COMPLETE'));
              }
              me.$nextTick(() => {
                me.hideSpinner();
                // me.message = 'Data loading complete.';
                document.dispatchEvent(new Event('ALL_DATA_LOADED'));
              });
            });
          })
          .catch(function(err) {
            me.hideSpinner();
            console.log('Fetch Error :-S', err);
          });
      },
      linkToView() {
        var me = this;
        if (copy('https://contactmap.me/#/?date=')) {
          // alert('copied');
          this.tickDisplayed = true;
          setTimeout(function() {
            me.tickDisplayed = false;
          }, 3000);
        }
      },
      decorateData(data, glid) {
        var decorated = {};
        if (!Object.prototype.hasOwnProperty.call(this.locationsLookup, glid)) {
          console.log(glid + ' not found');
          return {};
        }
        var population = this.locationsLookup[glid].population ? this.locationsLookup[glid].population : 'Unknown';
        var postcode = data[glid].postcode ? data[glid].postcode + ': ' : '';
        var casesPerCapita = null;
        var activeCases = data[glid].active !== null ? data[glid].active : 'Unknown';
        var activePerCapita = null;
        decorated.colourIndex = 0;
        decorated.content = '<b>' + data[glid].cases + ' Covid-19 Cases</b><br>' + data[glid].place + ' ' + data[glid].state + '<br>Population: ' + population + '<br>Total Cases: ' + data[glid].cases;
        console.log(this.selectedColourMetric.value);
        if (population !== 'Unknown' && activeCases !== 'Unknown' && this.selectedColourMetric.value === 'activePerCap') {
          decorated.casesPerCapita = casesPerCapita = (data[glid].cases / population) * 100;
          decorated.activePerCapita = activePerCapita = (data[glid].active / population) * 100;
          decorated.colourIndex = Math.ceil(decorated.activePerCapita * 239) > 239 ? 239 : Math.ceil(decorated.activePerCapita * 239);
          decorated.content =
            '<b>' + postcode + data[glid].place + ', ' + data[glid].state + '</b><br>Population: ' + population + '<br>Total Cases: ' + data[glid].cases + '<br>Active Cases: ' + activeCases + '<br>% of residents infected (total): ' + Math.round(casesPerCapita * 100) / 100 + '%<br>% of residents infectious (active): ' + Math.round(activePerCapita * 100) / 100 + '%';
        } else if (population !== 'Unknown' && this.selectedColourMetric.value === 'totalPerCap') {
          decorated.casesPerCapita = casesPerCapita = (data[glid].cases / population) * 100;
          decorated.colourIndex = Math.ceil(decorated.casesPerCapita * 239) > 239 ? 239 : Math.ceil(decorated.casesPerCapita * 239);
          decorated.content = '<b>' + postcode + data[glid].place + ', ' + data[glid].state + '</b><br>Population: ' + population + '<br>Total Cases: ' + data[glid].cases + '<br>% of residents infected (total): ' + Math.round(casesPerCapita * 100) / 100 + '%';
        } else if (activeCases !== 'Unknown' && this.selectedColourMetric.value === 'activeHighest') {
          decorated.content = '<b>' + postcode + data[glid].place + ', ' + data[glid].state + '</b><br>Population: ' + population + '<br>Total Cases: ' + data[glid].cases + '<br>Active Cases: ' + data[glid].active;
          decorated.colourIndex = Math.ceil((activeCases / data.highest_active_cases) * 239);
        } else if (this.selectedColourMetric.value === 'relativeHighest') {
          decorated.content = '<b>' + postcode + data[glid].place + ', ' + data[glid].state + '</b><br>Population: ' + population + '<br>Total Cases: ' + data[glid].cases;
          decorated.colourIndex = Math.ceil((data[glid].cases / data.highest_cases) * 239);
        } else {
          decorated.content = '<b>' + postcode + data[glid].place + ', ' + data[glid].state + '</b><br>Population: ' + population + '<br>Total Cases: ' + data[glid].cases;
          // this.selectedColourMetric = this.defaultColourMetric;
          decorated.colourIndex = Math.ceil((data[glid].cases / data.highest_cases) * 239);
        }
        decorated.content = '<b>' + this.selectedDate.label + '</b><br>' + decorated.content;
        return decorated;
      },
      showSpinner() {
        // console.log('showing spinner: ' + this.spinnerStackDepth);
        this.displaySpinner = true;
        this.spinnerStackDepth++;
      },
      hideSpinner() {
        // console.log('hiding spinner: ' + this.spinnerStackDepth);
        this.spinnerStackDepth--;
        if (this.spinnerStackDepth < 1) {
          this.displaySpinner = false;
          this.message = 'Data load complete.';
          this.spinnerStackDepth = 0;
        }
      },
      showSpinnerTemporarily(timeout) {
        var timeoutMs = timeout ? timeout : 1000;
        this.showSpinner();
        setTimeout(this.hideSpinner, timeoutMs);
      },
      geolocateUser() {
        console.log('doing geolocateUser');
        var me = this;
        //do we support geolocation
        if (localStorage.startingMapCentre && localStorage.startingMapZoom) {
          setTimeout(function() {
            me.$refs.map.mapObject.setView(JSON.parse(localStorage.startingMapCentre), Number(localStorage.startingMapZoom), {
              duration: 0.1,
            });
            me.hideSpinner();
            me.message = 'Successfully located from session, loading data...';
          }, 20);
        } else if ('geolocation' in navigator) {
          this.showSpinnerTemporarily(3000);
          this.message = 'Geolocating you...';
          this.gettingLocation = true;
          // get position
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              this.gettingLocation = false;
              this.usersLocation = latLng(pos.coords.latitude, pos.coords.longitude);
              setTimeout(function() {
                me.$refs.map.mapObject.setView(me.usersLocation, 9, {
                  duration: 0.1,
                });
                me.hideSpinner();
                me.message = 'Successfully geolocated, loading data...';
              }, 10);
            },
            (err) => {
              this.gettingLocation = false;
              console.log('Got an error when geolocating, perhaps Safari being annoying...');
              console.log(err);
              setTimeout(function() {
                me.$refs.map.mapObject.setView(me.mapCentre, me.mapZoom, {
                  duration: 0.1,
                });
                me.hideSpinner();
                me.message = 'Geolocation failed! Setting default location.';
              }, 10);
            }
          );
        } else {
          console.log('Geolocation is not available.');
        }
      },
    },
    created() {},
    mounted() {
      var me = this;

      this.setMapHeight();

      window.addEventListener('resize', function() {
        setTimeout(me.setMapHeight, 50);
      });

      // window.addEventListener('orientationchange', function() {

      // });

      for (let i = 0; i < 80; i++) {
        this.dataColorLookup.push(rgbToHex((255 / 80) * i, 240, 0));
      }
      for (let i = 0; i < 160; i++) {
        this.dataColorLookup.push(rgbToHex(255, 240 - Math.ceil((240 / 160) * i), 0));
      }

      let dateChangeFunc = function() {
        me.getPlaceData();
      };
      let dataLoadedFunction = function() {
        me.filterUserTrackData();
        me.filterUserLocData();
        me.updatePolygons();
        me.calculateChangesBetweenDates();
      };
      var groupIndex = parseInt(this.$route.query.groupType);
      if (groupIndex > -1 && groupIndex < this.groupTypesArray.length) {
        this.selectedGroupType = this.groupTypesArray[groupIndex];
      }
      document.removeEventListener('PLACE_DATA_LOADED', this.getPostcodeData);
      document.removeEventListener('ALL_DATA_LOADED', dataLoadedFunction);
      document.removeEventListener('DATES_LOADED', this.getLocations);
      document.removeEventListener('LOCATIONS_LOADED', this.getStates);
      document.removeEventListener('STATES_LOADED', this.getPlaceData);
      document.removeEventListener('DATE_CHANGED', dateChangeFunc);
      document.removeEventListener('INIT_COMPLETE', this.geolocateUser);
      document.addEventListener('DATES_LOADED', this.getLocations);
      document.addEventListener('LOCATIONS_LOADED', this.getStates);
      document.addEventListener('PLACE_DATA_LOADED', this.getPostcodeData);
      document.addEventListener('ALL_DATA_LOADED', dataLoadedFunction);
      document.addEventListener('STATES_LOADED', this.getPlaceData);
      document.addEventListener('DATE_CHANGED', dateChangeFunc);
      document.addEventListener('INIT_COMPLETE', this.geolocateUser);
      this.$nextTick(() => {
        this.getDates();
      });
    },
  };

  function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function formatDatetime(isoString, justTime) {
    var dateParts = isoString.split(/\D/);
    if (justTime) {
      return dateParts[3] + ':' + dateParts[4];
    }
    return dateParts[3] + ':' + dateParts[4] + ' ' + dateParts[2] + '/' + dateParts[1];
  }

  function dateFormat(isoString) {
    return isoString.replace(/T.+$/, '');
  }
</script>

<style>
  @import '~vue-select/dist/vue-select.css';
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
  /* .v-select {
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
  } */
  .leaflet-div-icon {
    border-radius: 20px;
    background: #fd0000;
    border: 1px solid #666;
    color: white;
  }
  /* .vue-dynamic-select .search {
    width: auto;
  }
  .vue-dynamic-select .result-list {
    overflow: scroll;
    background-color: #fff;
    max-height: 50vh;
  } */
  .leaflet-control-geosearch .results > * {
    color: black;
  }
  .leaflet-control {
    /* z-index: 2000; */
  }
  .control-panel-label {
    padding: 8px 10px;
    color: black;
    font-weight: bolder;
  }
  .control-panel {
    background-color: #beccda;
    padding: 2px;
    /* z-index: 10000; */
    display: flex;
    height: 2.4em;
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
    background-color: rgb(0, 0, 0, 0);
    border-style: none;
    color: white;
  }
  .button-label {
    background-color: rgb(0, 0, 0, 0);
    color: white;
    text-align: center;
    font-weight: bold;
  }
  .dropzone .dz-message {
    margin: 0;
  }
  .dropzone {
    min-height: auto;
    background: #4a00f194;
    color: #ffffff;
    border: none;
  }
  .dropzone:hover {
    background: #4800f1c0;
  }
  .vue-dropzone {
    border: 1px dashed #1f1f1f;
    border-radius: 10px;
    font-weight: bold;
  }
  .diff-popup-up .leaflet-popup-content {
    margin: 5px 5px;
    width: auto !important;
    line-height: 1;
    text-align: center;
  }
  .diff-popup-up .leaflet-popup-content-wrapper {
    background: red;
    color: #ffffff;
    box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4);
  }
  .diff-popup-up .leaflet-popup-tip-container {
    display: none;
  }
  .diff-popup-down .leaflet-popup-content {
    margin: 5px 5px;
    width: auto !important;
    line-height: 1;
    text-align: center;
  }
  .diff-popup-down .leaflet-popup-content-wrapper {
    background: green;
    color: #fff;
    box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4);
  }
  .diff-popup-down .leaflet-popup-tip-container {
    display: none;
  }
  .pop-size-small {
    font-size: 100%;
  }
  .pop-size-medium {
    font-size: 130%;
  }
  .pop-size-large {
    font-size: 160%;
  }
  .message {
    color: black;
    padding-left: 10px;
    padding-top: 7px;
    white-space: nowrap;
  }
  .vs__dropdown-menu {
    background: white;
    border: none;
    color: black;
  }
  .vs__dropdown-toggle {
    background: white;
    margin-top: 2px;
    height: 2em;
  }
  .vs__selected {
    white-space: nowrap;
  }
  .vs__search {
    display: none;
  }
</style>
