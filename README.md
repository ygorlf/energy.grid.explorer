# ⚡ Energy Grid Explorer

Interactive geospatial editor for European high-voltage transmission networks. Explore real grid data, draw new infrastructure, and style layers dynamically by attribute.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Features

- **Real grid data** — European HV transmission lines (110/220/380 kV+) and substations from OpenStreetMap, rendered from static GeoJSON
- **Layer toggles** — show/hide each voltage tier (380 kV+, 220 kV, 110 kV) and substations independently
- **Drawing tools** — draw new transmission lines and substation nodes with TerraDraw; double-click to finish a line
- **Vertex editing** — select drawn features to drag vertices, add midpoints, or delete
- **Style panel** — color lines by voltage or capacity with a live legend; adjust line width with a slider
- **Label toggle** — show/hide substation name labels on the map
- **Substation popup** — click any substation to see name, voltage, and operator info
- **Dark industrial UI** — control-room aesthetic with a dark CartoDB basemap

## Tech stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Map engine | MapLibre GL JS |
| Drawing/editing | TerraDraw + terra-draw-maplibre-gl-adapter |
| State | Zustand |
| Icons | lucide-react |

## Data

GeoJSON files in `public/data/` — European HV substations and transmission lines derived from OpenStreetMap. Substations with invalid or sub-110 kV voltages are filtered out at the layer level to show only transmission-grade infrastructure.
