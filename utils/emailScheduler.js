const { scrapeJobs } = require("./scraper");
const { sendJobEmail } = require("./mailer");
const generateJobHTML = require("./jobEmailTemplate");

async function sendDailyJobEmail() {
  try {
    console.log("Starting daily job scraping and email sending...");
    const jobs = await scrapeJobs();
    if (jobs.length === 0) {
      console.log("No jobs found, skipping email.");
      return;
    }
    const htmlContent = generateJobHTML(jobs);
    await sendJobEmail(htmlContent);
    console.log("Daily job email sent successfully.");
  } catch (error) {
    console.error("Error sending daily job email:", error);
  }
}

module.exports = { sendDailyJobEmail };
