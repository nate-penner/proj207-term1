const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const fm = require('../utilities/fm');
const path = require('path');
const queries = require('./queries');
const crypto = require('crypto');

// I got angry with WebStorm
router.get('/', (req, res) => {
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
                // get image paths;
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
                res.render('vacations/home', {pageTitle: 'Vacation Packages', vacations: results});
            }
        }
    });
});
router.get('/order', (req, res) => {
    queries.get(`SELECT * FROM packages`, (err, results, fields) => {
        if (!err) {
            if ('packageId' in req.query) {
                const validPackages = [];
                results.forEach((pkg) => validPackages.push(pkg.PackageId));
                console.log(`Valid packages: ${validPackages}`);
                console.log(`Selected package: ${req.query.packageId}`);
                console.log('hi');
                console.log(typeof req.query.packageId);
                if (validPackages.includes(parseInt(req.query.packageId))) {
                    console.log('Yes, it is valid');
                    res.render('vacations/order', {params: results[req.query.packageId - 1], pageTitle: '- Order a Vacation Package'});
                    return;
                } else {
                    console.log('No, it is invalid');
                }
            }
        }

        res.redirect('/vacations');
    });
});

// For the prototype, I used a convoluted set of queries to prevent the possibility of SQL injection in the packageID
// and customerUUID, in the interest of getting the prototype up and running. In production, we will update the security
// of the site with some middlewares like helmet and sanitizer, and setup HTTPS via letsencrypt
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
            console.log('Valid uuids:');
            console.log(validUUIDs);

            // Get the packages from the database
            queries.get('SELECT PackageId FROM packages', (err, packageIds, fields) => {
                if (err) {
                    console.log(err);
                    console.log(packageIds);
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
                        console.log(`The customer's uuid is ${req.body.customerUUID}`);
                        console.log(validUUIDs.includes(req.body.customerUUID));

                        if (validUUIDs.includes(req.body.customerUUID)) {
                            // If the customer is already registered, then pull their info from the database and process
                            // the order
                            queries.get(`SELECT * FROM customers WHERE CustomerUUID='${req.body.customerUUID}'`, (err, results, fields) => {
                                if (err || results.length !== 1) {
                                    console.log(results);
                                    console.log(err);
                                    res.render('404', {message: 'Something went wrong with your order. Please call (403)-555-5555 for assistance!'})
                                } else {
                                    results[0].packageDetails = req.body;
                                    console.log(results);
                                    res.render('register', {orderDetails: results[0], pageTitle: '- Order processed!'});
                                }
                            });
                        } else {
                            // If it's a new customer, then redirect them to the registration page and pass along
                            // the order details
                            console.log(req.body);
                            res.render('register', {pageTitle: ' - Customer Registration', orderDetails: {packageDetails: req.body}, foo: 'bar'});
                        }
                    } else {
                        console.log('Failed here');
                        console.log(`Valid packages: ${validPackages}`);
                        console.log(`Selected package: ${req.body.packageId}`);
                        console.log(`Guests: ${req.body.guests}`);
                        console.log('Package is valid: ' + req.body.packageId in validPackages);
                        console.log(`Type of packageId: ${typeof req.body.packageId}`);
                        validPackages.forEach((pkg) => console.log(typeof pkg));
                        console.log(`Range is valid: ${validRange(req.body.guests)}`);
                        res.render('404', {message: 'Something went wrong with your order. Please call (403)-555-5555 for assistance!'});
                    }
                }
            });
        }
    });
});

// process an order
router.post('/process', (req, res) => {
    console.log('RAN PROCESS');
    console.log(req.body.customerUUID);
    // Update the customer's information
    let sql, values;

    sql = 'SELECT * FROM customers WHERE CustomerUUID=?';
    values = [req.body.customerUUID];

    queries.get(sql, values, (err, results, fields) => {
        if (err) {
            console.error(err);
            res.render('404', {message: 'Unable to process your order. Please call 403-555-5555 for assistance!'});
        } else {
            if (results.length < 1) {
                // Create a new user query
                console.log(`No such user id: ${req.body.customerUUID}`);
                req.body.customerUUID = crypto.randomUUID();
                console.log(`Created new user id ${req.body.customerUUID}`);
                sql = 'INSERT INTO customers (CustomerUUID, CustFirstName, CustLastName, CustPostal, CustAddress, '
                    +'CustCity, CustProv, CustCountry, CustHomePhone, CustBusPhone, CustEmail, AgentId) '
                    +'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                values = [
                    req.body.customerUUID, req.body.CustFirstName, req.body.CustLastName, req.body.CustPostal, req.body.CustAddress,
                    req.body.CustCity, req.body.CustProv, req.body.CustCountry, req.body.CustHomePhone, req.body.CustBusPhone,
                    req.body.CustEmail, req.body.AgentId
                ];
                // res.render('404', {message: 'Unable to process your order. Please call 403-555-5555 for assistance!'});
            } else {
                console.log('The user exists, there was at least one result:');
                console.log(results);
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
                            console.log('Values to insert:');
                            console.log(values);
                            queries.get(sql, values, (err, results, fields) => {
                                if (err) {
                                    console.error(err);
                                    res.render('404', {message: 'Unable to process your order. Please call 403-555-5555 for assistance!'});
                                } else {
                                    console.log(results);
                                    console.log(`Affected rows for bookings: ${results.affectedRows}`);
                                    res.render('vacations/process', {pageTitle: ' - Order placed!', orderDetails: req.body});
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    //
    // if (req.body.customerUUID === '') {
    //     req.body.customerUUID = crypto.randomUUID();
    //     sql = 'INSERT INTO customers (CustomerUUID, CustFirstName, CustLastName, CustPostal, CustAddress, '
    //         +'CustCity, CustProv, CustCountry, CustHomePhone, CustBusPhone, CustEmail, AgentId) '
    //         +'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    //     values = [
    //         req.body.customerUUID, req.body.CustFirstName, req.body.CustLastName, req.body.CustPostal, req.body.CustAddress,
    //         req.body.CustCity, req.body.CustProv, req.body.CustCountry, req.body.CustHomePhone, req.body.CustBusPhone,
    //         req.body.CustEmail, req.body.AgentId
    //     ];
    // } else {
    //     sql = 'UPDATE customers SET CustFirstName=?, CustLastName=?, CustPostal=?, CustAddress=?, '+
    //         'CustCity=?, CustProv=?, CustCountry=?, CustHomePhone=?, CustBusPhone=?, CustEmail=?, AgentId=? '+
    //         'WHERE CustomerUUID=?';
    //     values = [
    //         req.body.CustFirstName, req.body.CustLastName, req.body.CustPostal, req.body.CustAddress,
    //         req.body.CustCity, req.body.CustProv, req.body.CustCountry, req.body.CustHomePhone, req.body.CustBusPhone,
    //         req.body.CustEmail, req.body.AgentId, req.body.customerUUID
    //     ];
    // }
    //
    // console.log(req.body);
    // console.log(values);
});
module.exports = router;