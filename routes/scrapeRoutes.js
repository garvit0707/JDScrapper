const express = require('express');
const { scrapeAll, triggerScrape } = require('../controller/scrapeController');
const router = express.Router();

router.get('/', scrapeAll);
router.post('/trigger', triggerScrape);

module.exports = router;
