const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const fm = require('../utilities/fm');
const path = require('path');

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
    });
});
router.get('/order', (req, res) => {
    console.log(typeof req.query);
    res.render('vacations/order', {params: req.query, pageTitle: '- Order a Vacation Package'});
});

module.exports = router;