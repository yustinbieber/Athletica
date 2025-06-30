'use client';

import { useState, useEffect } from 'react';

interface SidebarProps {
  currentSection: string;
  setSection: (section: string) => void;
  onLogout: () => void;
  gymName: string;
  empleadoNombre?: string; // nuevo prop opcional para mostrar nombre del empleado
}

const sections = [
  {
    title: 'General',
    links: [
      { id: 'dashboard', label: 'Dashboard' },
    ],
  },
  {
    title: 'Usuarios',
    links: [
      { id: 'planes', label: 'Planes' },
      { id: 'usuarios', label: 'Gestión Usuarios' },
      { id: 'ingresos', label: 'Control de Ingreso' },
    ],
  },
  {
    title: 'Mercadería y Finanzas',
    links: [
      { id: 'mercaderia', label: 'Mercadería' },
      { id: 'Movimientos', label: 'Control de Plata' },
      { id: 'empleados', label: 'Empleados' },
      // Podés agregar más links aquí cuando quieras
    ],
  },
];

export default function Sidebar({ currentSection, setSection, onLogout, gymName, empleadoNombre }: SidebarProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [hideSidebar, setHideSidebar] = useState(false);

  useEffect(() => {
    function onFullscreenChange(e: Event) {
      const customEvent = e as CustomEvent<boolean>;
      setHideSidebar(customEvent.detail);
    }
    window.addEventListener('controlIngresoFullscreen', onFullscreenChange);
    return () => window.removeEventListener('controlIngresoFullscreen', onFullscreenChange);
  }, []);

  if (hideSidebar) return null;

  return (
    <>
      <nav
        style={{
          width: '220px',
          height: '100vh',
          backgroundColor: '#1E1E1E',
          color: '#FFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 16px',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 10,
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        <div>
          <h2 style={{ marginBottom: '8px', color: '#FFD700', fontWeight: 'bold', fontSize: '22px' }}>
            {gymName || ''}
          </h2>

          {empleadoNombre && (
            <p
              style={{
                marginTop: 0,
                marginBottom: '24px',
                color: '#FFA500',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              Empleado: {empleadoNombre}
            </p>
          )}

          {sections.map(({ title, links }) => (
            <div key={title} style={{ marginBottom: '30px' }}>
              <h3
                style={{
                  marginBottom: '10px',
                  color: '#FF6B00',
                  fontWeight: '700',
                  fontSize: '16px',
                  textTransform: 'uppercase',
                }}
              >
                {title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {links.map(({ id, label }) => {
                  const isActive = currentSection === id;
                  return (
                    <li key={id} style={{ marginBottom: '12px' }}>
                      <button
                        onClick={() => setSection(id)}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          color: isActive ? '#FF6B00' : '#FFF',
                          backgroundColor: isActive ? 'rgba(255, 107, 0, 0.15)' : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontWeight: isActive ? 'bold' : 'normal',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) (e.currentTarget.style.backgroundColor = 'rgba(255, 107, 0, 0.1)');
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) (e.currentTarget.style.backgroundColor = 'transparent');
                        }}
                      >
                        {label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              backgroundColor: '#FF4040',
              color: '#FFF',
              border: 'none',
              padding: '10px 14px',
              borderRadius: '6px',
              width: '100%',
              cursor: 'pointer',
            }}
          >
            🔒 Cerrar sesión
          </button>
        </div>
      </nav>

      {showConfirm && (
        <>
          <div
            onClick={() => setShowConfirm(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 20,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#222',
              color: '#fff',
              padding: '20px 30px',
              borderRadius: '8px',
              zIndex: 21,
              boxShadow: '0 0 10px rgba(255,107,0,0.7)',
              minWidth: '320px',
              textAlign: 'center',
            }}
          >
            <p style={{ marginBottom: '20px', fontSize: '18px' }}>¿Seguro que querés cerrar sesión?</p>
            <button
              onClick={() => {
                setShowConfirm(false);
                onLogout();
              }}
              style={{
                backgroundColor: '#FF4040',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                marginRight: '12px',
                cursor: 'pointer',
              }}
            >
              Sí, cerrar sesión
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              style={{
                backgroundColor: '#555',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </>
      )}
    </>
  );
}
