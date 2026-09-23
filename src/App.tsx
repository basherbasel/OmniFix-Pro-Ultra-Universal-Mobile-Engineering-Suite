import React, { useEffect } from 'react';
import { WorkstationShell } from './components/layout/WorkstationShell';
import { ToolCanvas } from './components/layout/ToolCanvas';
import { useWorkstation } from './context/WorkstationContext';

export default function App() {
  const { lang, setCommandPaletteOpen } = useWorkstation();

  // Global Keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  // Set RTL/LTR body direction
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <WorkstationShell>
      <ToolCanvas />
    </WorkstationShell>
  );
}
