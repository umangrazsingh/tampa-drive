const {
    getRides,
    addNewRide,
    joinRide,
    leaveRide,
    cancelRide,
} = require('../../models/rides.model');
const { findDestination } = require('../../models/destinations.model');
const { existsMember } = require('../../models/members.model');

// GET /rides?view=upcoming | history
async function httpGetRides(req, res) {
    const view = req.query.view || 'upcoming';
    if (view !== 'upcoming' && view !== 'history') {
        return res.status(400).json({
            error: 'view must be "upcoming" or "history"',
        });
    }
    return res.status(200).json(await getRides(view));
}

// POST /rides  { destination, departure, seats, driver, note }
async function httpAddNewRide(req, res) {
    const { destination, departure, seats, driver, note = '' } = req.body || {};

    if (!destination || !departure || !seats || !driver) {
        return res.status(400).json({
            error: 'Missing required ride property',
        });
    }

    const foundDestination = await findDestination(destination);
    if (!foundDestination) {
        return res.status(400).json({ error: 'Unknown destination' });
    }

    const departureDate = new Date(departure);
    if (isNaN(departureDate)) {
        return res.status(400).json({ error: 'Invalid departure date' });
    }
    if (departureDate.getTime() < Date.now()) {
        return res.status(400).json({ error: 'Departure must be in the future' });
    }

    const seatCount = Number(seats);
    if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > 6) {
        return res.status(400).json({ error: 'Seats must be between 1 and 6' });
    }

    if (!(await existsMember(driver))) {
        return res.status(400).json({ error: 'Unknown driver' });
    }

    const ride = await addNewRide({
        destination,
        driveMinutes: foundDestination.driveMinutes,
        departure: departureDate,
        seats: seatCount,
        driver,
        note: String(note).trim().slice(0, 200),
    });
    return res.status(201).json(ride);
}

// Shared by join / leave / cancel: they all need a ride number and a name
function readRideAndName(req, res) {
    const rideNumber = Number(req.params.rideNumber);
    const name = req.body?.name;
    if (!Number.isInteger(rideNumber)) {
        res.status(400).json({ error: 'Invalid ride number' });
        return null;
    }
    if (!name) {
        res.status(400).json({ error: 'Missing name' });
        return null;
    }
    return { rideNumber, name };
}

function sendResult(res, result) {
    if (result.error) {
        return res.status(result.status).json({ error: result.error });
    }
    return res.status(200).json(result.ride);
}

// POST /rides/:rideNumber/join  { name }
async function httpJoinRide(req, res) {
    const input = readRideAndName(req, res);
    if (!input) return;
    if (!(await existsMember(input.name))) {
        return res.status(400).json({ error: 'Unknown member' });
    }
    return sendResult(res, await joinRide(input.rideNumber, input.name));
}

// POST /rides/:rideNumber/leave  { name }
async function httpLeaveRide(req, res) {
    const input = readRideAndName(req, res);
    if (!input) return;
    return sendResult(res, await leaveRide(input.rideNumber, input.name));
}

// DELETE /rides/:rideNumber  { name }   (cancel)
async function httpCancelRide(req, res) {
    const input = readRideAndName(req, res);
    if (!input) return;
    return sendResult(res, await cancelRide(input.rideNumber, input.name));
}

module.exports = {
    httpGetRides,
    httpAddNewRide,
    httpJoinRide,
    httpLeaveRide,
    httpCancelRide,
};
