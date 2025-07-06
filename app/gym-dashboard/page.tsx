'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/gym/Sidebar';

import DashboardContent from '@/components/gym/DashboardContent';
import PlanesContent from '@/components/gym/PlanesContent';
import UsuariosContent from '@/components/gym/UsuariosContent';
import ControlIngresosContent from '@/components/gym/ControlIngresosContent';
import MercaderiaPage from '@/components/gym/Mercaderia';
import EmpleadosContent from '@/components/gym/EmpleadosContent';
import ControlPlataContent from '@/components/gym/ControlPlataContent';
import PorVencerContent from '@/components/gym/PorVencerContent';

interface GymTokenPayload {
  id: string;
  username?: string;
  gymName: string;
  gymId?: string;
  empleadoId?: string;
  rol: 'admin' | 'empleado';
  exp: number;
  iat: number;
  nombreCompleto?: string;
}

interface Empleado {
  _id?: string;
  nombreCompleto: string;
}

export default function GymDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<GymTokenPayload | null>(null);
  const [empleadoActivo, setEmpleadoActivo] = useState<Empleado | null>(null);
  const [section, setSection] = useState('dashboard');
  const [rol, setRol] = useState<'dueño' | 'empleado'>();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gymToken');
    if (!token) {
      router.push('/gym-login');
      return;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decoded: GymTokenPayload = JSON.parse(decodedJson);

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('gymToken');
        router.push('/gym-login');
        return;
      }

      setUserData(decoded);
      setRol(decoded.rol === 'admin' ? 'dueño' : 'empleado');

      const nombre = localStorage.getItem('empleadoNombre');
      if (nombre) setEmpleadoActivo({ nombreCompleto: nombre });
    } catch {
      localStorage.removeItem('gymToken');
      router.push('/gym-login');
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('gymToken');
    localStorage.removeItem('empleadoNombre');
    router.push('/gym-login');
  }

  if (!userData || !rol) return <p>Cargando...</p>;

  let content;
  switch (section) {
    case 'dashboard':
      content = (
        <DashboardContent
          gymName={userData.gymName}
          gymId={userData.gymId || userData.id}
          token={localStorage.getItem('gymToken') || ''}
        />
      );
      break;
    case 'planes':
      content = <PlanesContent />;
      break;
    case 'usuarios':
      content = <UsuariosContent />;
      break;
    case 'ingresos':
      content = <ControlIngresosContent />;
      break;
      case 'porVencer':
      content = <PorVencerContent />;
      break;
    case 'mercaderia':
      content = <MercaderiaPage />;
      break;
    case 'empleados':
      content = (
        <EmpleadosContent
          gymId={userData.rol === 'admin' ? userData.id : userData.gymId!}
        />
      );
      break;
      case 'Movimientos':
        content = (
          <ControlPlataContent
            gymId={userData.rol === 'admin' ? userData.id : userData.gymId!}
            empleadoId={userData.empleadoId || ''}
            rol={userData.rol}
            token={localStorage.getItem('gymToken') || ''}
          />
        );
        break;      
        default:
          content = (
            <DashboardContent
              gymName={userData.gymName}
              gymId={userData.gymId || userData.id}
              token={localStorage.getItem('gymToken') || ''}
            />
          );
      }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        currentSection={section}
        setSection={setSection}
        onLogout={handleLogout}
        gymName={userData.gymName || ''}
        empleadoNombre={empleadoActivo?.nombreCompleto}
        role={rol}
        expanded={sidebarExpanded}
        setExpanded={setSidebarExpanded}
      />

      <main
        style={{
          flexGrow: 1,
          padding: '20px',
          transition: 'margin-left 0.3s ease',
          marginLeft: sidebarExpanded ? '220px' : '80px',
          display: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: '1200px' }}>{content}</div>
      </main>
    </div>
  );
}
