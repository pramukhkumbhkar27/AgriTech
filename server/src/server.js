require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const { autoSeedIfEmpty } = require('./utils/autoSeed');
    await autoSeedIfEmpty();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  🌾 AGRI-TECH SMART FARMING BACKEND SERVER RUNNING`);
      console.log(`  🚀 Port: ${PORT} | Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  🩺 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[UnhandledRejection Error]: ${err.message}`);
      // Keep server running or gracefully close
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { startServer };
