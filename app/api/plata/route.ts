import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Movimiento from '@/models/Movimiento';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || '');
    const body = await req.json();

    const nuevoMovimiento = new Movimiento({
      tipo: 'ingreso',
      descripcion: body.descripcion,
      monto: body.monto,
      fecha: new Date(),
      socioId: body.socioId || '',
      empleadoId: decoded.id, // o body.empleadoId si lo mandás desde frontend
      gymId: decoded.gymId,
    });

    await nuevoMovimiento.save();

    return NextResponse.json({ message: 'Pago registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar movimiento:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
