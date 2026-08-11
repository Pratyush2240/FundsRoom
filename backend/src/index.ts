import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { seedInitialData } from './services/seed.service';

const PORT = env.PORT;

const server = app.listen(PORT, async () => {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('[Auto-Seed] Empty database detected. Seeding initial demo accounts...');
      const counts = await seedInitialData();
      console.log(`[Auto-Seed] Completed. Users: ${counts[0]}, Customers: ${counts[1]}, Products: ${counts[2]}`);
    }
  } catch (err) {
    console.error('[Auto-Seed] Failed to auto-seed database:', err);
  }
});

// Graceful shutdown: disconnect Prisma when the process exits
const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
