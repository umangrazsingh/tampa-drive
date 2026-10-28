const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const requireInvite = require('./middleware/requireInvite');
const sessionRouter = require('./routes/session/session.router');
const destinationsRouter = require('./routes/destinations/destinations.router');
const ridesRouter = require('./routes/rides/rides.router');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// /session checks the invite code, so it's the only route that doesn't need it
app.use('/session', sessionRouter);
app.use('/destinations', requireInvite, destinationsRouter);
app.use('/rides', requireInvite, ridesRouter);

// Anything else is a React page (after `npm run deploy` builds it into public/)
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
