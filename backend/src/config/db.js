const mongoose = require('mongoose');
const memoryStore = require('./inMemoryStore');
const { getSeedData } = require('../seeders/seedData');

let isConnectedToMongo = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bhoomisetu';

  // Seed memory store always so mock/fallback is instantly primed
  try {
    const seed = await getSeedData();
    memoryStore.users = [...(seed.users || [])];
    memoryStore.projects = [...(seed.projects || [])];
    memoryStore.proposals = [...(seed.proposals || [])];
    memoryStore.landParcels = [...(seed.landParcels || [])];
    memoryStore.notifications = [...(seed.notifications || [])];
    memoryStore.awards = [...(seed.awards || [])];
    memoryStore.compensations = [...(seed.compensations || [])];
    memoryStore.affectedFamilies = [...(seed.affectedFamilies || [])];
    memoryStore.possessions = [...(seed.possessions || [])];
    memoryStore.rrCases = [...(seed.rrCases || [])];
    memoryStore.documents = [...(seed.documents || [])];
    memoryStore.milestones = [...(seed.milestones || [])];
    memoryStore.auditLogs = [...(seed.auditLogs || [])];
    memoryStore.notificationAlerts = [...(seed.notificationAlerts || [])];
    memoryStore.isInitialized = true;
    console.log('✅ BhoomiSetu In-Memory Storage primed with authentic RFCTLARR datasets.');
  } catch (err) {
    console.error('⚠️ Error priming memory store:', err.message);
  }

  try {
    // Attempt Mongoose connection with 2 second timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    isConnectedToMongo = true;
    console.log(`✅ MongoDB Connected Successfully: ${mongoose.connection.host}`);
  } catch (err) {
    console.log(`ℹ️ Standalone MongoDB not detected (${err.message}).`);
    console.log('🚀 Running in Zero-Config Resilient In-Memory Mode with complete Mongoose schema parity.');
    isConnectedToMongo = false;
  }
};

const isMongo = () => isConnectedToMongo;

module.exports = {
  connectDB,
  isMongo,
  memoryStore
};
