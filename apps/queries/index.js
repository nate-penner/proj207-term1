/*
* apps/queries
* Description:
*   Simplifies the handling of SQL queries and handling the connection.end() smoothly
* Author: Nate Penner
* When: December 2021
* */

const mysql = require('mysql');     // for SQL queries

// Export the API
const api = module.exports = {};

// Performs an SQL query and runs the callback with the results
//
// Possible function signatures:
// api.get(query, callback) - performs a query and calls back with (err, results, fields)
// api.get(query, args, callback) - performs a query as a prepared statement, inserting args into query, then
//                                  calls back with (err, results, fields)
api.get = function(query, args, callback) {
    let isPrepared = false;

    if (Array.isArray(args) && typeof callback === 'function')
        isPrepared = true;

    if (!isPrepared)
        callback = args;

    // Create the SQl connection
    const conn = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    conn.connect((err) => {
        if (err)
            callback(err);
        else {
            if (isPrepared) {
                conn.query(query, args, queryCallback);
            } else {
                conn.query(query, queryCallback);
            }
        }
    });

    function queryCallback(err, results, fields) {
        if (err)
            callback(err);
        else {
            conn.end((err) => {
                if (err)
                    callback(err);
                else
                    callback(err, results, fields);
            });
        }
    }
};