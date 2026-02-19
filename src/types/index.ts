import type { Feature, LineString, Point, FeatureCollection } from 'geojson';

export type VoltageLevel = 380 | 220 | 110;

export type DrawMode = 'pan' | 'linestring' | 'point' | 'select';

export type ColorByAttribute = 'voltage' | 'capacity';

export type SidebarTab = 'layers' | 'style' | 'draw';

export interface SubstationProperties {
  id: string;
  name: string;
  voltage_kv: VoltageLevel;
  country?: string;
  operator?: string;
}

export interface TransmissionLineProperties {
  id: string;
  name?: string;
  voltage_kv: VoltageLevel;
  capacity_mw?: number;
  country?: string;
  length_km?: number;
}

export type SubstationFeature = Feature<Point, SubstationProperties>;
export type TransmissionLineFeature = Feature<LineString, TransmissionLineProperties>;

export type SubstationCollection = FeatureCollection<Point, SubstationProperties>;
export type TransmissionLineCollection = FeatureCollection<LineString, TransmissionLineProperties>;

export interface LayerVisibility {
  lines380kv: boolean;
  lines220kv: boolean;
  lines110kv: boolean;
  substations: boolean;
  drawnFeatures: boolean;
}

export interface StyleState {
  colorBy: ColorByAttribute;
  lineWidth: number;
  showLabels: boolean;
}

export interface PopupInfo {
  lngLat: [number, number];
  properties: SubstationProperties | TransmissionLineProperties;
  featureType: 'substation' | 'line';
}
