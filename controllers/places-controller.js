const HttpError = require('../models/http-error');
// const uuid = require('uuid/v4')
const { v4: uuidv4 } = require('uuid');

const DUMMY_PLACES = [
    {
      id: 'p1',
      title: 'Empire State Building',
      description: 'One of the most famous sky scrapers in the world!',
      imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
      address: '20 W 34th St, New York, NY 10001',
      location: {
        lat: 40.7484405,
        lng: -73.9878584
      },
      creator: 'u1'
    },
];

const getPlaceById = (req, res, next)=> {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => {
        return p.id === placeId
    })

    if (!place) {
       throw new HttpError('could not find a place for the provided id.', 404);
    }

    res.json({place});// { place } same as { place: place}
    
}

const getPlaceByUserId =  (req, res, next) => {
    const userId = req.params.uid;

    const place = DUMMY_PLACES.find(p => {
        return p.creator === userId;
    });

    if (!place) {
        return next(
            new HttpError('could not find a place for the provided user id.', 404)
        );
    }
    res.json({ place })

};

const createPlace = (res, req, next)=> {
    //object destructuring
    const { title, description, coordinates, address, creator} = req.body;
    //same as const title = req.body.title;
    const createdPlace = {
        id: uuidv4(),
        title,
        description,
        location: coordinates,
        address,
        creator,
    };

    DUMMY_PLACES.push(createdPlace);

    res.status(201).json({ place: createdPlace});
}

const updatePlace= (req, res, next)=> {

    const { title, description} = req.body;

    const updatedPlace = {...DUMMY_PLACES.find(p => p.id === placeId) };
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    updatedPlace.title = title;
    updatedPlace.description = description;

    DUMMY_PLACES[placeIndex] = updatedPlace;

    res.status(200).json({place: updatedPlace})

};

const deletePlace = (res, req, next)=> {

}

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
