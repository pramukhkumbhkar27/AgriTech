const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agri_tech';
  const forceMemory = process.env.USE_MEMORY_DB === 'true';

  if (!forceMemory) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[Database] MongoDB connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.warn(`[Database] Could not connect to local/configured MongoDB (${err.message}).`);
      console.log(`[Database] Attempting fallback to embedded in-memory MongoDB server...`);
    }
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] In-memory MongoDB started and connected successfully at: ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.error(`[Database] Failed to initialize in-memory MongoDB:`, memErr.message);
    throw memErr;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
