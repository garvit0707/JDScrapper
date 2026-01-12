const { scrapeJobs } = require("../utils/scraper");
const JobPost = require("../model/JobPost");
const { sendDailyJobEmail } = require("../utils/emailScheduler");

exports.scrapeAll = async (req, res) => {
  try {
    // First, trigger scraping to update DB with new jobs
    await scrapeJobs();
    // Send email with scraped jobs
    await sendDailyJobEmail();
    // Then, fetch all jobs from DB
    const jobs = await JobPost.find({});
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// foundit,naukri,linkedin,glassdor,hirist,instahire