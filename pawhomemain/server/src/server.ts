import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 PawHome Server running on port ${PORT}`);
  console.log(`🐾 Built by Team Dorado for PawHome — Your Pet's Second Home`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health-check`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});
