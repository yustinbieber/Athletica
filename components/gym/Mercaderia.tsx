'use client';

import { useEffect, useState } from 'react';

interface Mercaderia {
  _id: string;
  nombre: string;
  descripcion?: string;
  stock: number;
  precioUnitario: number;
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

export default function MercaderiaPage() {
  const [mercaderias, setMercaderias] = useState<Mercaderia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Crear/editar estados
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoStock, setNuevoStock] = useState('0');
  const [nuevoPrecio, setNuevoPrecio] = useState('');

  const [editId, setEditId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editStock, setEditStock] = useState('0');
  const [editPrecio, setEditPrecio] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('gymToken') : null;

  useEffect(() => {
    if (!token) {
      setError('No autorizado');
      setLoading(false);
      return;
    }
    fetchMercaderias();
  }, []);

  async function fetchMercaderias() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/mercaderia', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar mercadería');
      const data = await res.json();
      setMercaderias(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCrearMercaderia(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return alert('No autorizado');

    if (!nuevoNombre || !nuevoPrecio) {
      return alert('Completa los campos obligatorios');
    }

    try {
      const res = await fetch('/api/mercaderia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: nuevoNombre,
          descripcion: nuevaDescripcion,
          stock: Number(nuevoStock),
          precioUnitario: Number(nuevoPrecio),
        }),
      });

      if (!res.ok) throw new Error('Error al crear mercadería');

      setNuevoNombre('');
      setNuevaDescripcion('');
      setNuevoStock('0');
      setNuevoPrecio('');
      fetchMercaderias();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  function startEdit(m: Mercaderia) {
    setEditId(m._id);
    setEditNombre(m.nombre);
    setEditDescripcion(m.descripcion || '');
    setEditStock(m.stock.toString());
    setEditPrecio(m.precioUnitario.toString());
  }

  async function handleEditSubmit() {
    if (!editId || !token) return;

    if (!editNombre || !editPrecio) {
      return alert('Completa los campos obligatorios');
    }

    try {
      const res = await fetch('/api/mercaderia', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          _id: editId,
          nombre: editNombre,
          descripcion: editDescripcion,
          stock: Number(editStock),
          precioUnitario: Number(editPrecio),
        }),
      });

      if (!res.ok) throw new Error('Error al editar mercadería');

      setEditId(null);
      fetchMercaderias();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    if (!confirm('¿Querés eliminar esta mercadería?')) return;

    try {
      const res = await fetch(`/api/mercaderia?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al eliminar mercadería');

      fetchMercaderias();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  if (loading) return <p>Cargando mercadería...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: 20, backgroundColor: '#121212', color: '#FFF', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Mercadería</h1>

      <form onSubmit={handleCrearMercaderia} style={{ marginBottom: 20, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
          placeholder="Stock"
          value={nuevoStock}
          onChange={(e) => setNuevoStock(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 100px' }}
          min={0}
        />
        <input
          type="number"
          placeholder="Precio Unitario *"
          value={nuevoPrecio}
          onChange={(e) => setNuevoPrecio(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 140px' }}
          required
          min={0}
          step="0.01"
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
            <th style={thStyle}>Stock</th>
            <th style={thStyle}>Precio Unitario</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {mercaderias.map((m) =>
            editId === m._id ? (
              <tr key={m._id}>
                <td style={tdStyle}>
                  <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} style={inputStyle} required />
                </td>
                <td style={tdStyle}>
                  <input value={editDescripcion} onChange={(e) => setEditDescripcion(e.target.value)} style={inputStyle} />
                </td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    style={inputStyle}
                    min={0}
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
                    step="0.01"
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
              <tr key={m._id}>
                <td style={tdStyle}>{m.nombre}</td>
                <td style={tdStyle}>{m.descripcion}</td>
                <td style={tdStyle}>{m.stock}</td>
                <td style={tdStyle}>${m.precioUnitario.toFixed(2)}</td>
                <td style={tdStyle}>
                  <button onClick={() => startEdit(m)} style={buttonStyle('#FF6B00')}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(m._id)} style={buttonStyle('#FF4040')}>
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
