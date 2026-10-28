const { getAllDestinations } = require('../../models/destinations.model');

async function httpGetAllDestinations(req, res) {
    return res.status(200).json(await getAllDestinations());
}

module.exports = {
    httpGetAllDestinations,
};
