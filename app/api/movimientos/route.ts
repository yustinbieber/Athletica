import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Movimiento from '@/models/Movimiento';

interface MovimientoFiltro {
  gymId: string;
  tipo?: string;
  socioId?: string;
  fecha?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const gymId = searchParams.get('gymId');
  if (!gymId) return NextResponse.json({ error: 'gymId requerido' }, { status: 400 });

  // Filtros opcionales
  const tipo = searchParams.get('tipo'); // 'ingreso' o 'egreso'
  const socioId = searchParams.get('socioId');
  const fechaDesde = searchParams.get('fechaDesde');
  const fechaHasta = searchParams.get('fechaHasta');

  try {
    const filtro: MovimientoFiltro = { gymId };

    if (tipo) filtro.tipo = tipo;
    if (socioId) filtro.socioId = socioId;

    if (fechaDesde || fechaHasta) {
      filtro.fecha = {};
      if (fechaDesde) {
        const fechaGte = new Date(fechaDesde);
        if (!isNaN(fechaGte.getTime())) filtro.fecha.$gte = fechaGte;
      }
      if (fechaHasta) {
        const fechaLte = new Date(fechaHasta);
        if (!isNaN(fechaLte.getTime())) filtro.fecha.$lte = fechaLte;
      }
    }

    const movimientos = await Movimiento.find(filtro).sort({ fecha: -1 });
    return NextResponse.json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    return NextResponse.json({ error: 'Error al obtener movimientos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const data = await req.json();
    const { tipo, descripcion, monto, fecha, socioId, empleadoId, gymId } = data;

    if (!tipo || !descripcion || monto == null || !empleadoId || !gymId) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const nuevoMovimiento = await Movimiento.create({
      tipo,
      descripcion,
      monto,
      fecha: fecha ? new Date(fecha) : new Date(),
      socioId: socioId || null,
      empleadoId,
      gymId,
    });

    return NextResponse.json(nuevoMovimiento, { status: 201 });
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    return NextResponse.json({ error: 'Error al crear movimiento' }, { status: 500 });
  }
}
