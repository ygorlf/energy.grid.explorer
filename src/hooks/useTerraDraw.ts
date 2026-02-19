import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import {
  TerraDraw,
  TerraDrawLineStringMode,
  TerraDrawPointMode,
  TerraDrawSelectMode,
} from 'terra-draw';
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter';
import type maplibregl from 'maplibre-gl';
import { useAppStore } from '../store';

const DRAWN_COLOR = '#a855f7';
const DRAWN_COLOR_SELECTED = '#c084fc';

export function useTerraDraw(
  mapRef: RefObject<maplibregl.Map | null>,
  mapLoaded: boolean,
) {
  const drawRef = useRef<TerraDraw | null>(null);
  const { drawMode, setDrawnFeaturesCount } = useAppStore();

  // Initialize TerraDraw once the map load event has fired
  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current;
    if (!map || drawRef.current) return;

    const draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      modes: [
        new TerraDrawPointMode({
          styles: {
            pointColor: DRAWN_COLOR,
            pointWidth: 8,
            pointOutlineColor: '#0a0e1a',
            pointOutlineWidth: 2,
          },
        }),
        new TerraDrawLineStringMode({
          snapping: { toCoordinate: true },
          styles: {
            lineStringColor: DRAWN_COLOR,
            lineStringWidth: 2,
            coordinatePointColor: DRAWN_COLOR,
            coordinatePointWidth: 5,
            coordinatePointOutlineColor: '#0a0e1a',
            coordinatePointOutlineWidth: 1,
            closingPointColor: DRAWN_COLOR,
            closingPointWidth: 7,
            closingPointOutlineColor: '#0a0e1a',
            closingPointOutlineWidth: 1,
          },
        }),
        new TerraDrawSelectMode({
          styles: {
            selectedLineStringColor: DRAWN_COLOR_SELECTED,
            selectedLineStringWidth: 3,
            selectionPointColor: DRAWN_COLOR,
            selectionPointWidth: 8,
            selectionPointOutlineColor: '#0a0e1a',
            selectionPointOutlineWidth: 2,
            midPointColor: DRAWN_COLOR,
            midPointWidth: 6,
            midPointOutlineColor: '#0a0e1a',
            midPointOutlineWidth: 1,
            selectedPointColor: DRAWN_COLOR_SELECTED,
            selectedPointWidth: 10,
            selectedPointOutlineColor: '#0a0e1a',
            selectedPointOutlineWidth: 2,
          },
          flags: {
            linestring: {
              feature: {
                draggable: true,
                deletable: true,
                coordinates: {
                  midpoints: true,
                  draggable: true,
                  deletable: true,
                },
              },
            },
            point: {
              feature: {
                draggable: true,
                deletable: true,
              },
            },
          },
        }),
      ],
    });

    draw.start();
    drawRef.current = draw;

    draw.on('change', (_ids, _type) => {
      const features = draw.getSnapshot();
      setDrawnFeaturesCount(features.length);
    });

    return () => {
      if (drawRef.current) {
        try { drawRef.current.stop(); } catch { /* ignore */ }
        drawRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded]);

  // Sync draw mode from store to TerraDraw.
  // Disable MapLibre's double-click-to-zoom while drawing so it doesn't
  // compete with TerraDraw's double-click-to-finish gesture.
  useEffect(() => {
    const draw = drawRef.current;
    const map = mapRef.current;
    if (!draw || !map) return;
    try {
      draw.setMode(drawMode === 'pan' ? 'static' : drawMode);
      if (drawMode === 'linestring' || drawMode === 'point') {
        map.doubleClickZoom.disable();
      } else {
        map.doubleClickZoom.enable();
      }
    } catch { /* mode not ready yet */ }
  }, [drawMode, mapRef]);

  return { drawRef };
}
