'use client';

import { useEffect, useState } from 'react';

interface Empleado {
  _id: string;
  nombreCompleto: string;
  email?: string;
  telefono?: string;
  puesto?: string;
  activo: boolean;
}

interface Props {
  gymId: string;
}

const inputStyle = {
  width: '100%',
  padding: '8px',
  backgroundColor: '#2C2C2C',
  color: '#FFF',
  border: '1px solid #444',
  borderRadius: '4px',
};

const buttonStyle = (bgColor: string) => ({
  backgroundColor: bgColor,
  color: '#FFF',
  border: 'none',
  padding: '8px 12px',
  marginRight: '6px',
  borderRadius: '4px',
  cursor: 'pointer',
});

export default function EmpleadosContent({ gymId }: Props) {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Nuevo empleado
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoPuesto, setNuevoPuesto] = useState('');

  // Edición
  const [editId, setEditId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editPuesto, setEditPuesto] = useState('');
  const [editActivo, setEditActivo] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('gymToken') : null;

  useEffect(() => {
    if (!token) {
      setError('No autorizado');
      setLoading(false);
      return;
    }
    fetchEmpleados();
  }, [token]);

  async function fetchEmpleados() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/empleados?gymId=${encodeURIComponent(gymId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar empleados');
      const data = await res.json();
      setEmpleados(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCrearEmpleado(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return alert('No autorizado');
    if (!nuevoNombre) return alert('El nombre es obligatorio');

    try {
      const res = await fetch('/api/empleados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombreCompleto: nuevoNombre,
          email: nuevoEmail,
          telefono: nuevoTelefono,
          puesto: nuevoPuesto,
          gymId,
        }),
      });
      if (!res.ok) throw new Error('Error al crear empleado');

      setNuevoNombre('');
      setNuevoEmail('');
      setNuevoTelefono('');
      setNuevoPuesto('');
      fetchEmpleados();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  function startEdit(empleado: Empleado) {
    setEditId(empleado._id);
    setEditNombre(empleado.nombreCompleto);
    setEditEmail(empleado.email || '');
    setEditTelefono(empleado.telefono || '');
    setEditPuesto(empleado.puesto || '');
    setEditActivo(empleado.activo);
  }

  async function handleEditSubmit() {
    if (!editId || !token) return;
    if (!editNombre) return alert('El nombre es obligatorio');

    try {
      const res = await fetch('/api/empleados', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          _id: editId,
          nombreCompleto: editNombre,
          email: editEmail,
          telefono: editTelefono,
          puesto: editPuesto,
          activo: editActivo,
        }),
      });
      if (!res.ok) throw new Error('Error al actualizar empleado');
      setEditId(null);
      fetchEmpleados();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    if (!confirm('¿Querés eliminar este empleado?')) return;

    try {
      const res = await fetch(`/api/empleados?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Error al eliminar empleado');
      fetchEmpleados();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  if (loading) return <p>Cargando empleados...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: 20, backgroundColor: '#121212', color: '#FFF', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Empleados</h1>

      <form onSubmit={handleCrearEmpleado} style={{ marginBottom: 20, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Nombre completo *"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 200px' }}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={nuevoEmail}
          onChange={(e) => setNuevoEmail(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 200px' }}
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={nuevoTelefono}
          onChange={(e) => setNuevoTelefono(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 150px' }}
        />
        <input
          type="text"
          placeholder="Puesto"
          value={nuevoPuesto}
          onChange={(e) => setNuevoPuesto(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 150px' }}
        />
        <button type="submit" style={buttonStyle('#FF6B00')}>
          Crear
        </button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1E1E1E' }}>
        <thead>
          <tr>
            <th style={{ padding: '12px', backgroundColor: '#1E1E1E', color: '#FFD700', textAlign: 'left' }}>Nombre</th>
            <th style={{ padding: '12px', backgroundColor: '#1E1E1E', color: '#FFD700', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '12px', backgroundColor: '#1E1E1E', color: '#FFD700', textAlign: 'left' }}>Teléfono</th>
            <th style={{ padding: '12px', backgroundColor: '#1E1E1E', color: '#FFD700', textAlign: 'left' }}>Puesto</th>
            <th style={{ padding: '12px', backgroundColor: '#1E1E1E', color: '#FFD700', textAlign: 'left' }}>Activo</th>
            <th style={{ padding: '12px', backgroundColor: '#1E1E1E', color: '#FFD700' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((empleado) =>
            editId === empleado._id ? (
              <tr key={empleado._id}>
                <td style={{ padding: '12px' }}>
                  <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} style={inputStyle} required />
                </td>
                <td style={{ padding: '12px' }}>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={inputStyle} />
                </td>
                <td style={{ padding: '12px' }}>
                  <input value={editTelefono} onChange={(e) => setEditTelefono(e.target.value)} style={inputStyle} />
                </td>
                <td style={{ padding: '12px' }}>
                  <input value={editPuesto} onChange={(e) => setEditPuesto(e.target.value)} style={inputStyle} />
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={editActivo}
                    onChange={(e) => setEditActivo(e.target.checked)}
                    style={{ width: '20px', height: '20px' }}
                  />
                </td>
                <td style={{ padding: '12px' }}>
                  <button onClick={handleEditSubmit} style={buttonStyle('#FF6B00')}>
                    Guardar
                  </button>
                  <button onClick={() => setEditId(null)} style={buttonStyle('#888')}>
                    Cancelar
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={empleado._id}>
                <td style={{ padding: '12px' }}>{empleado.nombreCompleto}</td>
                <td style={{ padding: '12px' }}>{empleado.email}</td>
                <td style={{ padding: '12px' }}>{empleado.telefono}</td>
                <td style={{ padding: '12px' }}>{empleado.puesto}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{empleado.activo ? '✅' : '⛔'}</td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => startEdit(empleado)} style={buttonStyle('#FF6B00')}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(empleado._id)} style={buttonStyle('#FF4040')}>
                    Eliminar
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
