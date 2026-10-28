const express = require('express');

const {
    httpCreateSession,
} = require('./session.controller');

const sessionRouter = express.Router();

sessionRouter.post('/', httpCreateSession);

module.exports = sessionRouter;
