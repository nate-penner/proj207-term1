const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const app = express();

router.get('/', (req, res) => {
    res.render('register', {pageTitle: 'Vacation Packages'});
});

module.exports = router;

//load the body-parser module to convert the data in the request body into an object
const bodyParser = require("body-parser");

let errorMessage;
function verifyData(customer)
{
    errorMessage = "";
    if (customer.CustFirstName == "")
    {
        errorMessage += "CustFirstName must have a value<br />";
    }
    if (customer.CustLastName == "")
    {
        errorMessage += "CustLastName must have a value<br />";
    }
    if (customer.CustPostal == "")
    {
        errorMessage += "CustPostal must have a value<br />";
    }
    if (customer.CustAddress == "")
    {
        errorMessage += "CustAddress must have a value<br />";
    }
    if (customer.CustCity == "")
    {
        errorMessage += "CustCity must have a value<br />";
    }
    if (customer.CustProv == "")
    {
        errorMessage += "CustProv must have a value<br />";
    }
    if (customer.CustCountry == "")
    {
        errorMessage += "CustCountry must have a value<br />";
    }
    if (customer.CustHomePhone == "")
    {
        errorMessage += "CustHomePhone must have a value<br />";
    }
    if (customer.CustBusPhone == "")
    {
        errorMessage += "CustBusPhone must have a value<br />";
    }
    if (customer.CustEmail == "")
    {
        errorMessage += "CustEmail must have a value<br />";
    }
    if (customer.AgentId == "")
    {
        errorMessage += "AgentId must have a value<br />";
    }

    if (errorMessage)
    {
        return false;
    }
    else
    {
        return true;
    }
}

// convert form data into JSON object
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/register", (req, res)=>{
    res.sendFile(__dirname + "/register.ejs", function (err) {
        if (err) throw err; // Pass errors to Express.
    });
});

app.post("/newcustomer", (req, res)=>{
    //pass the request body to a verification function, and if it is okay, update the database
    console.log("Body: " + req.body);
    if (verifyData(req.body))
    {
        let conn = mysql.createConnection({
            host: "localhost",
            user: "travelexperts",
            password: "12345",
            database: "travelexperts"
        });
        conn.connect((err)=>{
            if (err) throw err;
            let sql = "INSERT INTO customers (CustFirstName, CustLastName, CustAddress,"
                + " CustCity, CustProv, CustPostal, CustCountry, CustHomePhone, CustBusPhone, CustEmail, AgentId)"
                + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            conn.query(sql, [req.body.CustFirstName, req.body.CustLastName, req.body.CustAddress,
                req.body.CustCity, req.body.CustProv, req.body.CustPostal, req.body.CustCountry, req.body.CustHomePhone,
                req.body.CustBusPhone, req.body.CustEmail, req.body.AgentId], function (err, result) {
                if (err) throw err;
                console.log(result.affectedRows + " record(s) inserted");
                res.send(result.affectedRows + " record(s) inserted");
                conn.end(function(err) {
                    if (err) throw err;
                });
            });
        });
    }
    else
    {
        res.send(errorMessage);
    }

});