/*
* Login app
* Author: Nate Penner
* When: December 2021
* */

// includes
const router = require('express').Router();     // For routing
const queries = require('./queries');           // For SQL queries

// Handle a GET request to /login (ie. serve the login page)
router.get('/', (req, res) => {
    res.render('login/home', {pageTitle: '- Login'});
});

// Handle a POST request to /login (ie. perform the login action
router.post('/', (req, res) => {
    let sql = 'SELECT * FROM customers WHERE CustomerUUID=?';
    let values = [req.body.customerUUID];

    // Check if the user exists based on the UUID submitted with the request
    queries.get(sql, values, (err, results, fields) => {
        console.log(req.body);
        if (err || results.length !== 1) {
            console.log(err);

            // If there is no result, the login failed
            res.render('login/failure', {pageTitle: '- Failed login attempt'});
        } else {
            const customer = results[0];
            sql = 'SELECT * FROM bookings INNER JOIN packages ON bookings.PackageId=packages.PackageId WHERE CustomerId=?';
            values = [customer.CustomerId];

            // If the login was successful, get the user's bookings
            queries.get(sql, values, (err, results, fields) => {
                if (err) {
                    console.error(err);

                    // If the booking retrieval failed, render an error to the profile page
                    res.render(
                        'profile/home',
                        {errorMessage: `Sorry, ${customer.CustFirstName}, we had some trouble retrieving your bookings. Please contact us at 403-555-5555 for assistance! We are happy to assist you.`,
                            customerInfo: customer, pageTitle: `- Welcome, ${customer.CustFirstName}!`});
                } else {
                    results = results.filter(booking => booking.PackageId !== null);

                    // Otherwise, render the profile page with the bookings. If there are no bookings, the ejs page
                    // handles it accordingly
                    res.render('profile/home',
                        {
                            customerInfo: customer,
                            pageTitle: `- Welcome, ${customer.CustFirstName}!`,
                            bookings: results
                        });
                }
            });
        }
    });
});

// Export the router
module.exports = router;