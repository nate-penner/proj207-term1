const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('profile/home', {pageTitle: '- Profile'});
});

module.exports = router;