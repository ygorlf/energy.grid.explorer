import { useAppStore } from '../../store';
import type { ColorByAttribute } from '../../types';

const LEGENDS: Record<ColorByAttribute, { label: string; color: string }[]> = {
  voltage: [
    { label: '380 kV+ (EHV)', color: '#f97316' },
    { label: '220–379 kV (HV)', color: '#3b82f6' },
    { label: '110–219 kV (HV)', color: '#22c55e' },
    { label: 'Drawn', color: '#a855f7' },
  ],
  capacity: [
    { label: 'High (≥2000 MW)', color: '#f97316' },
    { label: 'Medium (1000 MW)', color: '#3b82f6' },
    { label: 'Low (0 MW)', color: '#1e40af' },
  ],
};

export function StylePanel() {
  const { style, setColorBy, setLineWidth, setShowLabels } = useAppStore();
  const legendTitle = style.colorBy === 'capacity' ? 'Capacity Legend' : 'Voltage Legend';

  return (
    <div className="panel style-panel">
      <p className="panel-description">
        Dynamically restyle the grid layers by attribute.
      </p>

      <div className="style-field">
        <label className="style-label">Color by</label>
        <select
          className="style-select"
          value={style.colorBy}
          onChange={(e) => setColorBy(e.target.value as ColorByAttribute)}
        >
          <option value="voltage">Voltage (kV)</option>
          <option value="capacity">Capacity (MW)</option>
        </select>
      </div>

      <div className="style-field">
        <label className="style-label">
          Line width
          <span className="style-value">{style.lineWidth}px</span>
        </label>
        <input
          type="range"
          className="style-range"
          min={1}
          max={5}
          step={0.5}
          value={style.lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
        />
        <div className="style-range-labels">
          <span>1px</span>
          <span>5px</span>
        </div>
      </div>

      <div className="style-field">
        <label className="layer-row">
          <span className="layer-label">Show labels</span>
          <input
            type="checkbox"
            className="layer-toggle"
            checked={style.showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
          />
          <span className="layer-toggle-track" />
        </label>
      </div>

      <div className="legend">
        <div className="legend-title">{legendTitle}</div>
        {LEGENDS[style.colorBy].map((item) => (
          <div className="legend-row" key={item.label}>
            <span className="legend-swatch" style={{ background: item.color }} />
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
