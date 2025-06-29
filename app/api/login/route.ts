import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET as string;


export async function POST(req: NextRequest) {
    await dbConnect();
    const { email, password } = await req.json();
    console.log('Email recibido:', email);
  
    const admin = await Admin.findOne({ email });
    console.log('Admin encontrado:', admin);
  
    if (!admin) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }
  
    const valid = await bcrypt.compare(password, admin.password);
    console.log('Contraseña válida:', valid);
  
    if (!valid) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }
  
    const token = jwt.sign({ adminId: admin._id }, SECRET, { expiresIn: '1d' });
  
    return NextResponse.json({ token }, { status: 200 });
  }
  