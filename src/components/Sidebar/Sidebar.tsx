import { Layers, Palette, PenTool } from 'lucide-react';
import clsx from 'clsx';
import { useAppStore } from '../../store';
import { LayersPanel } from './LayersPanel';
import { StylePanel } from './StylePanel';
import { DrawPanel } from './DrawPanel';
import type { SidebarTab } from '../../types';
import './Sidebar.css';

interface TabButtonProps {
  tab: SidebarTab;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onSelect: (tab: SidebarTab) => void;
}

function TabButton({ tab, label, icon, active, onSelect }: TabButtonProps) {
  return (
    <button
      className={clsx('sidebar-tab', { 'sidebar-tab--active': active })}
      onClick={() => onSelect(tab)}
      title={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function Sidebar() {
  const { activeTab, setActiveTab } = useAppStore();

  const tabs: Omit<TabButtonProps, 'active' | 'onSelect'>[] = [
    { tab: 'layers', label: 'Layers', icon: <Layers size={14} /> },
    { tab: 'style', label: 'Style', icon: <Palette size={14} /> },
    { tab: 'draw', label: 'Draw', icon: <PenTool size={14} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        {tabs.map((t) => (
          <TabButton
            key={t.tab}
            {...t}
            active={activeTab === t.tab}
            onSelect={setActiveTab}
          />
        ))}
      </div>
      <div className="sidebar-content">
        {activeTab === 'layers' && <LayersPanel />}
        {activeTab === 'style' && <StylePanel />}
        {activeTab === 'draw' && <DrawPanel />}
      </div>
    </aside>
  );
}
