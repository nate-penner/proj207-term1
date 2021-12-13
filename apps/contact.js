/*
* Agency contact app
* Author: Gurjeet Kaur Pawar
* When: December 2021
* */
const express = require('express');
const router = express.Router();
const mysql = require('mysql');

//Create connection
const db = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Handles the route for /contact
router.get("/",(req, res) =>{

    var agencies = [];
    var agents = [];

    db.connect(function(err) {
        db.query("SELECT * FROM agencies", function (err, result, fields) {
            if (err) throw err;
            for(var i=0;i < result.length;i++){
                var agency = {
                    "AgencyId": result[i].AgencyId,
                    "AgencyAdd": result[i].AgncyAddress,
                    "AgencyCity": result[i].AgncyCity,
                    "AgencyProv": result[i].AgncyProv,
                    "AgencyPostal": result[i].AgncyPostal,
                    "AgencyCountry": result[i].AgncyCountry,
                    "AgencyPhoneNo": result[i].AgncyPhone,
                    "AgencyFax": result[i].AgncyFax,
                };

                agencies.push(agency);
            }
            db.query("SELECT * FROM agents", function (err3, result3, fields3) {
                if (err3) throw err3;
                for(var i=0;i <result3.length;i++){
                    var agent = {
                        "AgencyId": result3[i].AgencyId,
                        "FirstName": result3[i].AgtFirstName,
                        "LastName": result3[i].AgtLastName,
                        "PhoneNo": result3[i].AgtBusPhone,
                        "Email": result3[i].AgtEmail,
                    };
                    agents.push(agent);
                }
                res.render("contact",{'agencies': agencies,'agents':agents});
            });
        });
    });
});

// Export the router
module.exports = router;