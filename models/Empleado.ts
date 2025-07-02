import mongoose, { Schema, model, models } from 'mongoose';

// models/Empleado.ts
const empleadoSchema = new Schema({
  nombreCompleto: { type: String, required: true },
  email: String,
  telefono: String,
  puesto: String,
  activo: { type: Boolean, default: true },
  gymId: { type: String, required: true },
  empleadoId: { type: String, required: true },
  password: { type: String, required: true }, // asegúrate de tener esto
  rol: { type: String, default: 'empleado' }, // 👈 nuevo campo
});



const Empleado = models.Empleado || model('Empleado', empleadoSchema);
export default Empleado;
