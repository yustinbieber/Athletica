import mongoose, { Schema, model, models } from 'mongoose';

const empleadoSchema = new Schema({
  nombreCompleto: { type: String, required: true },
  email: { type: String, required: false },
  telefono: { type: String, required: false },
  puesto: { type: String, required: false },
  activo: { type: Boolean, default: true },
  gymId: { type: String, required: true }, // Asociar empleado al gimnasio
  empleadoId: { type: String, required: true },
});

const Empleado = models.Empleado || model('Empleado', empleadoSchema);
export default Empleado;
