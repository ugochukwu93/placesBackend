const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator')
const { v4: uuidv4 } = require('uuid');
const mongoose = require("mongoose")
const getCoordsForAddress = require('../util/location')

const Place = require('../models/place')
const User = require('../models/user.js')

// let DUMMY_PLACES = [
//     {
//       id: 'p1',
//       title: 'Empire State Building',
//       description: 'One of the most famous sky scrapers in the world!',
//       imageUrl:
//       'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
//       address: '20 W 34th St, New York, NY 10001',
//       location: {
//         lat: 40.7484405,
//         lng: -73.9878584
//       },
//       creator: 'u1'
//     },
// ];

const getPlaceById = async (req, res, next)=> {
    const placeId = req.params.pid;

    let place;

    try {
        place = await Place.findById(placeId)
    } catch (err) {
        const error = new HttpError( "something went wrong, could not find a place.", 500 )
        return next(error)
    };

    if (!place) {
       const error = new HttpError('could not find a place for the provided id.', 404);
       return next(error)
    };

    res.json({ place: place.toObject( {getters: true } ) }); // this removes the underskull on the ID in mongoDB database.
    // { place } same as { place: place}
    
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    // let places;
    let userWithPlaces;

    try {
        userWithPlaces = await User.findById(userId).populate('places')
    } catch (err) {
        const error = new HttpError( "fetching places failed please try again later.", 500 )
        return next(error)
    } 

    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        const error = new HttpError('could not find a places for the provided user id.', 404)
        return next(error)
    }

    res.json({ places : userWithPlaces.places.map( place => place.toObject({ getters: true })) })

};

const createPlace = async(req, res, next)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return next(
            new HttpError('Invalid inputs passed check your data.',422))
    }
   
    // const title = req.body.title;
    // const description = req.body.description;
    // const coordinates = req.body.coordinates;
    // const address = req.body.address;
    // const creator = req.body.creator;
    //object destructuring
    const { title, description, address, creator} = req.body;

    let coordinates;
    try{
        coordinates = await getCoordsForAddress(address)
    } catch (error) {
        return next (error)
    }

    const createdPlace = new Place ({
        title: title,
        description: description,
        location: coordinates,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzw4X6T7gTp-Fhrwr6idAwQu3Zo6j5hcMaH1t1wG-i2M_no6dAaOFO29jFPBShzcCSI1M&usqp=CAU",
        address,
        creator
    });
    let user

    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError ('Creating place failed, please try again', 500);
        return next(error)
    }

    if (!user) {
        const error = new HttpError('could not find user for provided id', 404);
        return next (error)
    }
    console.log(user);

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction()
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess});
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'creating place failed, please try again.',
            500
        );
        return next(error)
    }

    res.status(201).json({ place: createdPlace});
}


const updatePlace = async (req, res, next)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed check your data.',422))
    }

    const { title, description} = req.body;

    const placeId = req.params.pid
    
    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error= new HttpError('something went wrong, could not update place.', 500)
        return next(error)
    };

    place.title = title;
    place.description = description;

    try {
        await place.save()
    } catch (err) {
        const error = new HttpError( 'something went wrong, could not update place,', 500)
        return next(error)
    }
    res.status(200).json({ place: place.toObject({ getters: true }) })

};

const deletePlace = async (req, res, next)=> {
    const placeId = req.params.pid;
    
    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError('something went wrong, could not delete place.', 500)
        return next(error)
    };

    if (!place) {
        const error = new HttpError('could not find place for this id', 404);
        return next(error);
    }
    
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction()
        await place.remove({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({session: sess})
        await sess.commitTransaction();
    } catch(err) {
        const error = new HttpError( 'something went wrong, could not delete place.' )
        return next(error)
    }
    res.status(200).json({ message: 'Deleted place.' })
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
