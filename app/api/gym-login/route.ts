// /app/api/gym-login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GymUser from '@/models/Gimnasio'; // tu modelo GymUser
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
  await dbConnect();
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username y password son requeridos' }, { status: 400 });
  }

  try {
    const gymUser = await GymUser.findOne({ username });
    if (!gymUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    if (!gymUser.activo) {
      return NextResponse.json({ error: 'Cuenta inactiva' }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, gymUser.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: gymUser._id,
        username: gymUser.username,
        gymName: gymUser.gymName,
      },
      SECRET,
      { expiresIn: '12h' }
    );

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
