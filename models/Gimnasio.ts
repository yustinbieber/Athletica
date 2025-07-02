import mongoose, { Schema, Document } from 'mongoose';

export interface IGymUser extends Document {
  username: string;
  password: string;
  gymName: string;
  activo: boolean;
  rol: string;
}

// /models/Gimnasio.ts o GymUser.ts
const GymUserSchema = new Schema<IGymUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gymName: { type: String, required: true },
  activo: { type: Boolean, default: true },
  rol: { type: String, default: 'admin' }, // 👈 nuevo campo
});


export default mongoose.models.GymUser || mongoose.model<IGymUser>('GymUser', GymUserSchema);
