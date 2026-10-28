const rides = require('./rides.mongo');

const DEFAULT_RIDE_NUMBER = 100;

// What the API sends back: the saved ride + calculated fields.
// full / completed / arrival / seatsLeft are worked out here every time.
function toApiRide(doc) {
    const ride = doc.toObject ? doc.toObject() : doc;
    const departure = new Date(ride.departure);
    const seatsLeft = ride.seats - ride.riders.length;

    let status = ride.status; // "upcoming" | "cancelled"
    if (status === 'upcoming' && departure.getTime() < Date.now()) {
        status = 'completed';
    } else if (status === 'upcoming' && seatsLeft <= 0) {
        status = 'full';
    }

    return {
        rideNumber: ride.rideNumber,
        destination: ride.destination,
        driveMinutes: ride.driveMinutes,
        departure: departure.toISOString(),
        arrival: new Date(departure.getTime() + ride.driveMinutes * 60000).toISOString(),
        seats: ride.seats,
        seatsLeft,
        driver: ride.driver,
        riders: ride.riders,
        note: ride.note,
        status, // "upcoming" | "full" | "cancelled" | "completed"
        cancelledAt: ride.cancelledAt ? new Date(ride.cancelledAt).toISOString() : null,
    };
}

async function findRide(rideNumber) {
    return await rides.findOne({ rideNumber });
}

async function existsRideWithNumber(rideNumber) {
    return Boolean(await rides.exists({ rideNumber }));
}

// Highest ride number so far (new rides get +1)
async function getLatestRideNumber() {
    const latestRide = await rides.findOne().sort('-rideNumber');
    if (!latestRide) {
        return DEFAULT_RIDE_NUMBER;
    }
    return latestRide.rideNumber;
}

// view = "upcoming": not cancelled, not departed yet, soonest first
// view = "history":  cancelled or already departed, newest first
async function getRides(view) {
    const now = new Date();
    let found;
    if (view === 'history') {
        found = await rides
            .find({ $or: [{ status: 'cancelled' }, { departure: { $lt: now } }] })
            .sort({ departure: -1 });
    } else {
        found = await rides
            .find({ status: 'upcoming', departure: { $gte: now } })
            .sort({ departure: 1 });
    }
    return found.map(toApiRide);
}

async function addNewRide(ride) {
    const newRideNumber = (await getLatestRideNumber()) + 1;
    const saved = await rides.create({
        ...ride,
        rideNumber: newRideNumber,
        riders: [],
        status: 'upcoming',
        cancelledAt: null,
    });
    return toApiRide(saved);
}

// Takes a seat in ONE database step. The filter only matches if the ride is
// still open AND has a free seat, so two friends can't grab the last seat.
async function joinRide(rideNumber, name) {
    const updated = await rides.findOneAndUpdate({
        rideNumber,
        status: 'upcoming',
        departure: { $gt: new Date() },
        driver: { $ne: name },
        riders: { $ne: name },
        $expr: { $lt: [{ $size: '$riders' }, '$seats'] },
    }, {
        $push: { riders: name },
    }, {
        returnDocument: 'after',
    });

    if (updated) {
        return { ride: toApiRide(updated) };
    }

    // It didn't match: look at the ride to explain why
    const ride = await findRide(rideNumber);
    if (!ride) return { status: 404, error: 'Ride not found' };
    const view = toApiRide(ride);
    if (view.status === 'full') return { status: 400, error: 'Ride is full' };
    if (view.status !== 'upcoming') return { status: 400, error: 'Ride is not open' };
    if (ride.driver === name) return { status: 400, error: "You're the driver of this ride" };
    if (ride.riders.includes(name)) return { status: 400, error: 'You already joined this ride' };
    return { status: 400, error: 'Could not join this ride' };
}

async function leaveRide(rideNumber, name) {
    const updated = await rides.findOneAndUpdate({
        rideNumber,
        status: 'upcoming',
        riders: name,
    }, {
        $pull: { riders: name },
    }, {
        returnDocument: 'after',
    });

    if (updated) {
        return { ride: toApiRide(updated) };
    }
    if (!(await existsRideWithNumber(rideNumber))) return { status: 404, error: 'Ride not found' };
    return { status: 400, error: "You're not on this ride" };
}

// Never deletes, just changes the status, so the ride stays in History
async function cancelRide(rideNumber, name) {
    const ride = await findRide(rideNumber);
    if (!ride) return { status: 404, error: 'Ride not found' };
    if (ride.driver !== name) return { status: 403, error: 'Only the driver can cancel this ride' };
    if (ride.status === 'cancelled') return { status: 400, error: 'Ride is already cancelled' };
    if (ride.departure.getTime() < Date.now()) return { status: 400, error: 'Ride already happened' };

    ride.status = 'cancelled';
    ride.cancelledAt = new Date();
    await ride.save();
    return { ride: toApiRide(ride) };
}

module.exports = {
    getRides,
    addNewRide,
    joinRide,
    leaveRide,
    cancelRide,
};
