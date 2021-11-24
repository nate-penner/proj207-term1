const express = require('express');
const mysql = require('mysql');
const http = require('http');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`Incoming connection from ${req.socket.remoteAddress}:${req.socket.remotePort}`);
    next();
});

app.use('/assets', express.static('assets'));

app.get('/', (req, res) => {
    res.render('index');
});

// app.get('*', (req, res) => {
//    res.render('404', {message: `No route to ${req.url}`});
// });

const server = http.createServer(app).listen(56789);
console.log('Listening on localhost:56789...');