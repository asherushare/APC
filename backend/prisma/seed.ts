import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminEmail = 'admin@adivasiproducer.com';

  // Check if any ADMIN user already exists in the database
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (existingAdmin) {
    // eslint-disable-next-line no-console
    console.log('ℹ️ Administrative user already exists. Skipping seed execution.');
    return;
  }

  // Retrieve initial admin password from environment configuration
  const initialPassword = process.env.INITIAL_ADMIN_PASSWORD;
  if (!initialPassword) {
    // eslint-disable-next-line no-console
    console.log('⚠️ Seeding skipped: INITIAL_ADMIN_PASSWORD environment variable is not defined.');
    return;
  }

  // Generate salt and hash for the new admin password
  const passwordHash = await bcrypt.hash(initialPassword, 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      fullName: 'APC Admin User',
      passwordHash,
      role: 'ADMIN',
    },
  });
  // eslint-disable-next-line no-console
  console.log(`✅ Initial Admin User seeded successfully: ${adminEmail}`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('❌ Error executing seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
