/*
* Home page app
* Author: Nate Penner
* When: December 2021
* */

const mysql = require('mysql');
const router = require('express').Router();
const {randRange} = require('../utilities');

const FEATURED = 0;

// Handles the route for '/' (the home page)
router.get('/', (req, res) => {
    const conn = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });
    conn.connect((err) => {
        if (err)
            res.render('main', {pageTitle: ''});
        else {
            // Get the featured package
            conn.query('SELECT PackageId, PkgName, PkgDesc, PkgBasePrice FROM packages', (err, results, fields) => {
                if (err || results.length < 1) {
                    res.render('main', {pageTitle: ''});
                }
                else {
                    res.render('main', {pageTitle: '', featuredPackage: results[FEATURED]});
                    conn.end((err) => {
                        if (err)
                            console.log(`Problem ending the connection: ${err}`);
                    });
                }
            });
        }
    });
});

// Export the router
module.exports = router;