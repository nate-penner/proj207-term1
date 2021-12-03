const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('vacations/home', {pageTitle: 'Vacation Packages'});
});

module.exports = router;