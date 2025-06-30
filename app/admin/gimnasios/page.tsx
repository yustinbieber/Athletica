'use client';

import { useEffect, useState } from 'react';

interface Gimnasio {
  _id: string;
  username: string;
  password: string;
  gymName: string;
  activo: boolean;
}

interface GimnasioUpdate {
  _id: string;
  username: string;
  gymName: string;
  password?: string;
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

export default function GimnasiosPage() {
  const [gimnasios, setGimnasios] = useState<Gimnasio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editGymName, setEditGymName] = useState('');

  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!t) {
      setError('No autorizado. Por favor inicia sesión.');
      setLoading(false);
      return;
    }
    setToken(t);
    fetchGimnasios(t);
  }, []);

  async function fetchGimnasios(token: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gimnasios', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error('No autorizado');
        throw new Error('Error al cargar gimnasios');
      }
      const data = await res.json();
      setGimnasios(data);
    } catch {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(gim: Gimnasio) {
    setEditId(gim._id);
    setEditUsername(gim.username);
    setEditPassword('');
    setEditGymName(gim.gymName);
  }

  async function handleEditSubmit() {
    if (!editId || !token) return;

    const body: GimnasioUpdate = {
      _id: editId,
      username: editUsername,
      gymName: editGymName,
    };

    if (editPassword.trim() !== '') {
      body.password = editPassword;
    }

    try {
      const res = await fetch('/api/gimnasios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error al editar gimnasio');
      setEditId(null);
      await fetchGimnasios(token);
    } catch {
      alert((e as Error).message);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    if (!confirm('¿Querés eliminar este gimnasio?')) return;
    try {
      const res = await fetch(`/api/gimnasios?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al eliminar gimnasio');
      await fetchGimnasios(token);
    } catch {
      alert((e as Error).message);
    }
  }

  async function toggleActivo(gim: Gimnasio) {
    if (!token) return;
    try {
      const res = await fetch('/api/gimnasios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          _id: gim._id,
          username: gim.username,
          gymName: gim.gymName,
          activo: !gim.activo,
        }),
      });
      if (!res.ok) throw new Error('Error al cambiar estado del gimnasio');
      await fetchGimnasios(token);
    } catch {
      alert((e as Error).message);
    }
  }

  // Filtro y búsqueda
  const gimnasiosFiltrados = gimnasios
    .filter((g) => {
      if (estadoFiltro === 'activos') return g.activo;
      if (estadoFiltro === 'inactivos') return !g.activo;
      return true;
    })
    .filter((g) => {
      const search = busqueda.toLowerCase();
      return (
        g.username.toLowerCase().includes(search) ||
        g.gymName.toLowerCase().includes(search)
      );
    });

  // Estadísticas
  const total = gimnasios.length;
  const activos = gimnasios.filter((g) => g.activo).length;
  const inactivos = total - activos;

  if (loading) return <p>Cargando gimnasios...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: 20, backgroundColor: '#121212', color: '#FFF', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Gimnasios registrados</h1>

      {/* Estadísticas */}
      <div style={{ marginBottom: 20 }}>
        <strong>Total:</strong> {total} | <strong>Activos:</strong> {activos} | <strong>Inactivos:</strong> {inactivos}
      </div>

      {/* Filtro y búsqueda */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value as 'todos' | 'activos' | 'inactivos')}
          style={inputStyle}
        >
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
        <input
          type="text"
          placeholder="Buscar por usuario o gimnasio"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={inputStyle}
        />
      </div>

      {gimnasiosFiltrados.length === 0 ? (
        <p>No hay gimnasios que coincidan con el filtro.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1E1E1E' }}>
          <thead>
            <tr>
              <th style={thStyle}>Usuario</th>
              <th style={thStyle}>Contraseña</th>
              <th style={thStyle}>Gym Name</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gimnasiosFiltrados.map((gim) =>
              editId === gim._id ? (
                <tr key={gim._id}>
                  <td style={tdStyle}>
                    <input
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="password"
                      placeholder="Nueva contraseña (opcional)"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      value={editGymName}
                      onChange={(e) => setEditGymName(e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={tdStyle}>{gim.activo ? '✅ Activo' : '⛔ Inactivo'}</td>
                  <td style={tdStyle}>
                    <button onClick={handleEditSubmit} style={buttonStyle('#FF6B00')}>
                      Guardar
                    </button>
                    <button onClick={() => setEditId(null)} style={buttonStyle('#888888')}>
                      Cancelar
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={gim._id}>
                  <td style={tdStyle}>{gim.username}</td>
                  <td style={tdStyle}>••••••</td>
                  <td style={tdStyle}>{gim.gymName}</td>
                  <td style={tdStyle}>{gim.activo ? '✅ Activo' : '⛔ Inactivo'}</td>
                  <td style={tdStyle}>
                    <button onClick={() => startEdit(gim)} style={buttonStyle('#FF6B00')}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(gim._id)} style={buttonStyle('#FF4040')}>
                      Eliminar
                    </button>
                    <button onClick={() => toggleActivo(gim)} style={buttonStyle('#FFD700')}>
                      {gim.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
