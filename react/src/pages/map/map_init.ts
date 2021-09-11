import * as L from 'leaflet';
import { FeatureLayer } from 'esri-leaflet';
import LabeledMarker from 'leaflet-labeled-circle';
import React, { MutableRefObject } from 'react';
import dayjs from 'dayjs';
import length from '@turf/length';
import { ITelemetryPoint, TelemetryDetail } from 'types/map';
import { MAP_COLOURS } from 'pages/map/map_helpers';
import { MapStrings } from 'constants/strings';
import { MapTileLayers } from 'constants/strings';
import { formatLocal } from 'utils/time';
import { plainToClass } from 'class-transformer';
import { TileLayer } from 'leaflet';

const hidePopup = (): void => {
  const doc = document.getElementById('popup');
  if (!doc) {
    return;
  }
  doc.innerHTML = '';
  doc.classList.remove('appear-above-map');
};

const setPopupInnerHTML = (feature: ITelemetryPoint): void => {
  const doc = document.getElementById('popup');
  if (!doc) {
    return;
  }
  const p = plainToClass(TelemetryDetail, feature.properties);
  const t = dayjs(p.date_recorded).format(formatLocal);
  const text = `
    ${p.species ? 'Species: ' + p.species + '<br>' : ''}
    ${p.wlh_id ? 'WLH ID: ' + p.wlh_id + '<br>' : ''}
    ${p.animal_id ? 'Animal ID: ' + p.animal_id + '<br>' : ''}
    Device ID: ${p.formattedDevice}<br>
    Frequency (MHz): ${p.paddedFrequency}<br>
    ${p.animal_status ? 'Animal Status: ' + '<b>' + p.animal_status + '</b><br>' : ''}
    ${p.animal_status === 'Mortality' ? 'Mortality Date: ' + p.mortality_date + '<br>' : ''}
    ${p.sex ? 'Sex: ' + p.sex + '<br>' : ''}
    ${p.device_status ? 'Device Status: ' + '<b>' + p.device_status + '</b><br>' : ''}
    Time: ${dayjs(t).format('MMMM D, YYYY h:mm A')} UTC<br>
    ${p.collective_unit ? 'Location: ' + '<b>' + p.collective_unit + '</b><br' : ''}
  `;
  doc.innerHTML = text;
  doc.classList.add('appear-above-map');
};

// caribou herd boundaries 
const getCHB = (): FeatureLayer => {
  const fl = new FeatureLayer({url: 'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/Caribou_BC/FeatureServer/0'})
  return fl;
  // fixme: why was it returning as tilelayer?
  // return fl as L.TileLayer;
};

// URL for BC Geographic Warehouse
const bcgw_url = 'http://openmaps.gov.bc.ca/geo/pub/ows';

// ENV regional boundaries
const getERB = (): TileLayer => {
  return L.tileLayer.wms(bcgw_url, {
    layers: 'WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW',
    format: 'image/png',
    transparent: true,
    opacity: 0.6
  });
};

// parks and protected areas
const getPPA = (): TileLayer => {
  return L.tileLayer.wms(bcgw_url, {
    layers: 'WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW',
    format: 'image/png',
    transparent: true,
    opacity: 0.6
  });
};

// wildlife habitat areas
const getWHA = (): TileLayer => {
  return L.tileLayer.wms(bcgw_url, {
    layers: 'WHSE_WILDLIFE_MANAGEMENT.WCP_WILDLIFE_HABITAT_AREA_POLY',
    format: 'image/png',
    transparent: true,
    opacity: 0.6
  });
};

// wildlife magement units
const getWMU = (): TileLayer => {
  return L.tileLayer.wms(bcgw_url, {
    layers: 'WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW',
    format: 'image/png',
    transparent: true,
    opacity: 0.6
  });
};

// TRIM contour lines
const getTCL = (): TileLayer => {
  return L.tileLayer.wms(bcgw_url, {
    layers: 'WHSE_BASEMAPPING.TRIM_CONTOUR_LINES',
    format: 'image/png',
    transparent: true,
    opacity: 0.6
  });
};

// ungulate winter ranges
const getUWR = (): TileLayer => {
  return L.tileLayer.wms(bcgw_url, {
    layers: 'WHSE_WILDLIFE_MANAGEMENT.WCP_UNGULATE_WINTER_RANGE_SP',
    format: 'image/png',
    transparent: true,
    opacity: 0.6
  });
};

