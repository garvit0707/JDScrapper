const express = require('express');
const router = express.Router();
const JobPost = require('../model/JobPost');
const { scrapeJobs } = require('../utils/scraper');

router.get('/', async (req, res) => {
  try {
    console.log("🚀 Scrape route hit");

    // 0️⃣ Clear all MongoDB data for fresh scrape (uncomment if you want to clear each time)
    await JobPost.deleteMany({});
    console.log("🗑️  Cleared existing jobs from DB");

    // 1️⃣ scrape jobs
    const scraped = await scrapeJobs();
    console.log(`📊 Scraped ${scraped.length} jobs`);
    let savedNew = 0;

    // 2️⃣ save to DB (no duplicate check since we cleared)
    for (const job of scraped) {
      try {
        const newJob = new JobPost({
          ...job,
          scrapedAt: new Date()
        });
        await newJob.save();
        savedNew++;
        console.log(`✅ Saved job: ${job.title} - ${job.company}`);
      } catch (saveError) {
        console.error(`❌ Error saving job ${job.title}:`, saveError.message);
      }
    }

    console.log(`💾 Saved ${savedNew} new jobs to DB`);

    // 3️⃣ fetch all jobs from DB (latest 10)
    // const allJobs = await JobPost.find().sort({ scrapedAt: -1 }).limit(10);
    const allJobs = await JobPost.find().sort({ scrapedAt: -1 });
    const totalInDB = await JobPost.countDocuments();
    console.log(`📋 Returning ${allJobs.length} latest jobs from DB`);

    res.json({
      success: true,
      scraped: scraped.length,
      savedNew,
      totalInDB,
      data: allJobs
    });

  } catch (err) {
    console.error("SCRAPE ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
