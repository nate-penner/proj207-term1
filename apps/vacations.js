const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const fm = require('../utilities/fm');
const path = require('path');
const queries = require('./queries');

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

   /* const conn = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });
    conn.connect((err) => {
        if (err) {
            res.render('404', {message: 'Failed to load vacation packages!'});
        } else {
            conn.query('SELECT PackageId, PkgName, PkgDesc, PkgBasePrice FROM packages', (err, results, fields) => {
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
            });
        }
        conn.end((err) => {
            if (err)
                console.log(`Problem ending the connection: ${err}`);
        });
    });*/
});
router.get('/order', (req, res) => {
    queries.get(`SELECT PackageId, PkgName, PkgDesc, PkgBasePrice FROM packages`, (err, results, fields) => {
        if (!err) {
            if ('packageId' in req.query) {
                const validPackages = [];
                results.forEach((pkg) => validPackages.push(pkg.PackageId));
                console.log(`Valid packages: ${validPackages}`);
                console.log(`Selected package: ${req.query.packageId}`);
                console.log(results[req.query.packageId - 1]);
                if (req.query.packageId in validPackages) {
                    res.render('vacations/order', {params: results[req.query.packageId - 1], pageTitle: '- Order a Vacation Package'});
                    return;
                }
            }
        }

        res.redirect('/vacations');
    });
});
router.post('/order', (req, res) => {
    queries.get('SELECT CustomerUUID FROM customers', (err, uuids, fields) => {
        if (err) {
            res.render('404', {message: 'Sorry, we are unable to process your request at this time! Please call (403)-555-5555 for assistance!'});
        } else {
            const validUUIDs = [];
            uuids.forEach((uuid) => validUUIDs.push(uuid.CustomerUUID));
            console.log('Valid uuids:');
            console.log(validUUIDs);
            queries.get('SELECT PackageId FROM packages', (err, packageIds, fields) => {
                if (err) {
                    res.render('404', {message: 'Sorry, we are unable to process your request at this time! Please call (403)-555-5555 for assistance!'});
                } else {
                    const validPackages = [];
                    packageIds.forEach((packageId) => validPackages.push(packageId.PackageId));

                    function validRange(num) {
                        try {
                            return parseInt(num) <= 10 && parseInt(num) >= 1;
                        } catch (e) {
                            return false;
                        }
                    }

                    // Validate
                    if (req.body.packageId in validPackages && validRange(req.body.guests)) {
                        console.log(`The customer's uuid is ${req.body.customerUUID}`);
                        console.log(validUUIDs.includes(req.body.customerUUID));
                        if (validUUIDs.includes(req.body.customerUUID)) {
                            // Customer is already registered
                            queries.get(`SELECT * FROM customers WHERE CustomerUUID='${req.body.customerUUID}'`, (err, results, fields) => {
                                if (err) {
                                    res.render('404', {message: 'Something went wrong with your order. Please call (403)-555-5555 for assistance!'})
                                } else {
                                    console.log(results);
                                    res.render('vacations/process', {orderDetails: results[0], pageTitle: '- Order processed!'});
                                }
                            });
                        } else {
                            // New customer
                            res.render('register', {orderDetails: req.body});
                        }
                    } else {
                        res.render('404', {message: 'Something went wrong with your order. Please call (403)-555-5555 for assistance!'});
                    }
                }
            });
        }
    });
});
module.exports = router;