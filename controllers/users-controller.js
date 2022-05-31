const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error');
const User = require('../models/user');
// const user = require('../models/user');


const DUMMY_USERS = [
    {
        id: "ul",
        name: 'Ugo Nwadike',
        email: 'test@test.com',
        password: 'testers'
    }
]


const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError('fetching users failed, please try again', 500)
        return next(error)
    }
    res.json({users: users.map(user => user.toObject({ getters: true }))})
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next( new HttpError('Invalid inputs passed check your data.',422)) 
    }
    const { name, email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later.',500)
        return next(error)
    }

    if (existingUser) {
        const error = new HttpError('user exists already, please login instead.', 422)
        return next(error)
    }

    const createdUser = new User({
        name, // name: name
        email, // email: email
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrZNG2V1kv_IH_8aTfCrLyEYKVDuCeuKoHaQ&usqp=CAU",
        password, // password: password
        places : [],
    });

   try {
       await createdUser.save();
   } catch (err) {
       const error = new HttpError('Signing up failed, please try again.', 500)
       return next(error)
   }

    res.status(201).json({user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Logging in failed, please try again later.',500)
        return next(error)
    }

    if (!existingUser || existingUser.password != password ) {
        const error = new HttpError(
            'Invalid credentials, could not log you in',
         401);
         return next(error)
    }

    res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.login = login;
exports.signup = signup;