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
  FaClock,
  FaChevronDown,
  FaChevronRight,
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
  const [usuariosOpen, setUsuariosOpen] = useState(false);
  const [finanzasOpen, setFinanzasOpen] = useState(false);

  const generalLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { id: 'ingresos', label: 'Control de Ingreso', icon: <FaDoorOpen /> },
  ];

  const usuarioLinks = [
    { id: 'planes', label: 'Planes', icon: <FaClipboardList /> },
    { id: 'usuarios', label: 'Gestión Usuarios', icon: <FaUsers /> },
    { id: 'porVencer', label: 'Socios por vencer', icon: <FaClock /> },
    { id: 'rutinas', label: 'Rutinas', icon: <FaClipboardList /> },
  ];

  const finanzasLinks = [
    { id: 'mercaderia', label: 'Mercadería', icon: <FaBoxes /> },
    { id: 'Movimientos', label: 'Caja', icon: <FaMoneyCheckAlt /> },
    { id: 'empleados', label: 'Empleados', icon: <FaUserTie /> },
  ];

  function filterLinksByRole(links: { id: string; label: string; icon: JSX.Element }[]) {
    if (role === 'empleado') {
      return links.filter(link => link.id !== 'empleados');
    }
    return links;
  }

  const sectionStyle = {
    marginBottom: 30,
    overflow: 'hidden',
    transition: 'max-height 0.3s ease',
  };

  const renderLinks = (links: any[]) =>
    links.map(({ id, label, icon }) => {
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
            <span style={{ fontSize: 20, marginRight: expanded ? 12 : 0 }}>{icon}</span>
            {expanded && label}
          </button>
        </li>
      );
    });

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
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
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
          >
            <FaBars />
          </button>
        </div>

        {/* Usuario info */}
        {expanded && (
          <>
            {empleadoNombre && (
              <p style={{ marginTop: 0, marginBottom: 4, color: '#FFA500', fontWeight: 'bold', fontSize: 16 }}>
                {role === 'dueño' ? 'Usuario' : 'Empleado'}: {empleadoNombre}
              </p>
            )}
            {role && (
              <p style={{ marginTop: 0, marginBottom: 24, color: '#FF6B00', fontWeight: 600, fontSize: 14, fontStyle: 'italic' }}>
                Rol: {role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
            )}
          </>
        )}

        {/* Secciones */}
        <div
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'transparent transparent',
          }}
        >
          {/* General - siempre visible */}
          <div style={sectionStyle}>
            {expanded && (
              <h3 style={{ color: '#FF6B00', fontWeight: '700', fontSize: 16, textTransform: 'uppercase' }}>General</h3>
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{renderLinks(generalLinks)}</ul>
          </div>

          {/* Usuarios - colapsable */}
          <div style={sectionStyle}>
            <div
              onClick={() => setUsuariosOpen(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: 8,
                userSelect: 'none',
              }}
            >
              {expanded && (
                <>
                  <FaChevronRight
                    style={{
                      transform: usuariosOpen ? 'rotate(90deg)' : 'rotate(0)',
                      transition: 'transform 0.2s ease',
                      marginRight: 6,
                    }}
                  />
                  <h3 style={{ color: '#FF6B00', fontWeight: 700, fontSize: 16 }}>Usuarios</h3>
                </>
              )}
            </div>
            {usuariosOpen && (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 10 }}>{renderLinks(usuarioLinks)}</ul>
            )}
          </div>

          {/* Finanzas - colapsable */}
          <div style={sectionStyle}>
            <div
              onClick={() => setFinanzasOpen(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: 8,
                userSelect: 'none',
              }}
            >
              {expanded && (
                <>
                  <FaChevronRight
                    style={{
                      transform: finanzasOpen ? 'rotate(90deg)' : 'rotate(0)',
                      transition: 'transform 0.2s ease',
                      marginRight: 6,
                    }}
                  />
                  <h3 style={{ color: '#FF6B00', fontWeight: 700, fontSize: 16 }}>Mercadería y Finanzas</h3>
                </>
              )}
            </div>
            {finanzasOpen && (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 10 }}>
                {renderLinks(filterLinksByRole(finanzasLinks))}
              </ul>
            )}
          </div>
        </div>

        {/* Logout */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              backgroundColor: '#FF4040',
              color: '#FFF',
              border: 'none',
              padding: expanded ? '10px 14px' : 10,
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 16,
              width: expanded ? '100%' : 40,
              height: expanded ? 'auto' : 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
            }}
            title="Cerrar sesión"
          >
            🔒 {expanded && 'Cerrar sesión'}
          </button>
        </div>
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
            <p style={{ marginBottom: 20, fontSize: 18 }}>¿Seguro que querés cerrar sesión?</p>
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
