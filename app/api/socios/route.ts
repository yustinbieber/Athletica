import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Socio from '@/models/Socio';
import jwt from 'jsonwebtoken';
import Plan from '@/models/Plan';

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
      const { searchParams } = new URL(req.url);
      const documento = searchParams.get('documento');
  
      if (documento) {
        // Buscar solo ese socio
        const socio = await Socio.findOne({ documento });
        if (!socio) return NextResponse.json(null);
  
        const plan = await Plan.findById(socio.planId);
        const duracionDias = plan?.duracionDias || 30;
  
        // Calcular fecha de vencimiento
        const fechaAlta = new Date(socio.fechaAlta);
        const fechaVencimiento = new Date(fechaAlta.getTime() + duracionDias * 24 * 60 * 60 * 1000);
        const hoy = new Date();
  
        // Calcular si está activo (fecha actual <= fecha vencimiento)
        const activoCalculado = hoy <= fechaVencimiento;
  
        // Si el estado activo guardado difiere del calculado, actualizarlo en BD
        if (socio.activo !== activoCalculado) {
          socio.activo = activoCalculado;
          await socio.save();
        }
  
        return NextResponse.json({
          documento: socio.documento,
          nombreCompleto: socio.nombreCompleto,
          planNombre: plan?.nombre || 'N/A',
          planDuracionDias: duracionDias,
          fechaAlta: socio.fechaAlta,
          activo: socio.activo,
          fotoUrl: socio.fotoUrl || null,
        });
      }
  
      // Si no hay documento, devolver todos los socios (sin recalcular activo)
      const socios = await Socio.find();
      return NextResponse.json(socios);
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Error al obtener socios' }, { status: 500 });
    }
  }
  

export async function POST(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await dbConnect();
  const data = await req.json();

  if (
    !data.documento ||
    !data.nombreCompleto ||
    !data.fechaNacimiento ||
    !data.telefono ||
    !data.contactoEmergencia ||
    !data.planId ||
    !data.fechaAlta
  ) {
    return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
  }

  try {
    const exists = await Socio.findOne({ documento: data.documento });
    if (exists) return NextResponse.json({ error: 'Documento ya registrado' }, { status: 409 });

    const nuevoSocio = await Socio.create({
      documento: data.documento,
      nombreCompleto: data.nombreCompleto,
      fechaNacimiento: new Date(data.fechaNacimiento),
      telefono: data.telefono,
      email: data.email || '',
      direccion: data.direccion || '',
      contactoEmergencia: data.contactoEmergencia,
      planId: data.planId,
      activo: data.activo !== undefined ? data.activo : true,
      fechaAlta: new Date(data.fechaAlta),
    });
    return NextResponse.json(nuevoSocio, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al crear socio' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await dbConnect();
  const data = await req.json();

  if (
    !data.documento ||
    !data.nombreCompleto ||
    !data.fechaNacimiento ||
    !data.telefono ||
    !data.contactoEmergencia ||
    !data.planId ||
    !data.fechaAlta
  ) {
    return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
  }

  try {
    const socio = await Socio.findOneAndUpdate(
      { documento: data.documento },
      {
        nombreCompleto: data.nombreCompleto,
        fechaNacimiento: new Date(data.fechaNacimiento),
        telefono: data.telefono,
        email: data.email || '',
        direccion: data.direccion || '',
        contactoEmergencia: data.contactoEmergencia,
        planId: data.planId,
        activo: data.activo !== undefined ? data.activo : true,
        fechaAlta: new Date(data.fechaAlta),
      },
      { new: true }
    );
    if (!socio) return NextResponse.json({ error: 'Socio no encontrado' }, { status: 404 });
    return NextResponse.json(socio);
  } catch {
    return NextResponse.json({ error: 'Error al actualizar socio' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const documento = searchParams.get('documento');

  if (!documento) return NextResponse.json({ error: 'Documento requerido' }, { status: 400 });

  try {
    const socio = await Socio.findOneAndDelete({ documento });
    if (!socio) return NextResponse.json({ error: 'Socio no encontrado' }, { status: 404 });
    return NextResponse.json({ message: 'Socio eliminado correctamente' });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar socio' }, { status: 500 });
  }
}
