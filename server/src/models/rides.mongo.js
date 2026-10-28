const mongoose = require('mongoose');

const ridesSchema = new mongoose.Schema({
    rideNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    destination: {
        type: String,
        required: true,
    },
    // copied from the destination when the ride is posted, so History stays
    // correct even if you change the preset later
    driveMinutes: {
        type: Number,
        required: true,
    },
    departure: {
        type: Date,
        required: true,
    },
    seats: {
        type: Number,
        required: true,
        min: 1,
        max: 6,
    },
    driver: {
        type: String,
        required: true,
    },
    riders: {
        type: [String],
        default: [],
    },
    note: {
        type: String,
        default: '',
    },
    // ONLY these two are ever saved. "full" and "completed" are calculated
    // in rides.model.js every time, so they can never go out of sync.
    status: {
        type: String,
        enum: ['upcoming', 'cancelled'],
        default: 'upcoming',
    },
    cancelledAt: {
        type: Date,
        default: null,
    },
});

module.exports = mongoose.model('Ride', ridesSchema);
