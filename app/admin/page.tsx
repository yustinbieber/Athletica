'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [activos, setActivos] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/login');
    } else {
      fetchEstadisticas(t);
    }
  }, [router]);

  async function fetchEstadisticas(token: string) {
    try {
      const res = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudieron obtener estadísticas');
      const data = await res.json();
      setActivos(data.activos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: '40px',
        backgroundColor: '#121212',
        minHeight: '100vh',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: '28px', marginBottom: '30px' }}>Panel del Administrador</h1>

      <div
        style={{
          backgroundColor: '#1E1E1E',
          borderRadius: '12px',
          padding: '30px 40px',
          boxShadow: '0 0 15px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          minWidth: '300px',
          maxWidth: '400px',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2
            style={{
              color: '#FFD700',
              fontSize: '22px',
              margin: 0,
            }}
          >
            Gimnasios Activos
          </h2>
          {loading ? (
            <p style={{ color: '#BBBBBB', marginTop: '8px' }}>Cargando...</p>
          ) : (
            <p
              style={{
                fontSize: '36px',
                margin: '10px 0 0',
                fontWeight: 'bold',
                color: '#FF6B00',
              }}
            >
              {activos}
            </p>
          )}
        </div>
        <span
          style={{
            fontSize: '40px',
            color: '#FFD700',
          }}
        >
          💪
        </span>
      </div>
    </div>
  );
}
