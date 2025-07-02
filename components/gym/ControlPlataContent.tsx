'use client';

import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

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

interface Empleado {
  _id: string;
  nombreCompleto: string;
  empleadoId: string;
}

interface Props {
  gymId: string;
  empleadoId: string;
  rol: 'admin' | 'empleado';
  token: string;
}

export default function ControlPlataContent({ gymId, empleadoId, rol, token }: Props) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('ingreso');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [socioId, setSocioId] = useState('');
  const [editMovimiento, setEditMovimiento] = useState<Movimiento | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<'todos' | 'ingreso' | 'egreso'>('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 10;

  // Fetch movimientos
  async function fetchMovimientos() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/movimientos?gymId=${encodeURIComponent(gymId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar movimientos');
      const data = await res.json();
      setMovimientos(data.reverse());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch empleados
  async function fetchEmpleados() {
    try {
      const res = await fetch(`/api/empleados?gymId=${encodeURIComponent(gymId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar empleados');
      const data = await res.json();
      setEmpleados(data);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    if (gymId?.trim()) {
      fetchMovimientos();
      fetchEmpleados();
    }
  }, [gymId]);

  // Submit nuevo o edición
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

  // Edición
  function iniciarEdicion(mov: Movimiento) {
    setEditMovimiento(mov);
    setTipo(mov.tipo);
    setDescripcion(mov.descripcion);
    setMonto(mov.monto.toString());
    setSocioId(mov.socioId || '');
  }

  async function guardarEdicion() {
    if (!editMovimiento) return;
    setError('');
    if (!descripcion.trim() || !monto.trim()) {
      setError('Descripción y monto son obligatorios');
      return;
    }
    if (isNaN(Number(monto)) || Number(monto) <= 0) {
      setError('Monto debe ser un número positivo');
      return;
    }
    try {
      const res = await fetch('/api/movimientos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: editMovimiento._id,
          tipo,
          descripcion: descripcion.trim(),
          monto: Number(monto),
          socioId: socioId.trim() === '' ? null : socioId.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al actualizar movimiento');
        return;
      }
      setEditMovimiento(null);
      setDescripcion('');
      setMonto('');
      setSocioId('');
      fetchMovimientos();
    } catch {
      setError('Error en la conexión');
    }
  }

  function cancelarEdicion() {
    setEditMovimiento(null);
    setDescripcion('');
    setMonto('');
    setSocioId('');
  }

  // Eliminar
  async function eliminarMovimiento(id: string) {
    if (!confirm('¿Estás seguro de eliminar este movimiento?')) return;
    setError('');
    try {
      const res = await fetch(`/api/movimientos?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al eliminar movimiento');
        return;
      }
      fetchMovimientos();
    } catch {
      setError('Error en la conexión');
    }
  }

  // FILTROS
  const movimientosFiltrados = movimientos.filter(mov => {
    const coincideDescripcion =
      mov.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mov.socioId?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const coincideTipo = filterTipo === 'todos' || mov.tipo === filterTipo;
    const fechaMovimiento = new Date(mov.fecha);
    const desde = fechaDesde ? new Date(fechaDesde) : null;
    const hasta = fechaHasta ? new Date(fechaHasta) : null;
    const enRango = (!desde || fechaMovimiento >= desde) && (!hasta || fechaMovimiento <= hasta);
    return coincideDescripcion && coincideTipo && enRango;
  });

  // PAGINACIÓN
  const totalPaginas = Math.ceil(movimientosFiltrados.length / porPagina);
  const movimientosPagina = movimientosFiltrados.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);

  const ingresos = movimientosFiltrados.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + m.monto, 0);
  const egresos = movimientosFiltrados.filter(m => m.tipo === 'egreso').reduce((acc, m) => acc + m.monto, 0);
  const saldo = ingresos - egresos;

  // Exportar Excel
  function exportarExcel() {
    const hoja = XLSX.utils.json_to_sheet(movimientosFiltrados);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Movimientos');
    XLSX.writeFile(libro, 'control_plata.xlsx');
  }

  return (
    <div className="container">
      <h1>Control de Plata</h1>

      <form
        onSubmit={editMovimiento ? (e) => { e.preventDefault(); guardarEdicion(); } : handleSubmit}
        className="form"
      >
        <label>
          Tipo:
          <select value={tipo} onChange={e => setTipo(e.target.value as 'ingreso' | 'egreso')}>
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
        </label>

        <label>
          Descripción:
          <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
        </label>

        <label>
          Monto:
          <input type="number" value={monto} onChange={e => setMonto(e.target.value)} min="0" step="0.01" required />
        </label>

        <label>
          Socio ID (opcional):
          <input type="text" value={socioId} onChange={e => setSocioId(e.target.value)} />
        </label>

        {editMovimiento ? (
          <div className="btn-group">
            <button type="button" onClick={guardarEdicion} className="btn btn-primary">Guardar cambios</button>
            <button type="button" onClick={cancelarEdicion} className="btn btn-secondary">Cancelar</button>
          </div>
        ) : (
          <button type="submit" className="btn btn-primary">Registrar Movimiento</button>
        )}

        {error && <p className="error">{error}</p>}
      </form>

      <div className="movimientos-lista">
        {/* FILTROS */}
        <div className="filters">
          <input
            type="text"
            placeholder={rol === 'empleado' ? 'Buscar descripción o empleado' : 'Buscar descripción o socio'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input"
          />
          <select value={filterTipo} onChange={e => setFilterTipo(e.target.value as any)} className="input">
            <option value="todos">Todos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>
          <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} className="input" />
          <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} className="input" />
          <button onClick={exportarExcel} className="btn btn-primary">Exportar Excel</button>
        </div>

        {/* MOVIMIENTOS */}
        {loading ? (
          <p>Cargando movimientos...</p>
        ) : movimientosFiltrados.length === 0 ? (
          <p>No hay movimientos.</p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Empleado</th>
                  {rol === 'admin' && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {movimientosPagina.map(mov => {
                  const empleado = empleados.find(e => e.empleadoId === mov.empleadoId);
                  return (
                    <tr key={mov._id}>
                      <td>{new Date(mov.fecha).toLocaleString()}</td>
                      <td className={mov.tipo === 'ingreso' ? 'ingreso' : 'egreso'}>{mov.tipo}</td>
                      <td>{mov.descripcion}</td>
                      <td className={mov.tipo === 'ingreso' ? 'ingreso' : 'egreso'}>
                        {mov.monto.toFixed(2)}
                      </td>
                      <td>{empleado?.nombreCompleto || '-'}</td>
                      {rol === 'admin' && (
                        <td className="actions">
                          <button onClick={() => iniciarEdicion(mov)} className="btn btn-primary">Editar</button>
                          <button onClick={() => eliminarMovimiento(mov._id)} className="btn btn-danger">Eliminar</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* PAGINACIÓN */}
            <div className="pagination">
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPaginaActual(i + 1)}
                  disabled={paginaActual === i + 1}
                  className={paginaActual === i + 1 ? 'page-btn active' : 'page-btn'}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* RESUMEN */}
            <div className="summary">
              <p>
                Ingresos: <span className="ingresos">{ingresos.toFixed(2)}</span>
              </p>
              <p>
                Egresos: <span className="egresos">{egresos.toFixed(2)}</span>
              </p>
              <p>
                Saldo total: <span className="saldo">{saldo.toFixed(2)}</span>
              </p>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 960px;
          margin: 24px auto;
          padding: 20px;
          background-color: #121212;
          color: #fff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 0;
          text-align: center;
          color: #ff6b00;
        }

        /* FORMULARIO ARRIBA */
        .form {
          background-color: #1e1e1e;
          padding: 24px 30px;
          border-radius: 12px;
          box-shadow: 0 0 15px #ff6b0055;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px 24px;
          align-items: end;
        }

        .form label {
          display: flex;
          flex-direction: column;
          font-weight: 600;
          font-size: 14px;
          color: #ccc;
        }

        .form select,
        .form input[type='text'],
        .form input[type='number'] {
          margin-top: 6px;
          padding: 10px 14px;
          border-radius: 6px;
          border: 1px solid #444;
          background-color: #2c2c2c;
          color: #fff;
          font-size: 15px;
          transition: border-color 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }

        .form select:focus,
        .form input[type='text']:focus,
        .form input[type='number']:focus {
          outline: none;
          border-color: #ff6b00;
          box-shadow: 0 0 8px #ff6b00aa;
        }

        .btn {
          background-color: #ff6b00;
          color: #fff;
          border: none;
          padding: 12px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          font-size: 16px;
          transition: background-color 0.3s ease;
          justify-self: start;
          width: max-content;
        }

        .btn:hover {
          background-color: #e65a00;
        }

        .btn-secondary {
          background-color: #555;
          color: #ddd;
        }

        .btn-secondary:hover {
          background-color: #444;
        }

        /* TABLA ABAJO */
        .movimientos-lista {
          background-color: #1e1e1e;
          padding: 20px 30px;
          border-radius: 12px;
          box-shadow: 0 0 15px #ff6b0055;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background-color: #121212;
          color: #fff;
          font-size: 14px;
        }

        th,
        td {
          padding: 12px 16px;
          border-bottom: 1px solid #2c2c2c;
          text-align: left;
        }

        th {
          background-color: #222;
          font-weight: 700;
          color: #ff6b00;
        }

        .actions button {
          margin-right: 10px;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 13px;
        }

        .btn-danger {
          background-color: #b00020;
        }

        .btn-danger:hover {
          background-color: #8a0018;
        }

        .ingreso {
          color: #4caf50;
          font-weight: 700;
        }

        .egreso {
          color: #f44336;
          font-weight: 700;
        }

        /* PAGINACIÓN */
        .pagination {
          margin-top: 20px;
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .page-btn {
          background-color: #2c2c2c;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          color: #aaa;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }

        .page-btn:hover:not(:disabled) {
          background-color: #ff6b00;
          color: #fff;
        }

        .page-btn:disabled {
          background-color: #ff6b00;
          color: #fff;
          cursor: default;
        }

        /* RESUMEN ABAJO DE TABLA */
        .summary {
          margin-top: 20px;
          font-weight: 700;
          display: flex;
          gap: 40px;
          justify-content: center;
          color: #ff6b00;
        }

        .error {
          color: #f44336;
          font-weight: 700;
          margin-top: 10px;
          grid-column: 1 / -1;
        }

        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
          justify-content: center;
        }

        .input {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #444;
          background-color: #2c2c2c;
          color: #fff;
          font-size: 14px;
          min-width: 120px;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        .input:focus {
          outline: none;
          border-color: #ff6b00;
          box-shadow: 0 0 8px #ff6b00aa;
        }

        .btn-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
