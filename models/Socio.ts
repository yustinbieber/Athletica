import mongoose, { Schema, model, models } from 'mongoose';

const socioSchema = new Schema({
  documento: { type: String, required: true, unique: true },
  nombreCompleto: { type: String, required: true },
  fechaNacimiento: { type: Date, required: true },
  telefono: { type: String, required: true },
  email: { type: String },
  direccion: { type: String },
  contactoEmergencia: { type: String, required: true },
  planId: { type: String, required: true },
  activo: { type: Boolean, required: true, default: true },
  fechaAlta: { type: Date, required: true },

  // Campo nuevo: rutina asignada
  rutinaAsignada: { type: mongoose.Schema.Types.ObjectId, ref: 'Rutina', default: null },
});

const Socio = models.Socio || model('Socio', socioSchema);
export default Socio;
