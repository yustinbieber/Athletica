import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Rutina from '@/models/Rutina';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET as string;

function verifyToken(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await dbConnect();

  try {
    // Cast user to any para poder acceder a gymId
    const userPayload = user as any;
    const rutinas = await Rutina.find({ gymId: userPayload.gymId }).sort({ createdAt: -1 });
    return NextResponse.json(rutinas);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al obtener rutinas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await dbConnect();
  const data = await req.json();

  if (!data.nombre || !Array.isArray(data.dias)) {
    return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
  }

  try {
    const userPayload = user as any;

    const nuevaRutina = await Rutina.create({
      gymId: userPayload.gymId,
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      dias: data.dias,
    });

    return NextResponse.json(nuevaRutina, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al crear rutina' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await dbConnect();
  const data = await req.json();

  if (!data._id || !data.nombre || !Array.isArray(data.dias)) {
    return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
  }

  try {
    const userPayload = user as any;

    const rutina = await Rutina.findOneAndUpdate(
      { _id: data._id, gymId: userPayload.gymId },
      {
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        dias: data.dias,
      },
      { new: true }
    );

    if (!rutina) return NextResponse.json({ error: 'Rutina no encontrada' }, { status: 404 });

    return NextResponse.json(rutina);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al actualizar rutina' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  try {
    const userPayload = user as any;

    const rutina = await Rutina.findOneAndDelete({ _id: id, gymId: userPayload.gymId });
    if (!rutina) return NextResponse.json({ error: 'Rutina no encontrada' }, { status: 404 });

    return NextResponse.json({ message: 'Rutina eliminada correctamente' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al eliminar rutina' }, { status: 500 });
  }
}
