const express = require('express');
const router = express.Router();
const JobPost = require('../model/JobPost');
const {scrapeAll, getStatus, resetCooldown } = require('../controller/jobController');
router.get('/', async (req, res) => {
  const jobs = await JobPost.find();

  res.json({
    count: jobs.length,
    data: jobs
  });
  
});

router.post('/scrape', scrapeAll);
router.get('/status', getStatus);
router.post('/reset', resetCooldown);

module.exports = router;
