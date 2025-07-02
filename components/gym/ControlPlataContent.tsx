'use client';

import { useEffect, useState } from 'react';

interface Movimiento {
  _id: string;
  tipo: 'ingreso' | 'egreso';
  descripcion: string;
  monto: number;
  fecha: string;
  socioId?: string | null;
  empleadoId: string;
  gymId: string;
}

interface Props {
  gymId: string;
  empleadoId: string;
}

export default function ControlPlataContent({ gymId, empleadoId }: Props) {

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Formulario
  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('ingreso');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [socioId, setSocioId] = useState('');

  async function fetchMovimientos() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/movimientos?gymId=${encodeURIComponent(gymId)}`);
      if (!res.ok) throw new Error('Error al cargar movimientos');
      const data = await res.json();
      setMovimientos(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (gymId?.trim()) fetchMovimientos();
  }, [gymId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!descripcion.trim() || !monto.trim()) {
      setError('Descripción y monto son obligatorios');
      return;
    }

    if (isNaN(Number(monto)) || Number(monto) <= 0) {
      setError('Monto debe ser un número positivo');
      return;
    }

    if (!empleadoId.trim() || !gymId.trim()) {
      setError('Empleado y gimnasio deben estar definidos');
      return;
    }

    const bodyData = {
      tipo,
      descripcion: descripcion.trim(),
      monto: Number(monto),
      socioId: socioId.trim() === '' ? null : socioId.trim(),
      empleadoId: empleadoId.trim(),
      gymId: gymId.trim(),
    };

    try {
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al crear movimiento');
        return;
      }

      setDescripcion('');
      setMonto('');
      setSocioId('');
      fetchMovimientos();
    } catch {
      setError('Error en la conexión');
    }
  }

  // Calcular saldo total
  const saldo = movimientos.reduce((acc, m) => (m.tipo === 'ingreso' ? acc + m.monto : acc - m.monto), 0);

  return (
    <div style={{ padding: 20, backgroundColor: '#121212', color: '#FFF', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Control de Plata</h1>

      <form
        onSubmit={handleSubmit}
        style={{ marginBottom: 30, maxWidth: 600, display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <label>
          Tipo:
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value as 'ingreso' | 'egreso')}
            style={{ marginLeft: 8, padding: 6 }}
          >
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
        </label>

        <label>
          Descripción:
          <input
            type="text"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Detalle del movimiento"
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 4,
              border: '1px solid #444',
              backgroundColor: '#2C2C2C',
              color: '#FFF',
            }}
            required
          />
        </label>

        <label>
          Monto:
          <input
            type="number"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            placeholder="Cantidad"
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 4,
              border: '1px solid #444',
              backgroundColor: '#2C2C2C',
              color: '#FFF',
            }}
            required
            min="0"
            step="0.01"
          />
        </label>

        <label>
          Socio ID (opcional):
          <input
            type="text"
            value={socioId}
            onChange={e => setSocioId(e.target.value)}
            placeholder="Asociar a socio"
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 4,
              border: '1px solid #444',
              backgroundColor: '#2C2C2C',
              color: '#FFF',
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            backgroundColor: '#FF6B00',
            color: '#FFF',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Registrar Movimiento
        </button>

        {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
      </form>

      <h2 style={{ marginBottom: 10 }}>Movimientos recientes</h2>
      {loading ? (
        <p>Cargando movimientos...</p>
      ) : movimientos.length === 0 ? (
        <p>No hay movimientos registrados.</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1E1E1E' }}>
            <thead>
              <tr>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Descripción</th>
                <th style={thStyle}>Monto</th>
                <th style={thStyle}>Socio ID</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map(mov => (
                <tr key={mov._id}>
                  <td style={tdStyle}>{new Date(mov.fecha).toLocaleString()}</td>
                  <td style={tdStyle}>{mov.tipo}</td>
                  <td style={tdStyle}>{mov.descripcion}</td>
                  <td style={{ ...tdStyle, color: mov.tipo === 'ingreso' ? '#4CAF50' : '#F44336' }}>
                    {mov.monto.toFixed(2)}
                  </td>
                  <td style={tdStyle}>{mov.socioId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ marginTop: 20, fontWeight: 'bold', fontSize: 18 }}>Saldo total: {saldo.toFixed(2)}</p>
        </>
      )}
    </div>
  );
}

const thStyle = {
  padding: '12px',
  backgroundColor: '#1E1E1E',
  color: '#FFD700',
  textAlign: 'left' as const,
};

const tdStyle = {
  padding: '12px',
  borderTop: '1px solid #333',
};
