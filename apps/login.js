const express = require('express');
const router = express.Router();
const queries = require('./queries');

router.get('/', (req, res) => {
    res.render('login/home', {pageTitle: '- Login'});
});

router.post('/', (req, res) => {
    let sql = 'SELECT * FROM customers WHERE CustomerUUID=?';
    let values = [req.body.customerUUID];
    queries.get(sql, values, (err, results, fields) => {
        console.log('Login attempted');
        console.log(req.body);
        if (err || results.length !== 1) {
            console.log(err);
            res.render('login/failure', {pageTitle: '- Failed login attempt'});
        } else {
            const customer = results[0];
            console.log(customer);
            sql = 'SELECT * FROM bookings INNER JOIN packages ON bookings.PackageId=packages.PackageId WHERE CustomerId=?';
            values = [customer.CustomerId];
            queries.get(sql, values, (err, results, fields) => {
                if (err) {
                    console.error(err);
                    res.render(
                        'profile/home',
                        {errorMessage: `Sorry, ${customer.CustFirstName}, we had some trouble retrieving your bookings. Please contact us at 403-555-5555 for assistance! We are happy to assist you.`,
                            customerInfo: customer, pageTitle: `- Welcome, ${customer.CustFirstName}!`});
                } else {
                    console.log('BOOKINGS');
                    results = results.filter(booking => booking.PackageId !== null);
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

module.exports = router;