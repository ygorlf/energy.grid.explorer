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

  // Substations source — loaded from static file in /public/data/
  map.addSource('substations', {
    type: 'geojson',
    data: '/data/substations.geojson',
  });

  // 380kV+ lines (380, 400, 420, 500, 750 kV)
  map.addLayer({
    id: 'lines-380kv',
    type: 'line',
    source: 'transmission-lines',
    filter: ['>=', ['coalesce', ['get', 'voltage_kv'], 0], 380],
    paint: {
      'line-color': '#f97316',
      'line-width': 2.5,
      'line-opacity': 0.9,
    },
  });

  // 220kV–379kV lines (220, 225, 275, 330 kV)
  map.addLayer({
    id: 'lines-220kv',
    type: 'line',
    source: 'transmission-lines',
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

  // 110kV–219kV lines (110, 132, 150 kV)
  map.addLayer({
    id: 'lines-110kv',
    type: 'line',
    source: 'transmission-lines',
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

  // Substation circles — range-based so 400kV shows orange, 132kV shows green, etc.
  // Filter: only show HV substations (voltage_kv >= 110); hides null/zero/distribution-level entries
  map.addLayer({
    id: 'substations-circles',
    type: 'circle',
    source: 'substations',
    filter: ['>=', ['coalesce', ['get', 'voltage_kv'], 0], 110],
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

  // Substation labels (hidden by default) — same HV filter as circles
  map.addLayer({
    id: 'substations-labels',
    type: 'symbol',
    source: 'substations',
    filter: ['>=', ['coalesce', ['get', 'voltage_kv'], 0], 110],
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
    substations: ['substations-circles', 'substations-labels'],
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
