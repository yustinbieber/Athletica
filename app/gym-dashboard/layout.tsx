'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/gym/Sidebar';

export default function GymDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gymName, setGymName] = useState('');
  const [empleadoNombre, setEmpleadoNombre] = useState('');
  const [role, setRole] = useState<'dueño' | 'empleado' | undefined>(undefined);

  useEffect(() => {
    function onFullscreenChange(e: Event) {
      const customEvent = e as CustomEvent<boolean>;
      setIsFullscreen(customEvent.detail);
    }
    window.addEventListener('controlIngresoFullscreen', onFullscreenChange);
    return () => window.removeEventListener('controlIngresoFullscreen', onFullscreenChange);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('gymToken');
    if (!token) {
      setGymName('');
      setEmpleadoNombre('');
      setRole(undefined);
      return;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decoded = JSON.parse(decodedJson);

      setGymName(decoded.gymName || '');
      setRole(decoded.rol === 'admin' ? 'dueño' : 'empleado');

      // Intentar sacar nombre de empleado o username según rol
      const nombre = localStorage.getItem('empleadoNombre') || '';
      setEmpleadoNombre(nombre);
    } catch {
      setGymName('');
      setEmpleadoNombre('');
      setRole(undefined);
    }
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      {!isFullscreen && (
        <Sidebar
          currentSection="" // acá podés mejorar para controlar sección actual
          setSection={() => { } } // o pasar una función si querés controlar sección
          onLogout={() => {
            localStorage.removeItem('gymToken');
            localStorage.removeItem('empleadoNombre');
            // Por ejemplo, podés redirigir al login acá si querés
            window.location.href = '/gym-dashboard/gym-login';
          } }
          gymName={gymName}
          empleadoNombre={empleadoNombre}
          role={role} expanded={false} setExpanded={function (val: boolean): void {
            throw new Error('Function not implemented.');
          } }        />
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
