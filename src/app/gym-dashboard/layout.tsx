'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/gym/Sidebar';

export default function GymDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFullscreenChange(e: Event) {
      const customEvent = e as CustomEvent<boolean>;
      console.log('[Layout] fullscreen event detail:', customEvent.detail);
      setIsFullscreen(customEvent.detail);
    }
    window.addEventListener('controlIngresoFullscreen', onFullscreenChange);
    return () => window.removeEventListener('controlIngresoFullscreen', onFullscreenChange);
  }, []);
  

  return (
    <div style={{ display: 'flex' }}>
      {!isFullscreen && (
        <Sidebar
          currentSection="ingresos" // o el estado real de sección que uses
          setSection={() => {}} // poner la función real o dejar vacía si solo ControlIngreso está
          onLogout={() => {}}
          gymName=""
        />
      )}

      <main
        style={{
          marginLeft: isFullscreen ? 0 : '240px',
          padding: '20px',
          width: '100%',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {children}
      </main>
    </div>
  );
}
