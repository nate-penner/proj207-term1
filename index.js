/*
* Travelexperts Main Web Application
* Author: Nate Penner
* When: December 2021
* */

require('dotenv').config();             // load environment variables from .env into process.env
const express = require('express');     // use express for routing
const argv = require('./argv');         // for handling command line args
const apps = require('./apps');         // for loading apps

// constants
let HTTP_PORT;
if ('http-port' in argv)
    HTTP_PORT = argv['http-port'];
else
    HTTP_PORT = process.env.HTTP_PORT;

const HOST = process.env.HOST;
const app = express();

// Set up the express application
app.set('view engine', 'ejs');
app.use(express.urlencoded());
app.use(express.json());

// Serves static files
app.use('/assets', express.static('assets'));
app.use('/media', express.static('media'));

// Load apps
apps.loadInto(app);

// Redirect / to /home
app.get('/', (req, res) => {
    res.redirect('/home');
});

// Catch all bad routes
app.get('*', (req, res) => {
   res.render('404', {message: `No route to ${req.url}`});
});

// Start the application
app.listen(HTTP_PORT);
console.log(`Listening on ${HOST}:${HTTP_PORT}...`);