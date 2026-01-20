// test-scraper.js - Utility to test individual scrapers
const { scrapeSingleSite, scrapeJobs } = require('./scraper');

async function testSite(siteName) {
  console.log(`\n🧪 Testing ${siteName} scraper...\n`);
  
  try {
    const jobs = await scrapeSingleSite(siteName);
    
    console.log(`\n✅ Test completed for ${siteName}`);
    console.log(`Found ${jobs.length} jobs\n`);
    
    if (jobs.length > 0) {
      console.log("Sample job:");
      console.log(JSON.stringify(jobs[0], null, 2));
    }
    
    return jobs;
  } catch (error) {
    console.error(`\n❌ Test failed for ${siteName}:`, error.message);
    return [];
  }
}

async function testAll() {
  console.log("\n🧪 Testing all scrapers...\n");
  
  const sites = ['naukri', 'indeed', 'glassdoor', 'linkedin'];
  const results = {};
  
  for (const site of sites) {
    results[site] = await testSite(site);
    
    // Delay between tests
    if (site !== sites[sites.length - 1]) {
      console.log("\n⏳ Waiting 5s before next test...\n");
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(50));
  for (const [site, jobs] of Object.entries(results)) {
    const status = jobs.length > 0 ? "✅" : "❌";
    console.log(`${status} ${site.padEnd(12)}: ${jobs.length} jobs`);
  }
  console.log("=".repeat(50) + "\n");
}

// Run tests
const args = process.argv.slice(2);

if (args.length === 0) {
  // Test all
  testAll();
} else if (args[0] === 'all') {
  // Full scrape
  scrapeJobs();
} else {
  // Test specific site
  testSite(args[0]);
}

// Usage:
// node test-scraper.js              -> Test all sites individually
// node test-scraper.js naukri        -> Test only Naukri
// node test-scraper.js all           -> Run full scrape