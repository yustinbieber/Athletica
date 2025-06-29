'use client';

import { SetStateAction, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/gym/Sidebar';

import DashboardContent from '@/components/gym/DashboardContent';
import PlanesContent from '@/components/gym/PlanesContent';
import UsuariosContent from '@/components/gym/UsuariosContent';
import ControlIngresosContent from '@/components/gym/ControlIngresosContent';
import MercaderiaPage from '@/components/gym/Mercaderia';
import EmpleadosContent from '@/components/gym/EmpleadosContent';
import ControlPlataContent from '@/components/gym/ControlPlataContent'; // <--- Importar nuevo componente


interface GymTokenPayload {
  id: string;
  username: string;
  gymName: string;
  empleadoId?: string;
  exp: number;
  iat: number;
}

interface Empleado {
  _id: string;
  nombreCompleto: string;
  // otros campos si los usas
}

export default function GymDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<GymTokenPayload | null>(null);
  const [empleadoActivo, setEmpleadoActivo] = useState<Empleado | null>(null);
  const [section, setSection] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('gymToken');
    if (!token) {
      router.push('/gym-dashboard/gym-login');
      return;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decoded = JSON.parse(decodedJson);

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('gymToken');
        router.push('/gym-dashboard/gym-login');
        return;
      }

      setUserData(decoded);

      // Intentamos cargar empleado activo desde localStorage
      const empleadoStr = localStorage.getItem('empleadoActivo');
      if (empleadoStr) {
        setEmpleadoActivo(JSON.parse(empleadoStr));
      }
    } catch {
      localStorage.removeItem('gymToken');
      router.push('/gym-dashboard/gym-login');
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('gymToken');
    localStorage.removeItem('empleadoActivo'); // borrar empleado activo al cerrar sesión
    router.push('/gym-dashboard/gym-login');
  }

  if (!userData) return <p>Cargando...</p>;

  let content;
  switch (section) {
    case 'dashboard':
      content = <DashboardContent gymName={userData.gymName} />;
      break;
    case 'planes':
      content = <PlanesContent />;
      break;
    case 'usuarios':
      content = <UsuariosContent />;
      break;
    case 'ingresos':
      // Pasale el empleadoActivo._id para controlar dinero, etc.
      content = <ControlIngresosContent />;
      break;
    case 'mercaderia':
      content = <MercaderiaPage />;
      break;
      case 'empleados':
        content = <EmpleadosContent gymId={userData.id} />;
        break;
      case 'Movimientos':
        content = (
          <ControlPlataContent
            gymId={userData.id}
            empleadoId={userData.empleadoId || ''} // <-- pasar empleadoId aquí
          />
        );
        break;
      default:
        content = <DashboardContent gymName={userData.gymName} />;
    }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar
        currentSection={section}
        setSection={setSection}
        onLogout={handleLogout}
        gymName={userData.gymName}
        empleadoNombre={empleadoActivo?.nombreCompleto} // PASAMOS NOMBRE EMPLEADO AL SIDEBAR
      />
      <main style={{ marginLeft: '22px', padding: '30px 20px', width: '100%' }}>
        {content}
      </main>
    </div>
  );
}
