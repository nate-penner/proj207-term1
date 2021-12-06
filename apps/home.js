const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const {randRange} = require('../utilities');

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
            conn.query('SELECT PackageId, PkgName, PkgDesc, PkgBasePrice FROM packages', (err, results, fields) => {
                console.log(results);
                if (err || results.length < 1)
                    res.render('main', {pageTitle: ''});
                else
                    res.render('main', {pageTitle: '', featuredPackage: results[0]});

                conn.end((err) => {
                    if (err)
                        console.log(`Problem ending the connection: ${err}`);
                });
            });
        }
    });
});

module.exports = router;