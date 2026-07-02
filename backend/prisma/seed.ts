import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminEmail = 'admin@adivasiproducer.com';

  // Check if any ADMIN user already exists in the database
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  let creatorId = existingAdmin?.id;

  if (!existingAdmin) {
    // Retrieve initial admin password from environment configuration
    const initialPassword = process.env.INITIAL_ADMIN_PASSWORD;
    if (!initialPassword) {
      // eslint-disable-next-line no-console
      console.log('⚠️ Seeding skipped: INITIAL_ADMIN_PASSWORD environment variable is not defined.');
      return;
    }

    // Generate salt and hash for the new admin password
    const passwordHash = await bcrypt.hash(initialPassword, 12);

    const newUser = await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: 'APC Admin User',
        passwordHash,
        role: 'ADMIN',
      },
    });
    creatorId = newUser.id;
    // eslint-disable-next-line no-console
    console.log(`✅ Initial Admin User seeded successfully: ${adminEmail}`);
  } else {
    // eslint-disable-next-line no-console
    console.log('ℹ️ Administrative user already exists.');
  }

  // Seed Mock Notices if none exist in the database
  const noticeCount = await prisma.notice.count();
  if (noticeCount === 0 && creatorId) {
    await prisma.notice.createMany({
      data: [
        {
          title: 'Odisha Tribal Welfare Sub-Plan Scheme 2026',
          category: 'SCHEME',
          summary: 'Support subsidy guidelines for local tribal farming cooperatives and micro-enterprises.',
          content: 'The Department of Tribal Welfare announces a comprehensive support subsidy sub-plan providing 50% matching grants for grain processing machines and storage shelters. Eligible tribal cooperative groups must submit registrations before the autumn harvest session. For details, contact block coordinators.',
          pdfUrl: 'https://example.com/tribal-scheme-2026.pdf',
          authorId: creatorId,
        },
        {
          title: 'Annual Shareholder Assembly Notice',
          category: 'ANNOUNCEMENT',
          summary: 'Official board announcement for the upcoming annual general assembly for all registered APC members.',
          content: 'The Board of Directors of Adivasi Producer Company cordially invites all shareholders to the Annual General Meeting to be held at the Rayagada Community Center. Agenda includes distribution of agricultural tools dividends, voting on board seat updates, and audit report presentation.',
          authorId: creatorId,
        },
        {
          title: 'Millets Revolution in Rayagada District',
          category: 'STORY',
          summary: 'How local women producer groups doubled their millet crop yield this season.',
          content: 'Through the implementation of systematic organic composting and high-yielding minor millet seeds provided by APC, local self-help farming groups in Rayagada block have achieved a record 120% yield growth. This success story showcases the collective strength of tribal women producers.',
          authorId: creatorId,
        }
      ]
    });
    // eslint-disable-next-line no-console
    console.log('✅ Mock Notice Board updates seeded successfully.');
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
