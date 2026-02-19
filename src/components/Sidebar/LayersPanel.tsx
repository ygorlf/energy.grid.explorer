import { useAppStore } from '../../store';
import type { LayerVisibility } from '../../types';

interface LayerRowProps {
  label: string;
  color: string;
  layerKey: keyof LayerVisibility;
  visible: boolean;
  onToggle: (key: keyof LayerVisibility, v: boolean) => void;
}

function LayerRow({ label, color, layerKey, visible, onToggle }: LayerRowProps) {
  return (
    <label className="layer-row">
      <span className="layer-swatch" style={{ background: color }} />
      <span className="layer-label">{label}</span>
      <input
        type="checkbox"
        className="layer-toggle"
        checked={visible}
        onChange={(e) => onToggle(layerKey, e.target.checked)}
      />
      <span className="layer-toggle-track" />
    </label>
  );
}

export function LayersPanel() {
  const { layerVisibility, setLayerVisibility } = useAppStore();

  const layers: { label: string; color: string; key: keyof LayerVisibility }[] = [
    { label: '380 kV Lines', color: '#f97316', key: 'lines380kv' },
    { label: '220 kV Lines', color: '#3b82f6', key: 'lines220kv' },
    { label: '110 kV Lines', color: '#22c55e', key: 'lines110kv' },
    { label: 'Substations', color: '#94a3b8', key: 'substations' },
    { label: 'Drawn Features', color: '#a855f7', key: 'drawnFeatures' },
  ];

  return (
    <div className="panel layers-panel">
      <p className="panel-description">
        Toggle visibility of each voltage tier independently.
      </p>
      <div className="layer-list">
        {layers.map((l) => (
          <LayerRow
            key={l.key}
            label={l.label}
            color={l.color}
            layerKey={l.key}
            visible={layerVisibility[l.key]}
            onToggle={setLayerVisibility}
          />
        ))}
      </div>
    </div>
  );
}
