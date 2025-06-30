import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Por favor define la variable MONGODB_URI en .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // Para que TypeScript reconozca la propiedad en global
   
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache;

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

cached = global.mongoose;

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'athletica', // podés poner el nombre de tu base
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
