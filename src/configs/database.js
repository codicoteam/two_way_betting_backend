const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const env = require('./env');

let memoryServer;

const connectDB = async () => {
  try {
    if (env.USE_MEMORY_DB) {
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      console.log('✅ In-memory MongoDB connected');
    } else {
      await mongoose.connect(env.MONGODB_URI);
      console.log('✅ MongoDB connected');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (error) {
    console.error('❌ Error while disconnecting DB:', error);
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;