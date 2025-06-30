'use client';

import { useEffect, useState } from 'react';

interface Plan {
  _id: string;
  nombre: string;
}

interface Socio {
  documento: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  telefono: string;
  email?: string;
  direccion?: string;
  contactoEmergencia: string;
  planId: string;
  activo: boolean;
  fechaAlta: string;
}

const baseInputStyle = {
  width: '100%',
  padding: '8px',
  backgroundColor: '#2C2C2C',
  color: '#FFFFFF',
  border: '1px solid #444',
  borderRadius: '4px',
  fontSize: '0.95rem',
  boxSizing: 'border-box' as const,
  outline: 'none',
};


const containerStyle = {
  maxWidth: '1400px',   // ancho máximo más grande para que haya más espacio
  margin: '0 auto',     // centra la página horizontalmente
  padding: '0 1px',    // agrega espacio a los lados (izq y der)
};


const boxStyle = {
  backgroundColor: '#1E1E1E',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(255, 107, 0, 0.2)',
  padding: '24px',
  marginBottom: '32px',
};


const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px 24px',
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  fontWeight: 600,
  fontSize: '0.95rem',
  marginBottom: '4px',
  color: '#FFD700',
};

const tableContainerStyle = {
  overflowX: 'auto' as const,
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  backgroundColor: '#1E1E1E',
};

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
  color: '#FFFFFF',
};


const buttonBaseStyle = {
  color: '#FFF',
  border: 'none',
  padding: '12px 18px',
  marginRight: '12px',
  borderRadius: '6px',
  cursor: 'pointer',
  minWidth: '120px',
  fontWeight: '600',
  fontSize: '1rem',
  userSelect: 'none' as const, // <- aquí la corrección
  transition: 'background-color 0.3s ease',
};

function darkenColor(color: string, percent: number) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

