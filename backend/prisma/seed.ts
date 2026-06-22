import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminEmail = 'admin@adivasiproducer.com';

  // Check if default admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    // Generate salt and hash for the default admin password
    const passwordHash = await bcrypt.hash('AdminPassword123!', 12);

    await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: 'APC Admin User',
        passwordHash,
        role: 'ADMIN',
      },
    });
    // eslint-disable-next-line no-console
    console.log('✅ Default Admin User seeded successfully: admin@adivasiproducer.com / AdminPassword123!');
  } else {
    // eslint-disable-next-line no-console
    console.log('ℹ️ Admin user already exists. Skipping seed execution.');
  }
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
