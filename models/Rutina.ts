import mongoose, { Schema, model, Document } from 'mongoose';

interface Ejercicio {
  nombre: string;
  series: number;
  repeticiones: string;
  descanso: string;
}

interface DiaRutina {
  nombreDia: string;
  ejercicios: Ejercicio[];
}

export interface RutinaDoc extends Document {
  nombre: string;
  descripcion?: string;
  dias: DiaRutina[];
  gymId: string;
  creadoPor: string;
  createdAt: Date;
  updatedAt: Date;
}

const EjercicioSchema = new Schema<Ejercicio>({
  nombre: { type: String, required: true },
  series: { type: Number, required: true },
  repeticiones: { type: String, required: true },
  descanso: { type: String, required: true },
});

const DiaRutinaSchema = new Schema<DiaRutina>({
  nombreDia: { type: String, required: true },
  ejercicios: { type: [EjercicioSchema], default: [] },
});

const RutinaSchema = new Schema<RutinaDoc>(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String },
    dias: { type: [DiaRutinaSchema], default: [] },
    gymId: { type: String, required: true },
    creadoPor: { type: String, required: true },
  },
  { timestamps: true }
);

const RutinaModel = mongoose.models.Rutina || model<RutinaDoc>('Rutina', RutinaSchema);
export default RutinaModel;
