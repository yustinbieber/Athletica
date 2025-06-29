import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionDias: number;
  gymId: string; // Relaciona el plan con el gimnasio
}

const PlanSchema = new Schema<IPlan>({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  precio: { type: Number, required: true },
  duracionDias: { type: Number, required: true },
  gymId: { type: String, required: true },
});

export default mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);
