const express = require('express');
const router = express.Router();
const mysql = require('mysql');

router.get('/', (req, res) => {
    const conn = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });
    conn.connect((err) => {
        if (err) {
            res.render('404', {message: 'Failed to load vacation packages!'});
        } else {
            conn.query('SELECT PackageId, PkgName, PkgDesc, PkgBasePrice FROM packages', (err, result, fields) => {
                console.log(result);
                result.forEach((result) => {
                    console.log(result);
                })
                if (err || result.length < 1)
                    res.render('404', {message: 'Failed to load vacation packages!'});
                else {
                    res.render('vacations/home', {pageTitle: 'Vacation Packages', vacations: result});
                }
            });
        }
        conn.end((err) => {
            if (err)
                console.log(`Problem ending the connection: ${err}`);
        });
    });
});

module.exports = router;