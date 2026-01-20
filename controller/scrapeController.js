// const { scrapeJobs } = require("../utils/scraper");
// const JobPost = require("../model/JobPost");
// const { sendDailyJobEmail } = require("../utils/emailScheduler");

// exports.scrapeAll = async (req, res) => {
//   try {
//     // Check DB connection
//     const mongoose = require('mongoose');
//     console.log("DB connection state:", mongoose.connection.readyState); // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
//     if (mongoose.connection.readyState !== 1) {
//       console.error("DB not connected");
//        console.log("DB connecting, waiting 1s...");
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       return res.status(500).json({ error: "Database not connected" });
//     }
//     // Fetch all jobs from DB
//     const jobs = await JobPost.find({});
//     console.log(`Fetched ${jobs.length} jobs from DB`);
//     res.json(jobs);
//   } catch (error) {
//     console.error("Error fetching jobs:", error);
//     res.status(500).json({ error: "Failed to fetch jobs" });
//   }
// };



// // foundit,naukri,linkedin,glassdor,hirist,instahire

// const { scrapeJobs } = require("../utils/scraper");
// const JobPost = require("../model/JobPost");

// // MAIN SCRAPE ROUTE
// exports.scrapeAll = async (req, res) => {
//   try {
//     console.log("🚀 Scrape route hit");

//     // 1. Run scraper
//     const scrapedData = await scrapeJobs();

//     console.log("Scraped items:", scrapedData.length);

//     // 2. Save to DB
//     let savedCount = 0;

//     for (const job of scrapedData) {
//       const exists = await JobPost.findOne({
//         title: job.title,
//         company: job.company
//       });

//       if (!exists) {
//         await JobPost.create(job);
//         savedCount++;
//       }
//     }

//     // 3. Fetch all
//     const allJobs = await JobPost.find().sort({ _id: -1 });

//     res.json({
//       success: true,
//       scraped: scrapedData.length,
//       savedNew: savedCount,
//       totalInDB: allJobs.length,
//       data: allJobs
//     });

//   } catch (error) {
//     console.error("SCRAPE ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


// const { scrapeJobs } = require("../utils/scraper");
// const JobPost = require("../model/JobPost");

// exports.scrapeAll = async (req, res) => {
//   try {
//     console.log("🚀 Scrape route hit");

//     const scrapedData = await scrapeJobs();

//     let savedCount = 0;

//     for (const job of scrapedData) {
//       const exists = await JobPost.findOne({
//         title: job.title,
//         company: job.company
//       });

//       if (!exists) {
//         await JobPost.create(job);
//         savedCount++;
//       }
//     }

//     const allJobs = await JobPost.find().sort({ _id: -1 });

//     res.json({
//       success: true,
//       scraped: scrapedData.length,
//       savedNew: savedCount,
//       totalInDB: allJobs.length,
//       data: allJobs
//     });

//   } catch (error) {
//     console.error("SCRAPE ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


// const { scrapeJobs } = require("../utils/scraper");
// const JobPost = require("../model/JobPost");

// exports.scrapeAll = async (req, res) => {
//   try {
//     console.log("🚀 Scrape route hit");

//     const scrapedData = await scrapeJobs();

//     console.log("Scraped items:", scrapedData.length);

//     let savedCount = 0;

//     for (const job of scrapedData) {

//       // BETTER UNIQUE LOGIC
//       const exists = await JobPost.findOne({
//         title: job.title,
//         link: job.link        // UNIQUE BY LINK
//       });

//       if (!exists) {
//         await JobPost.create({
//           ...job,
//           scrapedAt: new Date()
//         });

//         savedCount++;
//       }
//     }

//     // RETURN SCRAPED DATA DIRECTLY
//     res.json({
//       success: true,
//       scraped: scrapedData.length,
//       savedNew: savedCount,
//       data: scrapedData
//     });

//   } catch (error) {
//     console.error("SCRAPE ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };



const { scrapeJobs } = require("../utils/scraper");
const JobPost = require("../model/JobPost");

// Cache to prevent duplicate scrapes within time window
const scrapeCache = {
  lastScrape: null,
  cooldownMs: 5 * 60 * 1000, // 5 minutes
  isScrapingNow: false
};

