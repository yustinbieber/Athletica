import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Gimnasio from '@/models/Gimnasio';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const SECRET = process.env.JWT_SECRET as string;

function verifyToken(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    const decoded = jwt.verify(token, SECRET);
    return decoded;
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Token verification error:', error.message);
    return null;
  }
}

interface GimnasioUpdate {
  username?: string;
  gymName?: string;
  password?: string;
  activo?: boolean;
  rol?: string;
}

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await dbConnect();

  try {
    const gimnasios = await Gimnasio.find();
    return NextResponse.json(gimnasios);
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error al obtener gimnasios:', error.message);
    return NextResponse.json({ error: 'Error al obtener gimnasios' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await dbConnect();
  try {
    const data = await req.json();

    if (!data.password || !data.username || !data.gymName) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);

    // 👇 Agregar campo de rol por defecto
    const nuevoGimnasio = await Gimnasio.create({
      ...data,
      rol: 'admin',
      activo: true,
    });

    return NextResponse.json(nuevoGimnasio, { status: 201 });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error al crear el gimnasio:', error.message);
    return NextResponse.json({ error: 'Error al crear el gimnasio' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await dbConnect();

  try {
    const data = await req.json();
    const { _id, username, password, gymName, activo } = data;

    if (!_id) {
      return NextResponse.json({ error: 'ID del gimnasio requerido' }, { status: 400 });
    }

    const updateData: GimnasioUpdate = { username, gymName };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (typeof activo === 'boolean') updateData.activo = activo;

    const gimnasio = await Gimnasio.findByIdAndUpdate(_id, updateData, { new: true });

    if (!gimnasio) {
      return NextResponse.json({ error: 'Gimnasio no encontrado' }, { status: 404 });
    }

    return NextResponse.json(gimnasio);
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error al editar gimnasio:', error.message);
    return NextResponse.json({ error: 'Error al editar gimnasio' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID del gimnasio requerido' }, { status: 400 });
    }

    const gimnasio = await Gimnasio.findByIdAndDelete(id);

    if (!gimnasio) {
      return NextResponse.json({ error: 'Gimnasio no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Gimnasio eliminado correctamente' });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error al eliminar gimnasio:', error.message);
    return NextResponse.json({ error: 'Error al eliminar gimnasio' }, { status: 500 });
  }
}
