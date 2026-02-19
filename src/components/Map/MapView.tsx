import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppStore } from '../../store';
import { addGridLayers, updateLayerVisibility, updateLineStyle } from './useLayers';
import { useTerraDraw } from '../../hooks/useTerraDraw';
import './MapView.css';

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const { layerVisibility, style, setPopup } = useAppStore();

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [10.5, 51.2],
      zoom: 5,
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      addGridLayers(map);
      setMapLoaded(true);

      // Substation click popup
      map.on('click', 'substations-circles', (e) => {
        if (!e.features?.length) return;
        const feat = e.features[0];
        const props = feat.properties as Record<string, unknown>;
        const lngLat = e.lngLat;

        setPopup({
          lngLat: [lngLat.lng, lngLat.lat],
          featureType: 'substation',
          properties: {
            id: String(props.id ?? ''),
            name: String(props.name ?? ''),
            voltage_kv: Number(props.voltage_kv) as 380 | 220 | 110,
            country: String(props.country ?? ''),
          },
        });
      });

      map.on('mouseenter', 'substations-circles', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'substations-circles', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('click', (e) => {
        // Dismiss popup if clicking empty space
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['substations-circles'],
        });
        if (!features.length) setPopup(null);
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [setPopup]);

  // Sync layer visibility (grid layers only — td-* handled separately below)
  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current;
    if (!map) return;
    updateLayerVisibility(map, layerVisibility);
  }, [layerVisibility, mapLoaded]);

  // Toggle TerraDraw td-* layers — only after TerraDraw has initialized (mapLoaded + next tick)
  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current;
    if (!map) return;
    const vis = layerVisibility.drawnFeatures ? 'visible' : 'none';
    // TerraDraw initializes asynchronously after mapLoaded — defer to next tick
    const id = setTimeout(() => {
      map.getStyle().layers
        .filter((l) => l.id.startsWith('td-'))
        .forEach((l) => map.setLayoutProperty(l.id, 'visibility', vis));
    }, 0);
    return () => clearTimeout(id);
  }, [layerVisibility.drawnFeatures, mapLoaded]);

  // Sync style — runs on initial load (mapLoaded) and on every style change
  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current;
    if (!map) return;
    updateLineStyle(map, style);
  }, [style, mapLoaded]);

  // Popup rendering
  const handlePopupClose = useCallback(() => {
    setPopup(null);
  }, [setPopup]);

  const popup = useAppStore((s) => s.popup);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    if (!popup) return;

    const { lngLat, properties, featureType } = popup;

    const html = featureType === 'substation'
      ? `
        <div class="popup-content">
          <div class="popup-type">Substation</div>
          <div class="popup-name">${(properties as { name: string }).name}</div>
          <div class="popup-row"><span>Voltage</span><span class="popup-value">${properties.voltage_kv} kV</span></div>
          ${(properties as { country?: string }).country ? `<div class="popup-row"><span>Country</span><span class="popup-value">${(properties as { country: string }).country}</span></div>` : ''}
        </div>
      `
      : `
        <div class="popup-content">
          <div class="popup-type">Transmission Line</div>
          <div class="popup-row"><span>Voltage</span><span class="popup-value">${properties.voltage_kv} kV</span></div>
        </div>
      `;

    const p = new maplibregl.Popup({ closeButton: true, className: 'grid-popup' })
      .setLngLat(lngLat)
      .setHTML(html)
      .addTo(map);

    p.on('close', handlePopupClose);
    popupRef.current = p;
  }, [popup, handlePopupClose]);

  // Terradraw integration — pass the ref object, not .current
  useTerraDraw(mapRef, mapLoaded);

  return (
    <div className="map-container">
      <div ref={containerRef} className="map-canvas" />
    </div>
  );
}
