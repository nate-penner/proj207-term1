const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('contact', {pageTitle: 'Vacation Packages'});
});

module.exports = router;