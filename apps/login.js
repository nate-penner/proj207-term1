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
            res.render('login/success', {customerInfo: customer, pageTitle: `- Welcome, ${customer.CustFirstName}!`});
        }
    });
});

module.exports = router;