const addTileLayers = (mapRef: React.MutableRefObject<L.Map>, layerPicker: L.Control.Layers): void => {

  const bingOrtho = L.tileLayer(MapTileLayers.bing, {
    attribution: '&copy; <a href="https://esri.com">ESRI Basemap</a> ',
    maxZoom: 24,
    maxNativeZoom: 17
  }).addTo(mapRef.current);
  const bcGovBaseLayer = L.tileLayer(MapTileLayers.govBase, {
    maxZoom: 24,
    attribution: '&copy; <a href="https://www2.gov.bc.ca/gov/content/home">BC Government</a> '
  });
  const esriWorldTopo = L.tileLayer(MapTileLayers.esriWorldTopo, {
    maxZoom: 24
  });
  layerPicker.addBaseLayer(bingOrtho, 'Bing Satellite');
  layerPicker.addBaseLayer(bcGovBaseLayer, 'BC Government');
  layerPicker.addBaseLayer(esriWorldTopo, 'ESRI World Topo');

  // overlays from BCGW
  layerPicker.addOverlay(getCHB(), 'Caribou Herd Boundaries');
  layerPicker.addOverlay(getERB(), 'ENV Regional Boundaries');
  layerPicker.addOverlay(getPPA(), 'Parks & Protected Areas');
  //layerPicker.addOverlay(getTCL(), 'TRIM Contour Lines');
  layerPicker.addOverlay(getWHA(), 'Wildlife Habitat Areas');
  layerPicker.addOverlay(getWMU(), 'Wildlife Management Units');
  layerPicker.addOverlay(getUWR(), 'Ungulate Winter Range');
};

const initMap = (
  mapRef: MutableRefObject<L.Map>,
  drawnItems: L.FeatureGroup,
  selectedPings: L.GeoJSON,
  drawSelectedLayer: () => void,
  handleDrawLine: (l: L.Layer) => void,
  handleDeleteLine: () => void,
): void => {
  mapRef.current = L.map('map', { zoomControl: true }).setView([55, -128], 6);
  const layerPicker = L.control.layers(undefined, undefined, { position: 'topleft' });
  L.drawLocal.draw.toolbar.buttons.polyline = MapStrings.drawLineLabel;
  L.drawLocal.draw.toolbar.buttons.polygon = MapStrings.drawPolygonLabel;
  L.drawLocal.draw.toolbar.buttons.rectangle = MapStrings.drawRectangleLabel;
  addTileLayers(mapRef, layerPicker);

  mapRef.current.addLayer(drawnItems);
  mapRef.current.addLayer(selectedPings);

  const drawControl = new L.Control.Draw({
    position: 'topright',
    draw: {
      marker: false,
      circle: false,
      circlemarker: false
    },
    edit: {
      featureGroup: drawnItems
    },
  });

  mapRef.current.addControl(drawControl);
  mapRef.current.addControl(layerPicker);

  // line drawing control
  const drawLabel = (e: L.LeafletEvent): L.Layer => {
    // Get the feature
    const lineString = e.layer.toGeoJSON();
    const distance = Math.round(length(lineString) * 10) / 10; // kms
    const geos = e.layer.editing.latlngs;
    const { lat, lng } = geos[0][geos[0].length - 1];
    const feature = {
      type: 'Feature',
      properties: {
        text: `${distance}`,
        labelPosition: [lng, lat]
      },
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    };

    const marker = new LabeledMarker(feature.geometry.coordinates.slice().reverse(), feature, {
      markerOpions: {
        color: MAP_COLOURS['track'],
        textStyle: {
          color: MAP_COLOURS['outline'],
          fontSize: 3
        }
      }
    });
    marker.addTo(mapRef.current);
    return marker;
  };

  // Set up the drawing events
  mapRef.current
    .on('draw:created', (e: L.LeafletEvent) => {
      // fixme: deprecated?
      drawnItems.addLayer(e.layer);
      if (e.type === 'polyline') {
        const line = drawLabel(e);
        handleDrawLine(line);
        return line;
      }
      drawSelectedLayer();
    })
    .on('draw:edited', () => {
      drawSelectedLayer();
    })
    .on('draw:deletestop', () => {
      drawSelectedLayer();
      handleDeleteLine();
    })
};

export { initMap, hidePopup, setPopupInnerHTML, addTileLayers };