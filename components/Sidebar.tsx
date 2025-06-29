'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/crear-gimnasio', label: 'Crear Gimnasio' },
  { href: '/admin/gimnasios', label: 'Lista de Gimnasios' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleLogout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

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
        }}
      >
        <div>
          <h2 style={{ marginBottom: '24px', color: '#FFD700' }}>Athletica</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {links.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <li key={href} style={{ marginBottom: '12px' }}>
                  <Link
                    href={href}
                    style={{
                      display: 'block',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      color: isActive ? '#FF6B00' : '#FFF',
                      backgroundColor: isActive ? 'rgba(255, 107, 0, 0.15)' : 'transparent',
                      textDecoration: 'none',
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
                  </Link>
                </li>
              );
            })}
          </ul>
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
            <p style={{ marginBottom: '20px', fontSize: '18px' }}>
              ¿Seguro que querés cerrar sesión?
            </p>
            <button
              onClick={handleLogout}
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
