import React, { useEffect, useState } from 'react';
import { WorkstationShell } from './components/layout/WorkstationShell';
import { ToolCanvas } from './components/layout/ToolCanvas';
import { CustomerPortalView } from './components/CustomerPortalView';
import { useWorkstation } from './context/WorkstationContext';

export default function App() {
  const { lang, setCommandPaletteOpen } = useWorkstation();
  const [portalToken, setPortalToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('portal');
  });

  // Sync ?portal=<case_token> query parameter
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setPortalToken(params.get('portal'));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

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

  if (portalToken) {
    return (
      <CustomerPortalView
        token={portalToken}
        lang={lang}
        onBackToWorkstation={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('portal');
          window.history.pushState({}, '', url.toString());
          setPortalToken(null);
        }}
      />
    );
  }

  return (
    <WorkstationShell>
      <ToolCanvas />
    </WorkstationShell>
  );
}
