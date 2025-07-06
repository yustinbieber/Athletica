'use client';

import { useEffect, useState } from 'react';
import { differenceInDays, isThisMonth, parseISO } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Socio {
  _id: string;
  nombreCompleto: string;
  fechaAlta: string;
  activo: boolean;
  planId: string;
  documento: string;
  telefono?: string;
}

interface Plan {
  _id: string;
  nombre: string;
  duracionDias?: number;
}

interface Movimiento {
  _id: string;
  tipo: 'ingreso' | 'egreso';
  monto: number;
  fecha: string;
}

interface DashboardContentProps {
  gymName: string;
  gymId: string;
  token: string;
}

export default function DashboardContent({ gymName, gymId, token }: DashboardContentProps) {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  useEffect(() => {
    const fetchDatos = async () => {
      if (!token || !gymId) {
        console.error('Falta token o gymId para cargar datos');
        return;
      }

      try {
        const [sociosRes, movsRes, planesRes] = await Promise.all([
          fetch(`/api/socios?gymId=${gymId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/movimientos?gymId=${gymId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/planes?gymId=${gymId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!sociosRes.ok) {
          console.error('Error al cargar socios', await sociosRes.text());
          return;
        }
        if (!movsRes.ok) {
          console.error('Error al cargar movimientos', await movsRes.text());
          return;
        }
        if (!planesRes.ok) {
          console.error('Error al cargar planes', await planesRes.text());
          return;
        }

        const sociosDataRaw = await sociosRes.json();
        const movsDataRaw = await movsRes.json();
        const planesDataRaw = await planesRes.json();

        setSocios(Array.isArray(sociosDataRaw) ? sociosDataRaw : sociosDataRaw.data || []);
        setMovimientos(Array.isArray(movsDataRaw) ? movsDataRaw : movsDataRaw.data || []);
        setPlanes(Array.isArray(planesDataRaw) ? planesDataRaw : planesDataRaw.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDatos();
  }, [gymId, token]);

  // Calcular fecha vencimiento (fechaAlta + duracion del plan)
  const calcularVencimiento = (socio: Socio) => {
    const plan = planes.find((p) => p._id === socio.planId);
    if (!plan?.duracionDias) return null;
    const fechaAlta = new Date(socio.fechaAlta);
    return new Date(fechaAlta.getTime() + plan.duracionDias * 86400000);
  };

  const hoy = new Date();
  const en7dias = new Date();
  en7dias.setDate(hoy.getDate() + 7);

  const totalSociosActivos = socios.filter((s) => s.activo).length;

  const sociosPorVencer = socios.filter((s) => {
    const vencimiento = calcularVencimiento(s);
    return vencimiento && vencimiento > hoy && vencimiento <= en7dias;
  });

  const altasEsteMes = socios.filter((s) => s.fechaAlta && isThisMonth(parseISO(s.fechaAlta))).length;

  const ingresosMes = movimientos
    .filter((m) => m.tipo === 'ingreso' && isThisMonth(parseISO(m.fecha)))
    .reduce((acc, cur) => acc + cur.monto, 0);

  const egresosMes = movimientos
    .filter((m) => m.tipo === 'egreso' && isThisMonth(parseISO(m.fecha)))
    .reduce((acc, cur) => acc + cur.monto, 0);

  const generarResumenMensual = () => {
    const meses: { [mes: string]: { altas: number; ingresos: number; egresos: number } } = {};

    for (let i = 0; i < 6; i++) {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - i);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      meses[key] = { altas: 0, ingresos: 0, egresos: 0 };
    }

    socios.forEach((s) => {
      if (s.fechaAlta) {
        const fecha = new Date(s.fechaAlta);
        const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        if (meses[key]) meses[key].altas += 1;
      }
    });

    movimientos.forEach((m) => {
      const fecha = new Date(m.fecha);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      if (meses[key]) {
        if (m.tipo === 'ingreso') meses[key].ingresos += m.monto;
        else meses[key].egresos += m.monto;
      }
    });

    return Object.entries(meses)
      .map(([mes, valores]) => ({
        mes,
        ...valores,
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  };

  const datosGrafico = generarResumenMensual();

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-card green">
          <h3>Socios activos</h3>
          <p>{totalSociosActivos}</p>
        </div>
        <div className="dashboard-card yellow">
          <h3>Por vencer (7 días)</h3>
          <p>{sociosPorVencer.length}</p>
        </div>
        <div className="dashboard-card blue">
          <h3>Altas este mes</h3>
          <p>{altasEsteMes}</p>
        </div>
        <div className="dashboard-card emerald">
          <h3>Ingresos del mes</h3>
          <p>${ingresosMes}</p>
        </div>
        <div className="dashboard-card red">
          <h3>Egresos del mes</h3>
          <p>${egresosMes}</p>
        </div>
      </div>

      <section style={{ padding: '0 20px' }}>
        <h2 style={{ color: '#FFD700', marginBottom: 16 }}>Últimos 5 socios registrados</h2>
        <table style={tablaEstilo}>
          <thead>
            <tr>
              <th style={thEstilo}>Nombre completo</th>
              <th style={thEstilo}>Fecha de alta</th>
            </tr>
          </thead>
          <tbody>
            {socios.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ padding: 20, textAlign: 'center', color: '#FFD700' }}>
                  No hay socios registrados
                </td>
              </tr>
            ) : (
              socios
                .filter((s) => !!s.fechaAlta)
                .sort((a, b) => new Date(b.fechaAlta).getTime() - new Date(a.fechaAlta).getTime())
                .slice(0, 5)
                .map((socio) => (
                  <tr key={socio._id}>
                    <td style={tdEstilo}>{socio.nombreCompleto}</td>
                    <td style={tdEstilo}>{new Date(socio.fechaAlta).toLocaleDateString()}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </section>

      <div className="grafico-container">
        <h2>Evolución mensual (últimos 6 meses)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datosGrafico} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="altas" stroke="#3498db" name="Altas" strokeWidth={2} />
            <Line type="monotone" dataKey="ingresos" stroke="#2ecc71" name="Ingresos" strokeWidth={2} />
            <Line type="monotone" dataKey="egresos" stroke="#e74c3c" name="Egresos" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <style jsx>{`
        .dashboard-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          padding: 20px;
        }

        .dashboard-card {
          padding: 20px;
          border-radius: 12px;
          color: white;
          font-family: sans-serif;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          text-align: center;
        }

        .dashboard-card h3 {
          font-size: 16px;
          margin-bottom: 10px;
        }

        .dashboard-card p {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }

        .green {
          background-color: #2ecc71;
        }

        .yellow {
          background-color: #f1c40f;
          color: #000;
        }

        .blue {
          background-color: #3498db;
        }

        .emerald {
          background-color: #1abc9c;
        }

        .red {
          background-color: #e74c3c;
        }

        .grafico-container {
          padding: 0 20px 40px 20px;
          font-family: sans-serif;
        }

        .grafico-container h2 {
          margin: 30px 0 10px;
          font-size: 18px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background-color: #1E1E1E;
          border-radius: 8px;
          overflow: hidden;
        }

        th,
        td {
          padding: 12px;
          border-bottom: 1px solid #333;
          color: white;
        }

        th {
          background-color: #333;
          color: #FFD700;
          font-weight: bold;
          text-align: left;
        }

        tr:hover {
          background-color: #333;
        }
      `}</style>
    </>
  );
}

const tablaEstilo: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#1E1E1E',
  borderRadius: 8,
  overflow: 'hidden',
};

const thEstilo: React.CSSProperties = {
  padding: '12px',
  backgroundColor: '#333',
  color: '#FFD700',
  fontWeight: 'bold',
  textAlign: 'left',
};

const tdEstilo: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid #333',
  color: 'white',
};