export default function GestionUsuarios() {
  // Estados inputs focus para aplicar estilos
  const [inputFocus, setInputFocus] = useState<{ [key: string]: boolean }>({});

  // Estado para hover botones: guardamos el documento del socio en edición para aplicar hover
  const [btnHover, setBtnHover] = useState<{ [key: string]: boolean }>({});

  // Estado hover en filas tabla (documento)
  const [rowHover, setRowHover] = useState<string | null>(null);

  const [socios, setSocios] = useState<Socio[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  

  const [editDocumento, setEditDocumento] = useState('');
  const [editNombre, setEditNombre] = useState('');
  const [editFechaNacimiento, setEditFechaNacimiento] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDireccion, setEditDireccion] = useState('');
  const [editContactoEmergencia, setEditContactoEmergencia] = useState('');
  const [editPlanId, setEditPlanId] = useState('');
  const [editActivo, setEditActivo] = useState(true);
  const [editFechaAlta, setEditFechaAlta] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('gymToken');
      if (!t) {
        setError('No autorizado');
        setLoading(false);
        return;
      }
      setToken(t);
      fetchPlanes(t);
      fetchSocios(t);
    }
  }, []);

  async function fetchPlanes(token: string) {
    try {
      const res = await fetch('/api/planes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar planes');
      const data = await res.json();
      setPlanes(data);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function fetchSocios(token: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/socios', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar socios');
      const data = await res.json();
      setSocios(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(socio: Socio) {
    setEditDocumento(socio.documento);
    setEditNombre(socio.nombreCompleto);
    setEditFechaNacimiento(socio.fechaNacimiento.split('T')[0]);
    setEditTelefono(socio.telefono);
    setEditEmail(socio.email || '');
    setEditDireccion(socio.direccion || '');
    setEditContactoEmergencia(socio.contactoEmergencia);
    setEditPlanId(socio.planId);
    setEditActivo(socio.activo);
    setEditFechaAlta(socio.fechaAlta.split('T')[0]);
    setIsEditing(true);
  }

  function resetForm() {
    setEditDocumento('');
    setEditNombre('');
    setEditFechaNacimiento('');
    setEditTelefono('');
    setEditEmail('');
    setEditDireccion('');
    setEditContactoEmergencia('');
    setEditPlanId('');
    setEditActivo(true);
    setEditFechaAlta('');
    setIsEditing(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return alert('No autorizado');

    if (
      !editDocumento ||
      !editNombre ||
      !editFechaNacimiento ||
      !editTelefono ||
      !editContactoEmergencia ||
      !editPlanId ||
      !editFechaAlta
    ) {
      return alert('Completa los campos obligatorios');
    }

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = '/api/socios' + (isEditing ? `?documento=${editDocumento}` : '');

      const body = {
        documento: editDocumento,
        nombreCompleto: editNombre,
        fechaNacimiento: editFechaNacimiento,
        telefono: editTelefono,
        email: editEmail,
        direccion: editDireccion,
        contactoEmergencia: editContactoEmergencia,
        planId: editPlanId,
        activo: editActivo,
        fechaAlta: editFechaAlta,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error en la operación');
      }

      resetForm();
      fetchSocios(token);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function handleDelete(documento: string) {
    if (!token) return;
    if (!confirm('¿Querés eliminar este socio?')) return;

    try {
      const res = await fetch(`/api/socios?documento=${documento}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al eliminar socio');
      }

      fetchSocios(token);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  // Filtrar socios para tabla según búsqueda (documento o nombre)
  const sociosFiltrados = socios.filter(
    (s) =>
      s.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para estilo input según foco
  function getInputStyle(name: string) {
    return inputFocus[name]
      ? { ...baseInputStyle, borderColor: '#FF6B00' }
      : baseInputStyle;
  }

  // Función para estilo botón según hover
  function getButtonStyle(name: string, baseColor: string) {
    return btnHover[name]
      ? { ...buttonBaseStyle, backgroundColor: darkenColor(baseColor, 20) }
      : { ...buttonBaseStyle, backgroundColor: baseColor };
  }

  if (loading) return <p style={{ color: '#FFD700' }}>Cargando socios...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh'}}>
    <div style={containerStyle}>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Gestión de Socios</h1>

        {/* FORMULARIO EN RECUADRO */}
        <div style={boxStyle}>
          <form onSubmit={handleSubmit}>
            <div style={formGridStyle}>
              <label style={labelStyle}>
                Documento*:
                <input
                  type="text"
                  value={editDocumento}
                  onChange={(e) => setEditDocumento(e.target.value)}
                  disabled={isEditing}
                  style={getInputStyle('documento')}
                  required
                  onFocus={() => setInputFocus((v) => ({ ...v, documento: true }))}
                  onBlur={() => setInputFocus((v) => ({ ...v, documento: false }))}
                />
              </label>

              <label style={labelStyle}>
                Nombre completo*:
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  style={getInputStyle('nombre')}
                  required
                  onFocus={() => setInputFocus((v) => ({ ...v, nombre: true }))}
                  onBlur={() => setInputFocus((v) => ({ ...v, nombre: false }))}
                />
              </label>

              <label style={labelStyle}>
                Fecha de nacimiento*:
                <input
                  type="date"
                  value={editFechaNacimiento}
                  onChange={(e) => setEditFechaNacimiento(e.target.value)}
                  style={getInputStyle('fechaNacimiento')}
                  required
                  onFocus={() => setInputFocus((v) => ({ ...v, fechaNacimiento: true }))}
                  onBlur={() => setInputFocus((v) => ({ ...v, fechaNacimiento: false }))}
                />
              </label>

              <label style={labelStyle}>
                Teléfono*:
                <input
                  type="tel"
                  value={editTelefono}
                  onChange={(e) => setEditTelefono(e.target.value)}
                  style={getInputStyle('telefono')}
                  required
                  onFocus={() => setInputFocus((v) => ({ ...v, telefono: true }))}
                  onBlur={() => setInputFocus((v) => ({ ...v, telefono: false }))}
                />
              </label>

              <label style={labelStyle}>
                Email:
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={getInputStyle('email')}
                  onFocus={() => setInputFocus((v) => ({ ...v, email: true }))}
                  onBlur={() => setInputFocus((v) => ({ ...v, email: false }))}
                />
              </label>

              <label style={labelStyle}>
                Dirección:
                <input
                  type="text"
                  value={editDireccion}
                  onChange={(e) => setEditDireccion(e.target.value)}
                  style={getInputStyle('direccion')}
                  onFocus={() => setInputFocus((v) => ({ ...v, direccion: true }))}
                  onBlur={() => setInputFocus((v) => ({ ...v, direccion: false }))}
                />
              </label>

              <label style={labelStyle}>
                Contacto de emergencia*:
                <input
                  type="text"
                  value={editContactoEmergencia}
                  onChange={(e) => setEditContactoEmergencia(e.target.value)}
                  style={getInputStyle('contactoEmergencia')}
                  required
                  onFocus={() => setInputFocus((v) => ({ ...v, contactoEmergencia: true }))}
                  onBlur={() => setInputFocus((v) => ({ ...v, contactoEmergencia: false }))}
                />
              </label>

              <label style={labelStyle}>
                Plan*:
                <select
                  value={editPlanId}
                  onChange={(e) => setEditPlanId(e.target.value)}
                  style={getInputStyle('plan')}
                  required
                  onFocus={() => setInputFocus((v) => ({ ...v, plan: true }))}
                  onBlur={() => setInputFocus((v) => ({ ...v, plan: false }))}
                >
                  <option value="">Seleccionar plan</option>
                  {planes.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label
                style={{
                  ...labelStyle,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 500,
                }}
              >
                <input
                  type="checkbox"
                  checked={editActivo}
                  onChange={(e) => setEditActivo(e.target.checked)}
                  style={{ width: 'auto', marginBottom: 0, cursor: 'pointer' }}
                />
                Activo
              </label>

              <label style={labelStyle}>
                Fecha de alta*:
                <input
                  type="date"
                  value={editFechaAlta}
                  onChange={(e) => setEditFechaAlta(e.target.value)}
                  style={getInputStyle('fechaAlta')}
                  required
                  onFocus={() => setInputFocus((v) => ({ ...v, fechaAlta: true }))}
                  onBlur={() => setInputFocus((v) => ({ ...v, fechaAlta: false }))}
                />
              </label>
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                type="submit"
                style={getButtonStyle('submit', '#FF6B00')}
                onMouseEnter={() => setBtnHover((v) => ({ ...v, submit: true }))}
                onMouseLeave={() => setBtnHover((v) => ({ ...v, submit: false }))}
              >
                {isEditing ? 'Guardar Cambios' : 'Registrar Socio'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={getButtonStyle('cancel', '#888888')}
                  onMouseEnter={() => setBtnHover((v) => ({ ...v, cancel: true }))}
                  onMouseLeave={() => setBtnHover((v) => ({ ...v, cancel: false }))}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* BUSCADOR Y LISTADO EN OTRO RECUADRO */}
        <div style={boxStyle}>
          <input
            type="text"
            placeholder="Buscar socio por nombre o documento"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...baseInputStyle, maxWidth: 400, marginBottom: 20 }}
            onFocus={() => setInputFocus((v) => ({ ...v, search: true }))}
            onBlur={() => setInputFocus((v) => ({ ...v, search: false }))}
          />

          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Documento</th>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Teléfono</th>
                  <th style={thStyle}>Plan</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sociosFiltrados.map((socio) => (
                  <tr
                    key={socio.documento}
                    style={rowHover === socio.documento ? { backgroundColor: '#333' } : undefined}
                    onMouseEnter={() => setRowHover(socio.documento)}
                    onMouseLeave={() => setRowHover(null)}
                  >
                    <td style={tdStyle}>{socio.documento}</td>
                    <td style={tdStyle}>{socio.nombreCompleto}</td>
                    <td style={tdStyle}>{socio.telefono}</td>
                    <td style={tdStyle}>
                      {planes.find((p) => p._id === socio.planId)?.nombre || 'N/A'}
                    </td>
                    <td style={tdStyle}>{socio.activo ? '✅ Activo' : '⛔ Inactivo'}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => startEdit(socio)}
                        style={getButtonStyle(socio.documento + '_edit', '#FF6B00')}
                        onMouseEnter={() =>
                          setBtnHover((v) => ({ ...v, [socio.documento + '_edit']: true }))
                        }
                        onMouseLeave={() =>
                          setBtnHover((v) => ({ ...v, [socio.documento + '_edit']: false }))
                        }
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(socio.documento)}
                        style={getButtonStyle(socio.documento + '_delete', '#FF4040')}
                        onMouseEnter={() =>
                          setBtnHover((v) => ({ ...v, [socio.documento + '_delete']: true }))
                        }
                        onMouseLeave={() =>
                          setBtnHover((v) => ({ ...v, [socio.documento + '_delete']: false }))
                        }
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {sociosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#AAA' }}>
                      No se encontraron socios que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
