import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Gimnasio from '@/models/Gimnasio';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET as string;

function verifyToken(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, SECRET);
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error verificando token:', error.message);
    return null;
  }
}

export async function GET(req: Request) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await dbConnect();

    const totalGimnasios = await Gimnasio.countDocuments();
    const activos = await Gimnasio.countDocuments({ activo: true });

    return NextResponse.json({ totalGimnasios, activos });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error en GET /api/dashboard:', error.message);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
