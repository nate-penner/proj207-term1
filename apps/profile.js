/*
* Profile app
* Author: Nate Penner
* When: December 2021
* */

const express = require('express');
const router = express.Router();
const queries = require('./queries');

// Handle get request to /profile/:uuid
router.get('/:uuid', (req, res) => {
    // redirect to the home page if no profile is specified
    if (!('uuid' in req.params)) {
        res.redirect('/');
        return;
    }

    const uuid = req.params.uuid;
    console.log(`uuid is ${uuid}`);
    // let sql = 'SELECT * FROM customers INNER JOIN bookings ON customers.CustomerId=bookings.CustomerId WHERE customers.CustomerUUID=?';
    let sql = 'SELECT * FROM customers WHERE CustomerUUID=?';
    let values = [uuid];

    // Get the user's info from the databse
    queries.get(sql, values, (err, results, fields) => {
        if (err) {
            console.error(err);
            res.redirect('/');
        } else {
            const customerInfo = results[0];
            sql = `SELECT * FROM bookings INNER JOIN packages ON bookings.PackageId=packages.PackageId WHERE CustomerId=?`;
            values = [customerInfo.CustomerId];

            // Get the user's booking information from the database
            queries.get(sql, values, (err, results, fields) => {
                if (err || typeof results === 'undefined' || (results.length && results.length < 1)) {
                    console.error(err);

                    // Render the profile without bookings, if there are none
                    res.render('profile/home', {pageTitle: '- Profile', customerInfo: customerInfo});
                } else {
                    let bookings = results;
                    bookings = bookings.filter(booking => booking.PackageId !== null);
                    console.log('Bookings:');
                    console.log(results);

                    // Render the profile with bookings
                    res.render('profile/home', {pageTitle: `- Welcome, ${customerInfo.CustFirstName}!`, customerInfo: customerInfo, bookings: bookings});
                }
            });
        }
    });
});

// Export the router
module.exports = router;