const express = require('express');

const {
    httpGetRides,
    httpAddNewRide,
    httpJoinRide,
    httpLeaveRide,
    httpCancelRide,
} = require('./rides.controller');

const ridesRouter = express.Router();

ridesRouter.get('/', httpGetRides);
ridesRouter.post('/', httpAddNewRide);
ridesRouter.post('/:rideNumber/join', httpJoinRide);
ridesRouter.post('/:rideNumber/leave', httpLeaveRide);
ridesRouter.delete('/:rideNumber', httpCancelRide);

module.exports = ridesRouter;
