import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`[Server] Mini ERP Backend running on http://localhost:${PORT}`);
  console.log(`[Health] Health check available at http://localhost:${PORT}/api/health`);
});

// Graceful shutdown: disconnect Prisma when the process exits
const shutdown = async () => {
  console.log('\n[Server] Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('[Server] Server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
