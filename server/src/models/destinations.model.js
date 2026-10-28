const destinations = require('./destinations.mongo');
const destinationsData = require('../../data/destinations');

// Upsert every preset so restarting never creates duplicates.
async function loadDestinations() {
    for (const [index, destination] of destinationsData.entries()) {
        await destinations.updateOne({
            name: destination.name,
        }, {
            name: destination.name,
            driveMinutes: destination.driveMinutes,
            order: index,
        }, {
            upsert: true,
        });
    }

    // remove presets that were deleted from data/destinations.js
    const names = destinationsData.map((d) => d.name);
    await destinations.deleteMany({ name: { $nin: names } });

    console.log(`${names.length} destinations loaded!`);
}

async function getAllDestinations() {
    return await destinations
        .find({}, { '_id': 0, '__v': 0, 'order': 0 })
        .sort({ order: 1 });
}

async function findDestination(name) {
    return await destinations.findOne({ name });
}

module.exports = {
    loadDestinations,
    getAllDestinations,
    findDestination,
};
