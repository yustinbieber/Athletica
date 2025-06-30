// app/api/dashboard/route.ts
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
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await dbConnect();

  const totalGimnasios = await Gimnasio.countDocuments();
  const activos = await Gimnasio.countDocuments({ activo: true });

  return NextResponse.json({ totalGimnasios, activos });
}
