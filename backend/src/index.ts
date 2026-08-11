import app from './app';
import { env } from './config/env';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Mini ERP Backend running on http://localhost:${PORT}`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/api/health`);
});
