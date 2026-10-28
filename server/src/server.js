const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const http = require('http');

const app = require('./app');
const { mongoConnect } = require('./services/mongo');
const { loadDestinations } = require('./models/destinations.model');
const { syncMembers } = require('./models/members.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadDestinations();
  await syncMembers();

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

startServer();
