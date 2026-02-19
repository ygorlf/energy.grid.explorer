import { Zap } from 'lucide-react';
import { useAppStore } from '../../store';
import './Toolbar.css';

export function Toolbar() {
  const { drawnFeaturesCount } = useAppStore();

  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <Zap size={18} className="toolbar-logo" />
        <span className="toolbar-title">Energy Grid Explorer</span>
        <span className="toolbar-subtitle">European HV Network</span>
      </div>

      <div className="toolbar-center">
        {drawnFeaturesCount > 0 && (
          <span className="toolbar-stat">
            {drawnFeaturesCount} drawn feature{drawnFeaturesCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </header>
  );
}
