const mongoose = require('mongoose');

// Your Atlas connection string lives in server/.env (never in the code).
const MONGO_URL = process.env.MONGO_URL;

// Real data goes in the "tampadrive" database. Jest runs (NODE_ENV=test)
// use "tampadrive_test" so tests never mess with your real rides.
const DB_NAME = process.env.NODE_ENV === 'test' ? 'tampadrive_test' : 'tampadrive';

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL, { dbName: DB_NAME });
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
