'use client';

import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

interface Socio {
  documento: string;
  nombreCompleto: string;
  telefono: string;
  fechaAlta: string;
  planId: string;
}

interface Plan {
  _id: string;
  nombre: string;
  duracionDias?: number;
}

export default function PorVencerContent() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlanId, setFilterPlanId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('gymToken');
    if (!token) return;

    fetch('/api/socios', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setSocios)
      .catch(console.error);

    fetch('/api/planes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setPlanes)
      .catch(console.error);
  }, []);

  const calcularVencimiento = (socio: Socio) => {
    const plan = planes.find((p) => p._id === socio.planId);
    if (!plan?.duracionDias) return null;
    const fechaAlta = new Date(socio.fechaAlta);
    return new Date(fechaAlta.getTime() + plan.duracionDias * 86400000);
  };

  const hoy = new Date();
  const en7dias = new Date();
  en7dias.setDate(hoy.getDate() + 7);

  const sociosPorVencer = socios.filter((s) => {
    const vencimiento = calcularVencimiento(s);
    return vencimiento && vencimiento > hoy && vencimiento <= en7dias;
  });

  const sociosFiltrados = sociosPorVencer.filter((s) => {
    const matchesSearch =
      s.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.documento.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan = filterPlanId === '' || s.planId === filterPlanId;

    return matchesSearch && matchesPlan;
  });

  // Función para exportar a Excel
  const exportarExcel = () => {
    // Crear array con los datos a exportar
    const datosExcel = sociosFiltrados.map((socio) => {
      const vencimiento = calcularVencimiento(socio);
      const planNombre = planes.find((p) => p._id === socio.planId)?.nombre || 'Sin plan';
      return {
        Documento: socio.documento,
        Nombre: socio.nombreCompleto,
        Teléfono: socio.telefono,
        Plan: planNombre,
        Vencimiento: vencimiento ? vencimiento.toLocaleDateString() : '-',
      };
    });

    // Crear libro y hoja
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Socios por Vencer');

    // Exportar archivo
    XLSX.writeFile(wb, 'Socios_Por_Vencer.xlsx');
  };

  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, marginBottom: 24, color: '#FFD700' }}>Socios por Vencer</h1>

        <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o documento"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px',
              backgroundColor: '#2C2C2C',
              color: '#FFFFFF',
              border: '1px solid #444',
              borderRadius: '4px',
              fontSize: '1rem',
              width: '100%',
              maxWidth: '400px',
            }}
          />

          <select
            value={filterPlanId}
            onChange={(e) => setFilterPlanId(e.target.value)}
            style={{
              padding: '8px',
              backgroundColor: '#2C2C2C',
              color: '#FFF',
              border: '1px solid #444',
              borderRadius: '4px',
              fontSize: '1rem',
              maxWidth: '250px',
            }}
          >
            <option value="">Todos los planes</option>
            {planes.map((plan) => (
              <option key={plan._id} value={plan._id}>
                {plan.nombre}
              </option>
            ))}
          </select>

          <button
            onClick={exportarExcel}
            style={{
              padding: '10px 16px',
              backgroundColor: '#FF6B00',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 8px rgba(255,107,0,0.6)',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e65a00')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF6B00')}
          >
            Exportar a Excel
          </button>
        </div>

        <div
          style={{
            backgroundColor: '#1E1E1E',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(255, 107, 0, 0.2)',
            padding: '20px',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '16px',
              backgroundColor: '#1E1E1E',
            }}
          >
            <thead>
              <tr>
                <th style={th}>Documento</th>
                <th style={th}>Nombre</th>
                <th style={th}>Teléfono</th>
                <th style={th}>Plan</th>
                <th style={th}>Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {sociosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#FFD700' }}>
                    No hay socios próximos a vencer
                  </td>
                </tr>
              ) : (
                sociosFiltrados.map((socio) => {
                  const vencimiento = calcularVencimiento(socio);
                  return (
                    <tr key={socio.documento}>
                      <td style={td}>{socio.documento}</td>
                      <td style={td}>{socio.nombreCompleto}</td>
                      <td style={td}>{socio.telefono}</td>
                      <td style={td}>
                        {planes.find((p) => p._id === socio.planId)?.nombre || 'Sin plan'}
                      </td>
                      <td style={td}>{vencimiento?.toLocaleDateString() || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const th = {
  padding: '12px',
  backgroundColor: '#1E1E1E',
  color: '#FFD700',
  textAlign: 'left' as const,
  borderBottom: '1px solid #333',
};

const td = {
  padding: '12px',
  borderBottom: '1px solid #333',
  color: '#FFFFFF',
};
