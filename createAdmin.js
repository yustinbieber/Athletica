const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const AdminSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
  },
  {
    collection: 'admin' // forzar colección 'admin' singular
  }
);

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function createAdmin() {
  await mongoose.connect(MONGODB_URI);
  const hashed = await bcrypt.hash('admin123', 10);

  const admin = await Admin.create({
    email: 'admin@admin.com',
    password: hashed,
  });

  console.log('✅ Admin creado:', admin);
  process.exit();
}

createAdmin();
