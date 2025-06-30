import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Mercaderia from '@/models/Mercaderia';

export async function GET() {
  await dbConnect();
  try {
    const mercaderias = await Mercaderia.find();
    return NextResponse.json(mercaderias);
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error al obtener mercadería:', error.message);
    return NextResponse.json({ error: 'Error al obtener mercadería' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const data = await req.json();
    if (!data.nombre || !data.precioUnitario) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }
    const nuevaMercaderia = await Mercaderia.create({
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      stock: data.stock || 0,
      precioUnitario: data.precioUnitario,
    });
    return NextResponse.json(nuevaMercaderia, { status: 201 });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error al crear mercadería:', error.message);
    return NextResponse.json({ error: 'Error al crear mercadería' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  try {
    const data = await req.json();
    if (!data._id) {
      return NextResponse.json({ error: 'ID requerido para actualizar' }, { status: 400 });
    }

    const updateFields: Partial<typeof data> = {};
    if (data.nombre !== undefined) updateFields.nombre = data.nombre;
    if (data.descripcion !== undefined) updateFields.descripcion = data.descripcion;
    if (data.stock !== undefined) updateFields.stock = data.stock;
    if (data.precioUnitario !== undefined) updateFields.precioUnitario = data.precioUnitario;

    const mercaderiaActualizada = await Mercaderia.findByIdAndUpdate(
      data._id,
      updateFields,
      { new: true }
    );

    if (!mercaderiaActualizada) {
      return NextResponse.json({ error: 'Mercadería no encontrada' }, { status: 404 });
    }

    return NextResponse.json(mercaderiaActualizada);
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error al actualizar mercadería:', error.message);
    return NextResponse.json({ error: 'Error al actualizar mercadería' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID requerido para eliminar' }, { status: 400 });
    }

    const eliminado = await Mercaderia.findByIdAndDelete(id);
    if (!eliminado) {
      return NextResponse.json({ error: 'Mercadería no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Mercadería eliminada correctamente' });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error al eliminar mercadería:', error.message);
    return NextResponse.json({ error: 'Error al eliminar mercadería' }, { status: 500 });
  }
}
