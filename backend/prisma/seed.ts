import { seedInitialData } from '../src/services/seed.service';
import { prisma } from '../src/config/prisma';

if (require.main === module) {
  seedInitialData()
    .then((counts) => {
      console.log(`[Seed] Complete. Users: ${counts[0]}, Customers: ${counts[1]}, Products: ${counts[2]}, Stock movements: ${counts[3]}`);
    })
    .catch((error) => {
      console.error('[Seed] Failed:', error);
      process.exit(1);
    })
    .finally(async () => prisma.$disconnect());
}

export { seedInitialData };
