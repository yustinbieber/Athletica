'use client';

import { useEffect, useState } from 'react';

interface Plan {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionDias: number;
}

const thStyle = {
  padding: '12px',
  backgroundColor: '#1E1E1E',
  color: '#FFD700',
  textAlign: 'left' as const,
  borderBottom: '1px solid #333',
};

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid #333',
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  backgroundColor: '#2C2C2C',
  color: '#FFFFFF',
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

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para crear nuevo plan
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevaDuracion, setNuevaDuracion] = useState('');

  // Estados para editar
  const [editId, setEditId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [editDuracion, setEditDuracion] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('gymToken') : null;

  useEffect(() => {
    if (!token) {
      setError('No autorizado');
      setLoading(false);
      return;
    }
    fetchPlanes();
  }, []);

  async function fetchPlanes() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/planes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar planes');
      const data = await res.json();
      setPlanes(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCrearPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return alert('No autorizado');

    if (!nuevoNombre || !nuevoPrecio || !nuevaDuracion) {
      return alert('Completa todos los campos obligatorios');
    }

    try {
      const res = await fetch('/api/planes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: nuevoNombre,
          descripcion: nuevaDescripcion,
          precio: Number(nuevoPrecio),
          duracionDias: Number(nuevaDuracion),
        }),
      });

      if (!res.ok) throw new Error('Error al crear plan');

      setNuevoNombre('');
      setNuevaDescripcion('');
      setNuevoPrecio('');
      setNuevaDuracion('');
      fetchPlanes();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  function startEdit(plan: Plan) {
    setEditId(plan._id);
    setEditNombre(plan.nombre);
    setEditDescripcion(plan.descripcion || '');
    setEditPrecio(plan.precio.toString());
    setEditDuracion(plan.duracionDias.toString());
  }

  async function handleEditSubmit() {
    if (!editId || !token) return;

    if (!editNombre || !editPrecio || !editDuracion) {
      return alert('Completa todos los campos obligatorios');
    }

    try {
      const res = await fetch('/api/planes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          _id: editId,
          nombre: editNombre,
          descripcion: editDescripcion,
          precio: Number(editPrecio),
          duracionDias: Number(editDuracion),
        }),
      });

      if (!res.ok) throw new Error('Error al editar plan');

      setEditId(null);
      fetchPlanes();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    if (!confirm('¿Querés eliminar este plan?')) return;

    try {
      const res = await fetch(`/api/planes?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al eliminar plan');

      fetchPlanes();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  if (loading) return <p>Cargando planes...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: 20, backgroundColor: '#121212', color: '#FFF', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Planes</h1>

      <form onSubmit={handleCrearPlan} style={{ marginBottom: 20, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Nombre *"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 200px' }}
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={nuevaDescripcion}
          onChange={(e) => setNuevaDescripcion(e.target.value)}
          style={{ ...inputStyle, flex: '2 1 300px' }}
        />
        <input
          type="number"
          placeholder="Precio *"
          value={nuevoPrecio}
          onChange={(e) => setNuevoPrecio(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 120px' }}
          required
          min={0}
        />
        <input
          type="number"
          placeholder="Duración en días *"
          value={nuevaDuracion}
          onChange={(e) => setNuevaDuracion(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 140px' }}
          required
          min={1}
        />
        <button type="submit" style={buttonStyle('#FF6B00')}>
          Crear
        </button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1E1E1E' }}>
        <thead>
          <tr>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Descripción</th>
            <th style={thStyle}>Precio</th>
            <th style={thStyle}>Duración (días)</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {planes.map((plan) =>
            editId === plan._id ? (
              <tr key={plan._id}>
                <td style={tdStyle}>
                  <input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    style={inputStyle}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    value={editPrecio}
                    onChange={(e) => setEditPrecio(e.target.value)}
                    style={inputStyle}
                    required
                    min={0}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    value={editDuracion}
                    onChange={(e) => setEditDuracion(e.target.value)}
                    style={inputStyle}
                    required
                    min={1}
                  />
                </td>
                <td style={tdStyle}>
                  <button onClick={handleEditSubmit} style={buttonStyle('#FF6B00')}>
                    Guardar
                  </button>
                  <button onClick={() => setEditId(null)} style={buttonStyle('#888')}>
                    Cancelar
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={plan._id}>
                <td style={tdStyle}>{plan.nombre}</td>
                <td style={tdStyle}>{plan.descripcion}</td>
                <td style={tdStyle}>${plan.precio}</td>
                <td style={tdStyle}>{plan.duracionDias}</td>
                <td style={tdStyle}>
                  <button onClick={() => startEdit(plan)} style={buttonStyle('#FF6B00')}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(plan._id)} style={buttonStyle('#FF4040')}>
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
