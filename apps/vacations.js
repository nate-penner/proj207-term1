/*
* Vacation packages app
* Author: Nate Penner
* When: December 2021
* */

// includes
const router = require('express').Router();     // for routing
const fm = require('../utilities/fm');          // utility for reading a directory
const path = require('path');                   // working with paths
const queries = require('./queries');           // a utility for simpler SQl queries
const crypto = require('crypto');               // for generating user ID;s

// Handles the route for /vacations
router.get('/', (req, res) => {

    // get the vacation packages from the database
    queries.get('SELECT * FROM packages', (err, results, fields) => {
        if (err) {
            res.render('404', {message: 'Failed to load vacation packages!'});
        } else {
            console.log(results);
            results.forEach((result) => {
                console.log(result);
            });
            if (err || results.length < 1)
                res.render('404', {message: 'Failed to load vacation packages!'});
            else {
                // get paths to the vacation photos that go with each package
                results.forEach((result) => {
                    result.images = [];
                    const fileNames = fm.getFileNamesSync(path.join(__dirname, `../media/images/vacations/${result.PackageId}`));

                    if (!(fileNames instanceof Error)) {
                        fileNames.forEach((fileName) => {
                            result.images.push(`/media/images/vacations/${result.PackageId}/${fileName}`);
                        });
                    } else {
                        console.log('There was an error retrieving the image file names!');
                        console.error(fileNames.message);
                    }
                    console.log(result);
                });

                // render the vacation packages page
                res.render('vacations/home', {pageTitle: 'Vacation Packages', vacations: results});
            }
        }
    });
});

// Handles the route to GET the /vacations/order page to order a package
router.get('/order', (req, res) => {

    // Gets the vacation packages from the database
    queries.get(`SELECT * FROM packages`, (err, results, fields) => {
        if (!err) {
            if ('packageId' in req.query) {
                // Validate the request package against the packageID in the database
                const validPackages = [];
                results.forEach((pkg) => validPackages.push(pkg.PackageId));
                if (validPackages.includes(parseInt(req.query.packageId))) {
                    res.render('vacations/order', {params: results[req.query.packageId - 1], pageTitle: '- Order a Vacation Package'});

                    // Make sure to return so that the redirect will be skipped
                    return;
                }
            }
        }

        res.redirect('/vacations');
    });
});

// Handle the data posted to /vacations/order
router.post('/order', (req, res) => {
    // Get all customer UUID's from the database
    queries.get('SELECT CustomerUUID FROM customers', (err, uuids, fields) => {
        if (err) {
            res.render('404', {message: 'Sorry, we are unable to process your request at this time! Please call (403)-555-5555 for assistance!'});
        } else {
            // make a list of valid UUID's from the database
            const validUUIDs = [];
            uuids.forEach((uuid) => {
                if (uuid.CustomerUUID !== null)
                    validUUIDs.push(uuid.CustomerUUID);
            });

            // Get the packages from the database
            queries.get('SELECT PackageId FROM packages', (err, packageIds, fields) => {
                if (err) {
                    console.error(err);
                    res.render('404', {message: 'Sorry, we are unable to process your request at this time! Please call (403)-555-5555 for assistance!'});
                } else {
                    // make a list of valid package ID's from the database
                    const validPackages = [];
                    packageIds.forEach((packageId) => validPackages.push(packageId.PackageId));

                    // Verify that a number is in a certain range
                    function validRange(num) {
                        try {
                            return parseInt(num) <= 10 && parseInt(num) >= 1;
                        } catch (e) {
                            return false;
                        }
                    }

                    // Validate the packageID receive against the valid packageIDs, and check that the number of
                    // guests is within the accepted range
                    if (validPackages.includes(parseInt(req.body.packageId)) && validRange(req.body.guests)) {

                        if (validUUIDs.includes(req.body.customerUUID)) {
                            // If the customer is already registered, then pull their info from the database and process
                            // the order
                            queries.get(`SELECT * FROM customers WHERE CustomerUUID='${req.body.customerUUID}'`, (err, results, fields) => {
                                if (err || results.length !== 1) {
                                    console.log(err);
                                    res.render('404', {message: 'Something went wrong with your order. Please call (403)-555-5555 for assistance!'})
                                } else {
                                    results[0].packageDetails = req.body;
                                    res.render('register', {orderDetails: results[0], pageTitle: '- Order processed!'});
                                }
                            });
                        } else {
                            // If it's a new customer, then redirect them to the registration page and pass along
                            // the order details
                            res.render('register', {pageTitle: ' - Customer Registration', orderDetails: {packageDetails: req.body}, foo: 'bar'});
                        }
                    } else {
                        validPackages.forEach((pkg) => console.log(typeof pkg));
                        res.render('404', {message: 'Something went wrong with your order. Please call (403)-555-5555 for assistance!'});
                    }
                }
            });
        }
    });
});

