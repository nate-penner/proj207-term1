const mysql = require('mysql');

const api = module.exports = {};

api.get = function(query, args, callback) {
    let isPrepared = false;

    if (Array.isArray(args) && typeof callback === 'function')
        isPrepared = true;

    if (!isPrepared)
        callback = args;

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