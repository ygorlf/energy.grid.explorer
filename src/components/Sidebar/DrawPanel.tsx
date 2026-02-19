import { Minus, MapPin, MousePointer, Hand } from 'lucide-react';
import clsx from 'clsx';
import { useAppStore } from '../../store';
import type { DrawMode } from '../../types';

interface DrawToolProps {
  mode: DrawMode;
  label: string;
  icon: React.ReactNode;
  description: string;
  active: boolean;
  onSelect: (mode: DrawMode) => void;
}

function DrawTool({ mode, label, icon, description, active, onSelect }: DrawToolProps) {
  return (
    <button
      className={clsx('draw-tool', { 'draw-tool--active': active })}
      onClick={() => onSelect(mode)}
      title={description}
    >
      <span className="draw-tool-icon">{icon}</span>
      <div className="draw-tool-text">
        <span className="draw-tool-label">{label}</span>
        <span className="draw-tool-desc">{description}</span>
      </div>
    </button>
  );
}

export function DrawPanel() {
  const { drawMode, setDrawMode } = useAppStore();

  const tools: Omit<DrawToolProps, 'active' | 'onSelect'>[] = [
    {
      mode: 'pan',
      label: 'Pan',
      icon: <Hand size={16} />,
      description: 'Navigate the map',
    },
    {
      mode: 'linestring',
      label: 'Draw Line',
      icon: <Minus size={16} />,
      description: 'Draw transmission lines',
    },
    {
      mode: 'point',
      label: 'Draw Substation',
      icon: <MapPin size={16} />,
      description: 'Place substation nodes',
    },
    {
      mode: 'select',
      label: 'Select',
      icon: <MousePointer size={16} />,
      description: 'Select & edit features',
    },
  ];

  return (
    <div className="panel draw-panel">
      <p className="panel-description">
        Draw new infrastructure. Double-click to finish a line.
      </p>

      <div className="draw-tools">
        {tools.map((t) => (
          <DrawTool
            key={t.mode}
            {...t}
            active={drawMode === t.mode}
            onSelect={setDrawMode}
          />
        ))}
      </div>

      <div className="draw-hints">
        <div className="draw-hint-title">Keyboard shortcuts</div>
        <div className="draw-hint"><kbd>Esc</kbd> Cancel drawing</div>
        <div className="draw-hint"><kbd>Delete</kbd> Remove selected</div>
      </div>
    </div>
  );
}
