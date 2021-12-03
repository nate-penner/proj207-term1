require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const argv = require('./argv');
const vacations = require('./apps/vacations');
const apps = require('./apps');

let HTTP_PORT;
console.log('stuff happened');
console.log(argv);
if ('http-port' in argv)
    HTTP_PORT = argv['http-port'];
else
    HTTP_PORT = process.env.HTTP_PORT;

const HOST = process.env.HOST;
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`Incoming connection from ${req.socket.remoteAddress}:${req.socket.remotePort}`);
    next();
});

// Serves static files
app.use('/assets', express.static('assets'));
app.use('/media', express.static('media'));

// Load apps
apps.loadInto(app);
// app.use('/vacations', vacations);

app.get('/', (req, res) => {
    res.redirect('/home');
    // res.render('index');
});

app.get('*', (req, res) => {
   res.render('404', {message: `No route to ${req.url}`});
});

// Start the application
app.listen(HTTP_PORT);
console.log(`Listening on ${HOST}:${HTTP_PORT}...`);