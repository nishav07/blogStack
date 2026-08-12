import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function seedAdmin(): Promise<void> {
  const mongoose = (await import('mongoose')).default;
  const { User } = await import('../models/User.js');
  const { hashPassword } = await import('../utils/password.js');

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Admin';
  const mongodbUri = process.env.MONGODB_URI;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables.');
    process.exit(1);
  }

  if (!mongodbUri) {
    console.error('MONGODB_URI must be set in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongodbUri);

    const existingAdmin = await User.findOne({ email: email.toLowerCase() });

    if (existingAdmin) {
      console.log(`Admin user already exists: ${email}`);
      return;
    }

    const passwordHash = await hashPassword(password);

    await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: 'admin',
    });

    console.log(`Admin user created: ${email}`);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
