import { create } from 'zustand';
import type {
  DrawMode,
  LayerVisibility,
  StyleState,
  PopupInfo,
  SidebarTab,
} from './types';

interface AppState {
  // Sidebar
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;

  // Layer visibility
  layerVisibility: LayerVisibility;
  setLayerVisibility: (key: keyof LayerVisibility, value: boolean) => void;

  // Style
  style: StyleState;
  setColorBy: (value: StyleState['colorBy']) => void;
  setLineWidth: (value: number) => void;
  setShowLabels: (value: boolean) => void;

  // Draw mode
  drawMode: DrawMode;
  setDrawMode: (mode: DrawMode) => void;

  // Drawn features count
  drawnFeaturesCount: number;
  setDrawnFeaturesCount: (count: number) => void;

  // Popup
  popup: PopupInfo | null;
  setPopup: (info: PopupInfo | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Sidebar
  activeTab: 'layers',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Layer visibility
  layerVisibility: {
    lines380kv: true,
    lines220kv: true,
    lines110kv: true,
    substations: true,
    drawnFeatures: true,
  },
  setLayerVisibility: (key, value) =>
    set((state) => ({
      layerVisibility: { ...state.layerVisibility, [key]: value },
    })),

  // Style
  style: {
    colorBy: 'voltage',
    lineWidth: 2,
    showLabels: false,
  },
  setColorBy: (value) =>
    set((state) => ({ style: { ...state.style, colorBy: value } })),
  setLineWidth: (value) =>
    set((state) => ({ style: { ...state.style, lineWidth: value } })),
  setShowLabels: (value) =>
    set((state) => ({ style: { ...state.style, showLabels: value } })),

  // Draw mode
  drawMode: 'pan',
  setDrawMode: (mode) => set({ drawMode: mode }),

  // Drawn features count
  drawnFeaturesCount: 0,
  setDrawnFeaturesCount: (count) => set({ drawnFeaturesCount: count }),

  // Popup
  popup: null,
  setPopup: (info) => set({ popup: info }),
}));
