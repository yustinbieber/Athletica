// models/Mercaderia.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMercaderia extends Document {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria: string;
  gymId: string; // Para asociar a gimnasio
}

const MercaderiaSchema = new Schema<IMercaderia>({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true },
  categoria: { type: String, required: true },
  gymId: { type: String, required: true },
});

export default mongoose.models.Mercaderia || mongoose.model<IMercaderia>('Mercaderia', MercaderiaSchema);
