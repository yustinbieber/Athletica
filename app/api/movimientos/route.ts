// app/api/movimientos/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Movimiento from '@/models/Movimiento';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'tu_secreto_aqui';

function verificarToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No autorizado');
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET_KEY) as { rol: string; gymId: string; empleadoId: string };
    return payload;
  } catch {
    throw new Error('Token inválido');
  }
}

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
    const payload = verificarToken(req);
    // Solo admin o empleado pueden crear movimientos
    if (!['admin', 'empleado'].includes(payload.rol)) {
      return NextResponse.json({ error: 'No tienes permiso para crear movimientos' }, { status: 403 });
    }

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
    return NextResponse.json({ error: (error as Error).message || 'Error al crear movimiento' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  try {
    const payload = verificarToken(req);
    if (payload.rol !== 'admin') {
      return NextResponse.json({ error: 'No tienes permiso para modificar movimientos' }, { status: 403 });
    }

    const data = await req.json();
    const { id, descripcion, monto, tipo, socioId } = data;

    if (!id) {
      return NextResponse.json({ error: 'ID de movimiento requerido' }, { status: 400 });
    }

    const movimiento = await Movimiento.findById(id);
    if (!movimiento) {
      return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 });
    }

    movimiento.descripcion = descripcion ?? movimiento.descripcion;
    movimiento.monto = monto ?? movimiento.monto;
    movimiento.tipo = tipo ?? movimiento.tipo;
    movimiento.socioId = socioId ?? movimiento.socioId;

    await movimiento.save();

    return NextResponse.json(movimiento);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Error al actualizar movimiento' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    const payload = verificarToken(req);
    if (payload.rol !== 'admin') {
      return NextResponse.json({ error: 'No tienes permiso para eliminar movimientos' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de movimiento requerido' }, { status: 400 });
    }

    const movimiento = await Movimiento.findById(id);
    if (!movimiento) {
      return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 });
    }

    await movimiento.deleteOne();

    return NextResponse.json({ message: 'Movimiento eliminado' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Error al eliminar movimiento' }, { status: 500 });
  }
}
