const { scrapeJobs } = require('./utils/scraper');

async function testScraper() {
  console.log('Testing scraper...');
  try {
    const jobs = await scrapeJobs();
    console.log('Scraped jobs:', jobs.length);
    console.log('Jobs:', jobs);
  } catch (error) {
    console.error('Error:', error);
  }
}

testScraper();
