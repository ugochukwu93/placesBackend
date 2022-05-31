const axios = require('axios');

async function getCoordsForAddress(address) {
    return {
        lat: 40.7484474,
        lng: -73.9871516
    };
}

module.exports = getCoordsForAddress