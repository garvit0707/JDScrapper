const { scrapeJobs } = require("../utils/scraper");
const JobPost = require("../model/JobPost");
const { sendDailyJobEmail } = require("../utils/emailScheduler");

exports.scrapeAll = async (req, res) => {
  try {
    // Check DB connection
    const mongoose = require('mongoose');
    console.log("DB connection state:", mongoose.connection.readyState); // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState !== 1) {
      console.error("DB not connected");
       console.log("DB connecting, waiting 1s...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(500).json({ error: "Database not connected" });
    }
    // Fetch all jobs from DB
    const jobs = await JobPost.find({});
    console.log(`Fetched ${jobs.length} jobs from DB`);
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

exports.triggerScrape = async (req, res) => {
  try {
    // Trigger scraping asynchronously
    scrapeJobs().then(() => {
      console.log("Scraping completed asynchronously");
    }).catch((error) => {
      console.error("Error in async scraping:", error);
    });
    res.json({ message: "Scraping triggered asynchronously" });
  } catch (error) {
    console.error("Error triggering scrape:", error);
    res.status(500).json({ error: "Failed to trigger scrape" });
  }
};

// foundit,naukri,linkedin,glassdor,hirist,instahire
