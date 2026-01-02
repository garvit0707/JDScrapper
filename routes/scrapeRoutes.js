const express = require('express');
const { scrapeAll } = require('../controller/scrapeController');
const router = express.Router();

router.get('/', scrapeAll); 

module.exports = router;
