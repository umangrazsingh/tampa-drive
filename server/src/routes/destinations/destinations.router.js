const express = require('express');

const {
    httpGetAllDestinations,
} = require('./destinations.controller');

const destinationsRouter = express.Router();

destinationsRouter.get('/', httpGetAllDestinations);

module.exports = destinationsRouter;
