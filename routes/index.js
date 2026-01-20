const express = require('express');
const router = express.Router();

router.get('/', async function(req, res) {

  const JobPost = require('../model/JobPost');

  const jobs = await JobPost.find().limit(5);

  // res.json({
  //   message: "Server Working ✅",
  //   sampleJobs: jobs
  // });
  res.send('Server is up and running! Here are some sample jobs: ');

});

module.exports = router;
