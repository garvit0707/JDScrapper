const { scrapeJobs } = require("../utils/scraper");
const JobPost = require("../model/JobPost");
const { sendDailyJobEmail } = require("../utils/emailScheduler");

exports.scrapeAll = async (req, res) => {
  try {
    // Fetch all jobs from DB
    const jobs = await JobPost.find({});
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
