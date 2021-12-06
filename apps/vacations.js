const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const fm = require('../utilities/fm');
const path = require('path');
const queries = require('./queries');

// I got angry with WebStorm
router.get('/', (req, res) => {
    queries.get('SELECT PackageId, PkgName, PkgDesc, PkgBasePrice FROM packages', (err, results, fields) => {
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
    queries.get(`SELECT PackageId, PkgName, PkgDesc, PkgBasePrice FROM packages`, (err, results, fields) => {
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
                    if (req.body.packageId in validPackages && validRange(req.body.guests)) {
                        console.log(`The customer's uuid is ${req.body.customerUUID}`);
                        console.log(validUUIDs.includes(req.body.customerUUID));

                        if (validUUIDs.includes(req.body.customerUUID)) {
                            // If the customer is already registered, then pull their info from the database and process
                            // the order
                            queries.get(`SELECT * FROM customers WHERE CustomerUUID='${req.body.customerUUID}'`, (err, results, fields) => {
                                if (err || results.length !== 1) {
                                    res.render('404', {message: 'Something went wrong with your order. Please call (403)-555-5555 for assistance!'})
                                } else {
                                    results[0].packageDetails = req.body;
                                    console.log(results);
                                    res.render('register-copy', {orderDetails: results[0], pageTitle: '- Order processed!'});
                                }
                            });
                        } else {
                            // If it's a new customer, then redirect them to the registration page and pass along
                            // the order details
                            console.log(req.body);
                            res.render('register-copy', {pageTitle: ' - Customer Registration', orderDetails: {packageDetails: req.body}, foo: 'bar'});
                        }
                    } else {
                        res.render('404', {message: 'Something went wrong with your order. Please call (403)-555-5555 for assistance!'});
                    }
                }
            });
        }
    });
});

// process an order
router.post('/process', (req, res) => {
    console.log(req.body);
    res.render('vacations/process', {pageTitle: ' - Order placed!', orderDetails: req.body});
});
module.exports = router;