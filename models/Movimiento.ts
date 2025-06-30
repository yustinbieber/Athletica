import mongoose, { Schema, model, models } from 'mongoose';

const movimientoSchema = new Schema({
  tipo: { type: String, enum: ['ingreso', 'egreso'], required: true },
  descripcion: { type: String, required: true },
  monto: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  socioId: { type: String, required: false },       // si está asociado a un socio
  empleadoId: { type: String, required: true },     // quien registró
  gymId: { type: String, required: true },
});

const Movimiento = models.Movimiento || model('Movimiento', movimientoSchema);
export default Movimiento;
