const mysql = require('mysql');

const api = module.exports = {};

api.get = function(query, callback) {
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
            conn.query(query, (err, results, fields) => {
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
            });
        }
    });
};