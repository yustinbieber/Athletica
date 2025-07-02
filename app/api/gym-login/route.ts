// /api/gym-login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GymUser from '@/models/Gimnasio';
import Empleado from '@/models/Empleado';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { username, email, password, rol } = await req.json();

    if (!password || !rol) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    let user: any = null;

    if (rol === 'admin') {
      if (!username) return NextResponse.json({ error: 'Falta el username' }, { status: 400 });
      user = await GymUser.findOne({ username });
    } else if (rol === 'empleado') {
      if (!email) return NextResponse.json({ error: 'Falta el email' }, { status: 400 });
      user = await Empleado.findOne({ email });
    } else {
      return NextResponse.json({ error: 'Rol no válido' }, { status: 400 });
    }

    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    if (!user.activo) return NextResponse.json({ error: 'Cuenta inactiva' }, { status: 403 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });

    let tokenPayload: any = {
      id: user._id,
      rol,
    };

    if (rol === 'admin') {
      tokenPayload = {
        ...tokenPayload,
        username: user.username,
        gymName: user.gymName,
        gymId: user._id.toString(),
      };
    } else if (rol === 'empleado') {
      // Buscar gimnasio para obtener gymName
      const gimnasio = await GymUser.findById(user.gymId);
      if (!gimnasio) return NextResponse.json({ error: 'Gimnasio no encontrado' }, { status: 404 });

      tokenPayload = {
        ...tokenPayload,
        email: user.email,
        nombreCompleto: user.nombreCompleto,
        gymId: user.gymId,
        gymName: gimnasio.gymName, // 👈 este campo es el que necesitás
        empleadoId: user.empleadoId,
      };
    }

    const token = jwt.sign(tokenPayload, SECRET, { expiresIn: '24h' });

    return NextResponse.json({ token });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error en login:', error.message);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
