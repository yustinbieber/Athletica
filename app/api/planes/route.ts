import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Plan from '@/models/Plan';
import jwt from 'jsonwebtoken';

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
    console.error('Token verification failed:', error.message);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await dbConnect();

  try {
    const planes = await Plan.find();
    return NextResponse.json(planes);
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error fetching plans:', error.message);
    return NextResponse.json({ error: 'Error al obtener planes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await dbConnect();
  const data = await req.json();

  if (!data.nombre || data.precio == null || data.duracionDias == null) {
    return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
  }

  try {
    const nuevoPlan = await Plan.create({
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      precio: data.precio,
      duracionDias: data.duracionDias,
    });
    return NextResponse.json(nuevoPlan, { status: 201 });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error creating plan:', error.message);
    return NextResponse.json({ error: 'Error al crear plan' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await dbConnect();
  const data = await req.json();

  if (!data._id || !data.nombre || data.precio == null || data.duracionDias == null) {
    return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
  }

  try {
    const plan = await Plan.findByIdAndUpdate(
      data._id,
      {
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        precio: data.precio,
        duracionDias: data.duracionDias,
      },
      { new: true }
    );

    if (!plan) return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });

    return NextResponse.json(plan);
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error updating plan:', error.message);
    return NextResponse.json({ error: 'Error al actualizar plan' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID del plan requerido' }, { status: 400 });

  try {
    const plan = await Plan.findByIdAndDelete(id);
    if (!plan) return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });

    return NextResponse.json({ message: 'Plan eliminado correctamente' });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error deleting plan:', error.message);
    return NextResponse.json({ error: 'Error al eliminar plan' }, { status: 500 });
  }
}