exports.scrapeAll = async (req, res) => {
  try {
    const now = Date.now();
    
    // Check if already scraping
    if (scrapeCache.isScrapingNow) {
      return res.status(429).json({
        success: false,
        message: "Scraping already in progress. Please wait.",
        isScrapingNow: true
      });
    }
    
    // Check cooldown
    if (scrapeCache.lastScrape && (now - scrapeCache.lastScrape) < scrapeCache.cooldownMs) {
      const waitTime = Math.ceil((scrapeCache.cooldownMs - (now - scrapeCache.lastScrape)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitTime} seconds before scraping again`,
        waitSeconds: waitTime
      });
    }

    console.log("🚀 Scrape route triggered at", new Date().toISOString());
    
    // Mark as scraping
    scrapeCache.isScrapingNow = true;
    scrapeCache.lastScrape = now;

    // Run scraper
    const scrapedData = await scrapeJobs();

    console.log("📊 Total scraped items:", scrapedData.length);

    // Validate jobs
    const validJobs = scrapedData.filter(job => {
      const isValid = job.title && 
                     job.link && 
                     job.source &&
                     job.title.length > 3 &&
                     job.link.startsWith('http');
      
      if (!isValid) {
        console.log(`⚠️  Filtered invalid job:`, job);
      }
      
      return isValid;
    });

    console.log("✅ Valid jobs after filtering:", validJobs.length);

    // Prepare stats
    const stats = {
      totalScraped: scrapedData.length,
      validJobs: validJobs.length,
      invalidJobs: scrapedData.length - validJobs.length,
      savedNew: 0,
      duplicates: 0,
      errors: 0,
      breakdown: {
        naukri: { scraped: 0, saved: 0, duplicates: 0 },
        indeed: { scraped: 0, saved: 0, duplicates: 0 },
        glassdoor: { scraped: 0, saved: 0, duplicates: 0 },
        linkedin: { scraped: 0, saved: 0, duplicates: 0 }
      }
    };

    // Count scraped by source
    scrapedData.forEach(job => {
      const source = job.source.toLowerCase();
      if (stats.breakdown[source]) {
        stats.breakdown[source].scraped++;
      }
    });

    // Save to database
    for (const job of validJobs) {
      try {
        // Check if job exists by link (most reliable identifier)
        const exists = await JobPost.findOne({ link: job.link });

        const source = job.source.toLowerCase();

        if (!exists) {
          await JobPost.create({
            title: job.title,
            company: job.company || "Not specified",
            location: job.location || "Not specified",
            experience: job.experience || "",
            description: job.description || "",
            tags: job.tags || [],
            posted: job.posted || "Recently",
            link: job.link,
            source: job.source,
            scrapedAt: new Date()
          });
          
          stats.savedNew++;
          if (stats.breakdown[source]) {
            stats.breakdown[source].saved++;
          }
        } else {
          stats.duplicates++;
          if (stats.breakdown[source]) {
            stats.breakdown[source].duplicates++;
          }
        }
      } catch (dbError) {
        console.error(`❌ DB Error saving job:`, {
          title: job.title,
          error: dbError.message
        });
        stats.errors++;
      }
    }

    // Mark scraping as complete
    scrapeCache.isScrapingNow = false;

    console.log("\n" + "=".repeat(50));
    console.log("💾 DATABASE SAVE SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ Saved: ${stats.savedNew} new jobs`);
    console.log(`🔄 Skipped: ${stats.duplicates} duplicates`);
    console.log(`❌ Errors: ${stats.errors}`);
    console.log("=".repeat(50) + "\n");

    // Send response
    res.json({
      success: true,
      message: `Scraped ${stats.totalScraped} jobs, saved ${stats.savedNew} new entries`,
      stats,
      timestamp: new Date().toISOString(),
      sampleJobs: validJobs.slice(0, 5) // Send first 5 as sample
    });

  } catch (error) {
    // Reset scraping flag on error
    scrapeCache.isScrapingNow = false;
    
    console.error("❌ SCRAPE ERROR:", error);
    console.error("Stack trace:", error.stack);

    res.status(500).json({
      success: false,
      message: "Scraping failed",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get scraping status
exports.getStatus = async (req, res) => {
  const now = Date.now();
  const canScrape = !scrapeCache.isScrapingNow && 
                   (!scrapeCache.lastScrape || (now - scrapeCache.lastScrape) >= scrapeCache.cooldownMs);
  
  let waitTime = 0;
  if (scrapeCache.lastScrape && !canScrape) {
    waitTime = Math.ceil((scrapeCache.cooldownMs - (now - scrapeCache.lastScrape)) / 1000);
  }
  
  res.json({
    isScrapingNow: scrapeCache.isScrapingNow,
    canScrape,
    lastScrape: scrapeCache.lastScrape ? new Date(scrapeCache.lastScrape).toISOString() : null,
    waitSeconds: waitTime
  });
};

// Manual reset (for admin/testing)
exports.resetCooldown = async (req, res) => {
  scrapeCache.lastScrape = null;
  scrapeCache.isScrapingNow = false;
  
  res.json({
    success: true,
    message: "Scrape cooldown reset"
  });
};