'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Empleado {
  _id: string;
  nombreCompleto: string;
  puesto?: string;
  activo: boolean;
}

interface GymTokenPayload {
  id: string;
  username: string;
  gymName: string;
  exp: number;
  iat: number;
}

export default function SeleccionarEmpleadoPage() {
  const router = useRouter();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gymId, setGymId] = useState<string | null>(null);

  useEffect(() => {
    // Obtener token del gimnasio y decodificar payload
    const token = localStorage.getItem('gymToken');
    if (!token) {
      router.push('/gym-dashboard/gym-login');
      return;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decoded: GymTokenPayload = JSON.parse(decodedJson);

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('gymToken');
        router.push('/gym-dashboard/gym-login');
        return;
      }

      setGymId(decoded.id);
      fetchEmpleados(decoded.id, token);
    } catch {
      localStorage.removeItem('gymToken');
      router.push('/gym-dashboard/gym-login');
    }
  }, [router]);

  async function fetchEmpleados(gymId: string, token: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/empleados?gymId=${encodeURIComponent(gymId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar empleados');
      const data = await res.json();
      // Filtrar solo empleados activos
      const activos = data.filter((e: Empleado) => e.activo);
      setEmpleados(activos);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function seleccionarEmpleado(empleado: Empleado) {
    localStorage.setItem('empleadoActivo', JSON.stringify(empleado));
    router.push('/gym-dashboard');
  }

  if (loading) return <p>Cargando empleados...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!empleados.length) return <p>No hay empleados activos para seleccionar.</p>;

  return (
    <div style={{ padding: 20, backgroundColor: '#121212', color: '#FFF', minHeight: '100vh' }}>
      <h1>Seleccioná un empleado</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {empleados.map((empleado) => (
          <li
            key={empleado._id}
            style={{
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: '#1E1E1E',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            onClick={() => seleccionarEmpleado(empleado)}
          >
            {empleado.nombreCompleto} {empleado.puesto ? `- ${empleado.puesto}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
