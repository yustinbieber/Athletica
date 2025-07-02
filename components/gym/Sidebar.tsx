'use client';

import { JSX, useState } from 'react';
import {
  FaTachometerAlt,
  FaClipboardList,
  FaUsers,
  FaDoorOpen,
  FaBoxes,
  FaMoneyCheckAlt,
  FaUserTie,
  FaBars,
  FaClock
} from 'react-icons/fa';

interface SidebarProps {
  currentSection: string;
  setSection: (section: string) => void;
  onLogout: () => void;
  gymName: string;
  empleadoNombre?: string;
  role?: 'dueño' | 'empleado';
  expanded: boolean;
  setExpanded: (val: boolean) => void;
}

const sections = [
  {
    title: 'General',
    links: [
      { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
      { id: 'ingresos', label: 'Control de Ingreso', icon: <FaDoorOpen /> },
    ],
  },
  {
    title: 'Usuarios',
    links: [
      { id: 'planes', label: 'Planes', icon: <FaClipboardList /> },
      { id: 'usuarios', label: 'Gestión Usuarios', icon: <FaUsers /> },
      { id: 'porVencer', label: 'Socios por vencer', icon: <FaClock /> }, // NUEVA SECCIÓN
    ],
  },
  {
    title: 'Mercadería y Finanzas',
    links: [
      { id: 'mercaderia', label: 'Mercadería', icon: <FaBoxes /> },
      { id: 'Movimientos', label: 'Control de Plata', icon: <FaMoneyCheckAlt /> },
      { id: 'empleados', label: 'Empleados', icon: <FaUserTie /> }, // ocultar si rol === 'empleado'
    ],
  },
];

export default function Sidebar({
  currentSection,
  setSection,
  onLogout,
  gymName,
  empleadoNombre,
  role,
  expanded,
  setExpanded,
}: SidebarProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  function filterLinksByRole(links: { id: string; label: string; icon: JSX.Element }[]) {
    if (role === 'empleado') {
      return links.filter(link => link.id !== 'empleados');
    }
    return links;
  }

  return (
    <>
      <nav
        style={{
          width: expanded ? 260 : 100,
          height: '100vh',
          backgroundColor: '#1E1E1E',
          color: '#FFF',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 10px',
          boxSizing: 'border-box',
          transition: 'width 0.3s ease',
          overflowY: 'hidden',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Header: gymName + toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: expanded ? 'space-between' : 'center',
            marginBottom: 16,
          }}
        >
          {expanded && (
            <h2
              style={{
                margin: 0,
                color: '#FFD700',
                fontWeight: 'bold',
                fontSize: 20,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginRight: 8,
                userSelect: 'none',
              }}
              title={gymName}
            >
              {gymName}
            </h2>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFA500',
              fontSize: 24,
              cursor: 'pointer',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255, 107, 0, 0.2)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            aria-label={expanded ? 'Cerrar menú' : 'Abrir menú'}
          >
            <FaBars />
          </button>
        </div>

        {/* Info usuario */}
        {expanded && (
          <>
            {empleadoNombre && (
              <p
                style={{
                  marginTop: 0,
                  marginBottom: 4,
                  color: '#FFA500',
                  fontWeight: 'bold',
                  fontSize: 16,
                  userSelect: 'none',
                }}
              >
                {role === 'dueño' ? 'Usuario' : 'Empleado'}: {empleadoNombre}
              </p>
            )}
            {role && (
              <p
                style={{
                  marginTop: 0,
                  marginBottom: 24,
                  color: '#FF6B00',
                  fontWeight: 600,
                  fontSize: 14,
                  fontStyle: 'italic',
                  userSelect: 'none',
                }}
              >
                Rol: {role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
            )}
          </>
        )}

        {/* Secciones */}
        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          {sections.map(({ title, links }) => {
            const filteredLinks = filterLinksByRole(links);
            if (filteredLinks.length === 0) return null;
            return (
              <div key={title} style={{ marginBottom: 30 }}>
                {expanded && (
                  <h3
                    style={{
                      marginBottom: 10,
                      color: '#FF6B00',
                      fontWeight: '700',
                      fontSize: 16,
                      textTransform: 'uppercase',
                      userSelect: 'none',
                    }}
                  >
                    {title}
                  </h3>
                )}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {filteredLinks.map(({ id, label, icon }) => {
                    const isActive = currentSection === id;
                    return (
                      <li key={id} style={{ marginBottom: 12 }}>
                        <button
                          onClick={() => setSection(id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: expanded ? 'flex-start' : 'center',
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 6,
                            color: isActive ? '#FF6B00' : '#FFF',
                            backgroundColor: isActive ? 'rgba(255, 107, 0, 0.15)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: isActive ? 'bold' : 'normal',
                            transition: 'background-color 0.2s ease',
                            userSelect: 'none',
                          }}
                          title={!expanded ? label : undefined}
                        >
                          <span style={{ fontSize: 20, marginRight: expanded ? 12 : 0 }}>
                            {icon}
                          </span>
                          {expanded && label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Botón cerrar sesión */}
        {expanded ? (
          <div>
            <button
              onClick={() => setShowConfirm(true)}
              title="Cerrar sesión"
              style={{
                backgroundColor: '#FF4040',
                color: '#FFF',
                border: 'none',
                padding: '10px 14px',
                borderRadius: 6,
                width: '100%',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: 16,
                marginTop: 'auto',
                userSelect: 'none',
              }}
            >
              🔒 Cerrar sesión
            </button>
          </div>
        ) : (
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={() => setShowConfirm(true)}
              title="Cerrar sesión"
              style={{
                backgroundColor: '#FF4040',
                color: '#FFF',
                border: 'none',
                padding: 10,
                borderRadius: 6,
                cursor: 'pointer',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                userSelect: 'none',
              }}
            >
              🔒
            </button>
          </div>
        )}
      </nav>

      {/* Modal confirmación logout */}
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
              zIndex: 1000,
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
              borderRadius: 8,
              zIndex: 1001,
              boxShadow: '0 0 10px rgba(255,107,0,0.7)',
              minWidth: 320,
              textAlign: 'center',
            }}
          >
            <p style={{ marginBottom: 20, fontSize: 18 }}>
              ¿Seguro que querés cerrar sesión?
            </p>
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
                borderRadius: 6,
                marginRight: 12,
                cursor: 'pointer',
                userSelect: 'none',
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
                borderRadius: 6,
                cursor: 'pointer',
                userSelect: 'none',
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
