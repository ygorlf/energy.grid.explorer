import type maplibregl from 'maplibre-gl';
import type { StyleState, LayerVisibility } from '../../types';

// Range-based voltage bucketing: >=380 → orange, >=220 → blue, >=110 → green, else gray
// Uses 'step' expression: [step, input, default, threshold1, output1, threshold2, output2, ...]
// step returns the output of the LAST threshold that is <= the input value
const VOLTAGE_COLOR_EXPR = [
  'step',
  ['coalesce', ['get', 'voltage_kv'], 0],
  '#94a3b8', // fallback for 0 / null
  110, '#22c55e', // >= 110kV → green
  220, '#3b82f6', // >= 220kV → blue
  380, '#f97316', // >= 380kV → orange
] as unknown as maplibregl.ExpressionSpecification;

// Capacity: interpolate from dark-blue (low) to orange (high)
const CAPACITY_COLOR_EXPR = [
  'interpolate',
  ['linear'],
  ['coalesce', ['get', 'capacity_mw'], 0],
  0, '#1e40af',
  1000, '#3b82f6',
  2000, '#f97316',
] as unknown as maplibregl.ExpressionSpecification;

function getLineColorExpr(colorBy: StyleState['colorBy']) {
  if (colorBy === 'capacity') return CAPACITY_COLOR_EXPR;
  return VOLTAGE_COLOR_EXPR;
}

export function addGridLayers(map: maplibregl.Map) {
  // Transmission lines source — loaded from static file in /public/data/
  map.addSource('transmission-lines', {
    type: 'geojson',
    data: '/data/transmission_lines.geojson',
  });

  // Substations source with clustering — MapLibre groups nearby points at low zoom levels,
  // expanding into individual markers as the user zooms in (pure frontend, no backend needed)
  map.addSource('substations', {
    type: 'geojson',
    data: '/data/substations.geojson',
    cluster: true,
    clusterMaxZoom: 7,  // stop clustering above zoom 7
    clusterRadius: 40,  // px radius to merge points into a cluster
  });

  // 380kV+ lines — visible from zoom 3 (continent scale, backbone grid)
  map.addLayer({
    id: 'lines-380kv',
    type: 'line',
    source: 'transmission-lines',
    minzoom: 3,
    filter: ['>=', ['coalesce', ['get', 'voltage_kv'], 0], 380],
    paint: {
      'line-color': '#f97316',
      'line-width': 2.5,
      'line-opacity': 0.9,
    },
  });

  // 220kV–379kV lines — visible from zoom 5 (country scale)
  map.addLayer({
    id: 'lines-220kv',
    type: 'line',
    source: 'transmission-lines',
    minzoom: 5,
    filter: ['all',
      ['>=', ['coalesce', ['get', 'voltage_kv'], 0], 220],
      ['<', ['coalesce', ['get', 'voltage_kv'], 0], 380],
    ],
    paint: {
      'line-color': '#3b82f6',
      'line-width': 2,
      'line-opacity': 0.85,
    },
  });

  // 110kV–219kV lines — visible from zoom 7 (regional scale, most dense layer)
  map.addLayer({
    id: 'lines-110kv',
    type: 'line',
    source: 'transmission-lines',
    minzoom: 7,
    filter: ['all',
      ['>=', ['coalesce', ['get', 'voltage_kv'], 0], 110],
      ['<', ['coalesce', ['get', 'voltage_kv'], 0], 220],
    ],
    paint: {
      'line-color': '#22c55e',
      'line-width': 1.5,
      'line-opacity': 0.8,
    },
  });

  // Cluster bubble — shown when points are grouped at low zoom
  map.addLayer({
    id: 'substations-clusters',
    type: 'circle',
    source: 'substations',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#334155',
      'circle-radius': ['step', ['get', 'point_count'], 14, 50, 20, 200, 26],
      'circle-stroke-color': '#94a3b8',
      'circle-stroke-width': 1.5,
      'circle-opacity': 0.85,
    },
  });

  // Cluster count label
  map.addLayer({
    id: 'substations-cluster-count',
    type: 'symbol',
    source: 'substations',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
      'text-size': 11,
    },
    paint: {
      'text-color': '#f1f5f9',
    },
  });

  // Substation circles — range-based so 400kV shows orange, 132kV shows green, etc.
  // Filter: only show HV substations (voltage_kv >= 110) that are NOT part of a cluster
  map.addLayer({
    id: 'substations-circles',
    type: 'circle',
    source: 'substations',
    filter: ['all',
      ['!', ['has', 'point_count']],
      ['>=', ['coalesce', ['get', 'voltage_kv'], 0], 110],
    ],
    paint: {
      'circle-radius': [
        'step',
        ['coalesce', ['get', 'voltage_kv'], 0],
        3,   // fallback < 110kV
        110, 4,  // >= 110kV
        220, 5,  // >= 220kV
        380, 7,  // >= 380kV
      ],
      'circle-color': [
        'step',
        ['coalesce', ['get', 'voltage_kv'], 0],
        '#94a3b8', // fallback < 110kV
        110, '#22c55e', // >= 110kV → green
        220, '#3b82f6', // >= 220kV → blue
        380, '#f97316', // >= 380kV → orange
      ],
      'circle-stroke-color': '#0a0e1a',
      'circle-stroke-width': 1.5,
      'circle-opacity': 0.95,
    },
  });

  // Substation labels (hidden by default) — only on unclustered HV points
  map.addLayer({
    id: 'substations-labels',
    type: 'symbol',
    source: 'substations',
    filter: ['all',
      ['!', ['has', 'point_count']],
      ['>=', ['coalesce', ['get', 'voltage_kv'], 0], 110],
    ],
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
      'text-size': 11,
      'text-anchor': 'top',
      'text-offset': [0, 0.8],
      'text-optional': true,
      'visibility': 'none',
    },
    paint: {
      'text-color': '#f1f5f9',
      'text-halo-color': '#0a0e1a',
      'text-halo-width': 1.5,
    },
  });
}

export function updateLayerVisibility(
  map: maplibregl.Map,
  visibility: LayerVisibility
) {
  const layerMap: Record<keyof LayerVisibility, string[]> = {
    lines380kv: ['lines-380kv'],
    lines220kv: ['lines-220kv'],
    lines110kv: ['lines-110kv'],
    substations: ['substations-clusters', 'substations-cluster-count', 'substations-circles', 'substations-labels'],
    drawnFeatures: [],
  };

  for (const [key, layerIds] of Object.entries(layerMap)) {
    const vis = visibility[key as keyof LayerVisibility] ? 'visible' : 'none';
    for (const id of layerIds) {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', vis);
      }
    }
  }
}

export function updateLineStyle(
  map: maplibregl.Map,
  style: StyleState
) {
  const colorExpr = getLineColorExpr(style.colorBy);
  const layerIds = ['lines-380kv', 'lines-220kv', 'lines-110kv'];

  for (const id of layerIds) {
    if (map.getLayer(id)) {
      map.setPaintProperty(id, 'line-color', colorExpr);
      map.setPaintProperty(id, 'line-width', style.lineWidth);
    }
  }

  if (map.getLayer('substations-labels')) {
    map.setLayoutProperty(
      'substations-labels',
      'visibility',
      style.showLabels ? 'visible' : 'none'
    );
  }
}
