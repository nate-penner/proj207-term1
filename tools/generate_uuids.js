/* A tool that adds a CustomerUUID field to the customers table and created UUID's for existing customers.
*
* IMPORTANT: Before running this script, give the travelexperts user ALTER permissions for the travelexperts database
* This only needs to be run if using the original travelexperts database from D2L. It only needs to be run once, and
* will probably crash if you run it again on the already modified database.
* Author: Nate Penner
* When: December 2021
* */
require('dotenv').config();
const mysql = require('mysql');
const crypto = require('crypto');

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

conn.connect((err) => {
    if (err)
        console.error(err);
    else {
        // get all users from the database
        conn.query('ALTER TABLE customers ADD CustomerUUID VARCHAR(144) NULL AFTER CustomerId', (err, results) => {
           if (err) {
               conn.end((err) => {
                   if (err)
                       console.error(err);
                   else
                       console.log('Connection closed');
               });
           }
           else {
               conn.query('SELECT CustomerId, CustomerUUID FROM customers WHERE CustomerUUID IS NULL', (err, results, fields) => {
                   if (err) {
                       console.error(err);
                       conn.end((err) => {
                           if (err)
                               console.error(err);
                           else
                               console.log('Connection closed');
                       });
                   } else {
                       console.log(`${results.length} results found.`);

                       // Use recursion to execute UUID insertions sequentially (to avoid ending the connection before
                       // queries have been queued)
                       (function insertUUID(users, index, callback) {
                           if (index < users.length) {
                               const uuid = crypto.randomUUID();
                               conn.query(`UPDATE customers SET CustomerUUID='${uuid}' WHERE CustomerId=${users[index].CustomerId}`, (err) => {
                                   if (err) {
                                       conn.end((err) => {
                                           callback(err);
                                       });
                                   } else {
                                       insertUUID(users, index + 1, callback);
                                   }
                               });
                           } else {
                               conn.end((err) => {
                                   callback(err);
                               });
                           }
                       })(results, 0, (err) => {
                           if (err)
                               console.error(err);
                           else
                               console.log('Connection closed.');
                       });
                   }
               });
           }
        });
    }
})