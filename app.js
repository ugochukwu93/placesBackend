const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const placeRoutes = require('./routes/places-route');
const usersRoutes = require('./routes/users-routes');

const HttpError = require('./models/http-error');
const req = require("express/lib/request");

const app = express();


app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
app.use(bodyParser.text({ type: 'text/html' }))

app.use('/api/places', placeRoutes);
app.use('/api/users', usersRoutes);

//Error handling for unsupported routes
app.use((req, res, next)=> {
    const error = new HttpError('Could not find this route.', 404);
    throw error
})


//default middleware error handling ...
app.use((error, req, res, next)=> {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
    res.json( {message: error.message || 'An unknown error occurred!'});
});

// const url = 'mongodb+srv://main:wWq2wUmz7P47bF9r@cluster0.mcivr.mongodb.net/places?retryWrites=true&w=majority'
mongoose.connect( 'mongodb+srv://main:wWq2wUmz7P47bF9r@cluster0.mcivr.mongodb.net/places?retryWrites=true&w=majority' )
.then(() => {
    app.listen(5000)
})
.catch( err=> {

});
