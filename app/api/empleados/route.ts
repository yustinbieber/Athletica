import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Empleado from '@/models/Empleado';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const gymId = searchParams.get('gymId');

  if (!gymId) {
    return NextResponse.json({ error: 'gymId requerido' }, { status: 400 });
  }

  try {
    const empleados = await Empleado.find({ gymId });
    return NextResponse.json(empleados);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    return NextResponse.json({ error: 'Error al obtener empleados' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const data = await req.json();
    if (!data.nombreCompleto || !data.gymId) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const nuevoEmpleado = await Empleado.create({
      nombreCompleto: data.nombreCompleto,
      email: data.email || '',
      telefono: data.telefono || '',
      puesto: data.puesto || '',
      activo: true,
      gymId: data.gymId,
    });
    return NextResponse.json(nuevoEmpleado, { status: 201 });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    return NextResponse.json({ error: 'Error al crear empleado' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  try {
    const data = await req.json();
    if (!data._id) {
      return NextResponse.json({ error: 'ID requerido para actualizar' }, { status: 400 });
    }

    const empleadoActualizado = await Empleado.findByIdAndUpdate(
      data._id,
      {
        nombreCompleto: data.nombreCompleto,
        email: data.email || '',
        telefono: data.telefono || '',
        puesto: data.puesto || '',
        activo: data.activo ?? true,
      },
      { new: true }
    );

    if (!empleadoActualizado) {
      return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 });
    }

    return NextResponse.json(empleadoActualizado);
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    return NextResponse.json({ error: 'Error al actualizar empleado' }, { status: 500 });
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

    const eliminado = await Empleado.findByIdAndDelete(id);
    if (!eliminado) {
      return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Empleado eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    return NextResponse.json({ error: 'Error al eliminar empleado' }, { status: 500 });
  }
}