// process an order
router.post('/process', (req, res) => {
    // Update the customer's information
    let sql, values;

    sql = 'SELECT * FROM customers WHERE CustomerUUID=?';
    values = [req.body.customerUUID];

    // Get customers from the database
    queries.get(sql, values, (err, results, fields) => {
        if (err) {
            console.error(err);
            res.render('404', {message: 'Unable to process your order. Please call 403-555-5555 for assistance!'});
        } else {
            if (results.length < 1) {
                // Create a new user query
                req.body.customerUUID = crypto.randomUUID();
                sql = 'INSERT INTO customers (CustomerUUID, CustFirstName, CustLastName, CustPostal, CustAddress, '
                    +'CustCity, CustProv, CustCountry, CustHomePhone, CustBusPhone, CustEmail, AgentId) '
                    +'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                values = [
                    req.body.customerUUID, req.body.CustFirstName, req.body.CustLastName, req.body.CustPostal, req.body.CustAddress,
                    req.body.CustCity, req.body.CustProv, req.body.CustCountry, req.body.CustHomePhone, req.body.CustBusPhone,
                    req.body.CustEmail, req.body.AgentId
                ];
            } else {
                // Update an existing user query
                sql = 'UPDATE customers SET CustFirstName=?, CustLastName=?, CustPostal=?, CustAddress=?, '+
                    'CustCity=?, CustProv=?, CustCountry=?, CustHomePhone=?, CustBusPhone=?, CustEmail=?, AgentId=? '+
                    'WHERE CustomerUUID=?';
                values = [
                    req.body.CustFirstName, req.body.CustLastName, req.body.CustPostal, req.body.CustAddress,
                    req.body.CustCity, req.body.CustProv, req.body.CustCountry, req.body.CustHomePhone, req.body.CustBusPhone,
                    req.body.CustEmail, req.body.AgentId, req.body.customerUUID
                ];
            }

            // Run the query
            queries.get(sql, values, (err, results, fields) => {
                if (err) {
                    console.error(err);
                    res.render('404', {message: 'Unable to process your order. Please call 403-555-5555 for assistance!'});
                } else {
                    sql = 'SELECT CustomerId FROM customers WHERE CustomerUUID=?';

                    // Get the info of the existing or new customer
                    queries.get(sql, [req.body.customerUUID], (err, results, fields) => {
                        if (err) {
                            console.error(err);
                            res.render('404', {message: 'Unable to process your order. Please call 403-555-5555 for assistance!'});
                        } else {
                            sql = 'INSERT INTO bookings (BookingDate, TravelerCount, CustomerId, TripTypeId, PackageId) '
                                + 'VALUES(?, ?, ?, ?, ?)';
                            values = [
                                new Date(Date.now()).toISOString(), req.body.guests, results[0].CustomerId, 'L', req.body.packageId
                            ];

                            // Save the customer's booking
                            queries.get(sql, values, (err, results, fields) => {
                                if (err) {
                                    console.error(err);
                                    res.render('404', {message: 'Unable to process your order. Please call 403-555-5555 for assistance!'});
                                } else {
                                    res.render('vacations/process', {pageTitle: ' - Order placed!', orderDetails: req.body});
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

// Export the router
module.exports = router;