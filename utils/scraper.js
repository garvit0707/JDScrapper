// const axios = require("axios");
// const cheerio = require("cheerio");

// function isToday(text) {
//   if (!text) return false;

//   text = text.toLowerCase();

//   // Check for keywords indicating recent posting
//   if (
//     text.includes("today") ||
//     text.includes("just") ||
//     text.includes("1 day") ||
//     text.includes("1d") ||
//     text.includes("few hours") ||
//     text.includes("hours ago") ||
//     text.includes("1h") ||
//     text.includes("2h") ||
//     text.includes("3h") ||
//     text.includes("4h") ||
//     text.includes("5h") ||
//     text.includes("6h") ||
//     text.includes("7h") ||
//     text.includes("8h") ||
//     text.includes("9h") ||
//     text.includes("10h") ||
//     text.includes("11h") ||
//     text.includes("12h")
//   ) return true;

//   // Try to parse as date (for RSS feeds)
//   try {
//     const jobDate = new Date(text);
//     const today = new Date();
//     return jobDate.toDateString() === today.toDateString();
//   } catch {
//     return false;
//   }
// }

// function isIndia(loc) {
//   if (!loc) return false;

//   loc = loc.toLowerCase();

//   return (
//     loc.includes("india") ||
//     loc.includes("remote") ||
//     loc.includes("noida") ||
//     loc.includes("gurgaon") ||
//     loc.includes("bangalore") ||
//     loc.includes("hyderabad") ||
//     loc.includes("pune") ||
//     loc.includes("mumbai") ||
//     loc.includes("delhi")
//   );
// }

// async function scrapeJobs() {

//   let jobs = [];

//   // ================= NAUKRI =================
//   try {
//     const naukriUrl =
//       "https://www.naukri.com/react-native-jobs?sort=recency";

//     const res = await axios.get(naukriUrl, {
//       headers: {
//         "User-Agent": "Mozilla/5.0",
//       },
//     });

//     const $ = cheerio.load(res.data);

//     $(".job-tuple").each((i, el) => {
//       const title = $(el).find("a.title").text().trim();
//       const company = $(el).find("a.comp-name").text().trim();
//       const location = $(el).find(".locWdth").text().trim();
//       const posted = $(el).find(".job-post-day").text().trim();
//       const link = $(el).find("a.title").attr("href");

//       jobs.push({
//         title,
//         company,
//         location,
//         posted,
//         link,
//         source: "Naukri",
//       });
//     });

//   } catch (e) {
//     console.log("Naukri failed");
//   }

//   // ================= INDEED =================
//   try {
//     const indeedUrl =
//       "https://in.indeed.com/rss?q=react+native&l=India";

//     const res = await axios.get(indeedUrl);
//     const $ = cheerio.load(res.data, { xmlMode: true });

//     $("item").each((i, el) => {
//       const title = $(el).find("title").text();
//       const link = $(el).find("link").text();
//       const company = title.split("-")[1] || "";
//       const posted = $(el).find("pubDate").text();

//       jobs.push({
//         title,
//         company,
//         location: "India",
//         posted,
//         link,
//         source: "Indeed",
//       });
//     });

//   } catch (e) {
//     console.log("Indeed failed");
//   }

//   // ================= LINKEDIN PUBLIC =================
//   try {
//     const linkedUrl =
//       "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=react%20native&location=India";

//     const res = await axios.get(linkedUrl);

//     const $ = cheerio.load(res.data);

//     $(".base-card").each((i, el) => {
//       const title = $(el)
//         .find(".base-search-card__title")
//         .text()
//         .trim();

//       const company = $(el)
//         .find(".base-search-card__subtitle")
//         .text()
//         .trim();

//       const location = $(el)
//         .find(".job-search-card__location")
//         .text()
//         .trim();

//       const posted = $(el)
//         .find("time")
//         .text()
//         .trim();

//       const link = $(el)
//         .find("a.base-card__full-link")
//         .attr("href");

//       jobs.push({
//         title,
//         company,
//         location,
//         posted,
//         link,
//         source: "LinkedIn",
//       });
//     });

//   } catch (e) {
//     console.log("LinkedIn failed");
//   }

//   // ================= GLASSDOOR =================
//   try {
//     const glassUrl =
//       "https://www.glassdoor.co.in/Job/india-react-native-jobs-SRCH_IL.0,5_IN1_KO6,18.htm";

//     const res = await axios.get(glassUrl, {
//       headers: { "User-Agent": "Mozilla/5.0" },
//     });

//     const $ = cheerio.load(res.data);

//     $(".jobCard").each((i, el) => {
//       const title = $(el)
//         .find("a.JobCard_jobTitle")
//         .text()
//         .trim();

//       const company = $(el)
//         .find(".EmployerProfile_compactEmployerName")
//         .text()
//         .trim();

//       const location = $(el)
//         .find("[id^='job-location']")
//         .text()
//         .trim();

//       const posted = $(el)
//         .find(".JobCard_listingAge")
//         .text()
//         .trim();

//       const link = $(el)
//         .find("a")
//         .attr("href");

//       jobs.push({
//         title,
//         company,
//         location,
//         posted,
//         link,
//         source: "Glassdoor",
//       });
//     });

//   } catch (e) {
//     console.log("Glassdoor failed");
//   }

//   // ========== FINAL FILTER ==========

//   const final = jobs.filter(
//     j => isIndia(j.location) && isToday(j.posted)
//   );

//   console.log("TOTAL SCRAPED JOBS:", jobs.length);
//   console.log("FILTERED JOBS (India + Today):", final.length);
//   console.log("SAMPLE FILTERED JOBS:", final.slice(0, 3)); // Log first 3 filtered jobs

//   return jobs;
// }

// module.exports = { scrapeJobs };

// this is the working scrappper till now

// const puppeteer = require("puppeteer");

// async function scrapeNaukri(page) {
//   await page.goto(
//     "https://www.naukri.com/react-native-jobs?sort=recency",
//     { waitUntil: "networkidle2" }
//   );

//   return await page.evaluate(() => {
//     let arr = [];

//     document.querySelectorAll(".cust-job-tuple").forEach(el => {
//       arr.push({
//         title: el.querySelector(".title")?.innerText,
//         company: el.querySelector(".comp-name")?.innerText,
//         location: el.querySelector(".locWdth")?.innerText,
//         posted: el.querySelector(".job-post-day")?.innerText,
//         link: el.querySelector(".title")?.href,
//         source: "Naukri"
//       });
//     });

//     return arr;
//   });
// }

// async function scrapeIndeed(page) {

//   await page.goto(
//     "https://in.indeed.com/jobs?q=react+native&l=India",
//     { waitUntil: "networkidle2", timeout: 0 }
//   );

//   // scroll for lazy load
//   await page.evaluate(() => window.scrollBy(0, 1000));
//   await page.waitForTimeout(2000);

//   return await page.evaluate(() => {

//     let arr = [];

//     document.querySelectorAll('[data-testid="jobTitle"]').forEach(el => {

//       const card = el.closest('.cardOutline');

//       arr.push({
//         title: el.innerText,
//         company: card?.querySelector('[data-testid="company-name"]')?.innerText,
//         location: card?.querySelector('[data-testid="text-location"]')?.innerText,
//         posted: card?.querySelector('.date')?.innerText,
//         link: "https://in.indeed.com" + el.getAttribute("href"),
//         source: "Indeed"
//       });

//     });

//     return arr;
//   });
// }

// async function scrapeGlassdoor(page) {
//   await page.goto(
//     "https://www.glassdoor.co.in/Job/india-react-native-jobs-SRCH_IL.0,5_IN1_KO6,18.htm",
//     { waitUntil: "networkidle2" }
//   );

//   return await page.evaluate(() => {
//     let arr = [];

//     document.querySelectorAll(".jobCard").forEach(el => {
//       arr.push({
//         title: el.querySelector(".jobTitle")?.innerText,
//         company: el.querySelector(".employerName")?.innerText,
//         location: el.querySelector(".location")?.innerText,
//         posted: el.querySelector(".listingAge")?.innerText,
//         link: el.querySelector("a")?.href,
//         source: "Glassdoor"
//       });
//     });

//     return arr;
//   });
// }

// async function scrapeJobs() {

//   const browser = await puppeteer.launch({
//     headless: true,
//     args: [
//       "--no-sandbox",
//       "--disable-setuid-sandbox"
//     ]
//   });

//   const page = await browser.newPage();

//   await page.setUserAgent(
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
//   );

//   let allJobs = [];

//   try {
//     const naukri = await scrapeNaukri(page);
//     console.log("Naukri:", naukri.length);
//     allJobs.push(...naukri);
//   } catch {}

//   try {
//     const indeed = await scrapeIndeed(page);
//     console.log("Indeed:", indeed.length);
//     allJobs.push(...indeed);
//   } catch (e) {
//     console.log("Indeed failed", e.message);
//   }

//   await browser.close();

//   return allJobs;
// }

// module.exports = { scrapeJobs };


const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

// Enhanced user agents
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0"
];

// Helper functions
const randomDelay = (min = 1000, max = 3000) => 
  new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

async function humanScroll(page, scrolls = 3) {
  for (let i = 0; i < scrolls; i++) {
    await page.evaluate((scrollY) => {
      window.scrollBy({
        top: scrollY,
        behavior: 'smooth'
      });
    }, Math.floor(Math.random() * 300) + 200);
    await randomDelay(800, 1500);
  }
}

async function waitForAnySelector(page, selectors, timeout = 30000) {
  const promises = selectors.map(selector => 
    page.waitForSelector(selector, { timeout }).catch(() => null)
  );
  return Promise.race(promises);
}

async function checkForCaptcha(page) {
  const captchaIndicators = await page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    const hasCaptchaText = text.includes('captcha') || 
                          text.includes('verify you are human') ||
                          text.includes('unusual traffic') ||
                          text.includes('access denied');
    const hasCaptchaElement = document.querySelector('[class*="captcha"], [id*="captcha"], .g-recaptcha') !== null;
    return hasCaptchaText || hasCaptchaElement;
  });
  
  if (captchaIndicators) {
    console.log("⚠️  CAPTCHA detected!");
    await page.screenshot({ path: `captcha-${Date.now()}.png` });
  }
  
  return captchaIndicators;
}

// ==================== NAUKRI SCRAPER ====================
async function scrapeNaukri(page) {
  console.log("🔍 Scraping Naukri...");

  let allJobs = [];

  try {
    // Scrape multiple pages (1 to 5)
    for (let pageNum = 1; pageNum <= 5; pageNum++) {
      console.log(`📄 Scraping Naukri page ${pageNum}...`);

      const url = pageNum === 1
        ? "https://www.naukri.com/react-native-jobs?sort=recency"
        : `https://www.naukri.com/react-native-jobs?sort=recency&page=${pageNum}`;

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await randomDelay(3000, 5000);

      // Check for CAPTCHA
      if (await checkForCaptcha(page)) {
        console.log("❌ Naukri: CAPTCHA detected, skipping page...");
        continue;
      }

      // Progressive scrolling to load content
      await humanScroll(page, 3);
      await randomDelay(2000, 3000);

      // Try multiple possible selectors
      const possibleSelectors = [
        '.cust-job-tuple',
        '.srp-jobtuple-wrapper',
        'article.jobTuple',
        '.jobTuple',
        '[class*="job"]'
      ];

      // Find which selector works
      let workingSelector = null;
      for (const selector of possibleSelectors) {
        const exists = await page.$(selector);
        if (exists) {
          workingSelector = selector;
          break;
        }
      }

      if (!workingSelector) {
        console.log(`❌ Naukri page ${pageNum}: No job listings found`);
        continue;
      }

      await randomDelay(2000, 3000);

      const jobs = await page.evaluate((selector) => {
        const arr = [];
        const jobCards = document.querySelectorAll(selector);

        jobCards.forEach((el) => {
          try {
            // Try multiple title selectors
            const titleSelectors = ['.title', 'a.title', '.jobTitle', 'h2 a', 'h3 a'];
            let titleEl = null;
            for (const sel of titleSelectors) {
              titleEl = el.querySelector(sel);
              if (titleEl) break;
            }

            // Try multiple company selectors
            const companySelectors = ['.comp-name', '.companyInfo .subTitle', '.company', '.companyName'];
            let companyEl = null;
            for (const sel of companySelectors) {
              companyEl = el.querySelector(sel);
              if (companyEl) break;
            }

            // Try multiple location selectors
            const locationSelectors = ['.locWdth', '.location .ellipsis', '.loc', '.location'];
            let locationEl = null;
            for (const sel of locationSelectors) {
              locationEl = el.querySelector(sel);
              if (locationEl) break;
            }

            // Try multiple posted date selectors
            const postedSelectors = ['.job-post-day', '.jobTupleFooter .fleft', '.postDate', 'span[class*="date"]'];
            let postedEl = null;
            for (const sel of postedSelectors) {
              postedEl = el.querySelector(sel);
              if (postedEl) break;
            }

            if (titleEl) {
              const title = titleEl?.innerText?.trim() || "";
              const company = companyEl?.innerText?.trim() || "Not specified";
              const location = locationEl?.innerText?.trim() || "Not specified";
              const posted = postedEl?.innerText?.trim() || "Recently";
              let link = titleEl?.href || "";

              // Ensure absolute URL
              if (link && !link.startsWith('http')) {
                link = 'https://www.naukri.com' + link;
              }

              if (title && link) {
                arr.push({
                  title,
                  company,
                  location,
                  posted,
                  link,
                  source: "Naukri"
                });
              }
            }
          } catch (e) {
            // Skip problematic jobs
          }
        });

        return arr;
      }, workingSelector);

      console.log(`✅ Naukri page ${pageNum}: Found ${jobs.length} jobs`);
      allJobs.push(...jobs);

      // Delay between pages
      if (pageNum < 5) {
        await randomDelay(3000, 5000);
      }
    }

    console.log(`✅ Naukri: Total jobs from all pages: ${allJobs.length}`);
    return allJobs;

  } catch (error) {
    console.error("❌ Naukri error:", error.message);
    return allJobs; // Return whatever we got
  }
}

// ==================== INDEED SCRAPER ====================
async function scrapeIndeed(page) {
  console.log("🔍 Scraping Indeed...");
  
  try {
    await page.goto(
      "https://in.indeed.com/jobs?q=react+native&l=India&sort=date",
      { waitUntil: "domcontentloaded", timeout: 60000 }
    );

    await randomDelay(3000, 5000);
    
    if (await checkForCaptcha(page)) {
      console.log("❌ Indeed: CAPTCHA detected");
      await randomDelay(5000, 8000);
    }

    // Scroll multiple times to trigger lazy loading
    await humanScroll(page, 5);
    await randomDelay(2000, 3000);

    // Check for multiple possible selectors
    const possibleSelectors = [
      '[data-testid="jobTitle"]',
      '.jobTitle',
      '.job_seen_beacon',
      'h2.jobTitle a',
      '.resultContent h2 a'
    ];

    console.log("🔎 Checking Indeed page structure...");
    
    let workingSelector = null;
    for (const selector of possibleSelectors) {
      const count = await page.$$eval(selector, els => els.length);
      if (count > 0) {
        workingSelector = selector;
        console.log(`✓ Found ${count} jobs with selector: ${selector}`);
        break;
      }
    }

    if (!workingSelector) {
      const pageText = await page.evaluate(() => document.body.innerText.substring(0, 500));
      console.log("📄 Indeed page preview:", pageText);
      await page.screenshot({ path: `indeed-debug-${Date.now()}.png` });
      console.log("❌ Indeed: No job listings found");
      return [];
    }

    await randomDelay(2000, 3000);

    const jobs = await page.evaluate((selector) => {
      const arr = [];
      const jobLinks = document.querySelectorAll(selector);

      jobLinks.forEach((el, index) => {
        try {
          // Find the parent card container
          const card = el.closest('.cardOutline') || 
                      el.closest('.job_seen_beacon') || 
                      el.closest('.slider_container') ||
                      el.closest('td') ||
                      el.closest('li') ||
                      el.parentElement?.parentElement;

          if (!card) return;

          // Multiple selectors for each field
          const companySelectors = ['[data-testid="company-name"]', '.companyName', 'span[class*="company"]'];
          let companyEl = null;
          for (const sel of companySelectors) {
            companyEl = card.querySelector(sel);
            if (companyEl) break;
          }

          const locationSelectors = ['[data-testid="text-location"]', '.companyLocation', 'div[class*="location"]'];
          let locationEl = null;
          for (const sel of locationSelectors) {
            locationEl = card.querySelector(sel);
            if (locationEl) break;
          }

          const dateSelectors = ['.date', '[data-testid="myJobsStateDate"]', 'span[class*="date"]'];
          let dateEl = null;
          for (const sel of dateSelectors) {
            dateEl = card.querySelector(sel);
            if (dateEl) break;
          }

          const title = el.innerText?.trim() || "";
          const company = companyEl?.innerText?.trim() || "Not specified";
          const location = locationEl?.innerText?.trim() || "Not specified";
          const posted = dateEl?.innerText?.trim() || "Recently";
          
          let link = el.getAttribute("href") || el.closest('a')?.getAttribute("href") || "";
          
          if (link) {
            if (!link.startsWith('http')) {
              link = "https://in.indeed.com" + link;
            }
            
            if (title && link) {
              arr.push({
                title,
                company,
                location,
                posted,
                link,
                source: "Indeed"
              });
            }
          }
        } catch (e) {
          console.error(`Error parsing Indeed job ${index}:`, e.message);
        }
      });

      return arr;
    }, workingSelector);

    console.log(`✅ Indeed: Found ${jobs.length} jobs`);
    return jobs;

  } catch (error) {
    console.error("❌ Indeed error:", error.message);
    return [];
  }
}

// ==================== GLASSDOOR SCRAPER ====================
async function scrapeGlassdoor(page) {
  console.log("🔍 Scraping Glassdoor...");
  
  try {
    await page.goto(
      "https://www.glassdoor.co.in/Job/india-react-native-jobs-SRCH_IL.0,5_IN1_KO6,18.htm",
      { waitUntil: "domcontentloaded", timeout: 60000 }
    );

    await randomDelay(3000, 5000);
    await humanScroll(page, 4);
    await randomDelay(2000, 3000);

    const possibleSelectors = [
      '.jobCard',
      '.react-job-listing',
      '[data-test="jobListing"]',
      'li[class*="job"]'
    ];

    let workingSelector = null;
    for (const selector of possibleSelectors) {
      const count = await page.$$eval(selector, els => els.length);
      if (count > 0) {
        workingSelector = selector;
        console.log(`✓ Found ${count} jobs with selector: ${selector}`);
        break;
      }
    }

    if (!workingSelector) {
      console.log("❌ Glassdoor: No job listings found");
      return [];
    }

    const jobs = await page.evaluate((selector) => {
      const arr = [];
      const jobCards = document.querySelectorAll(selector);

      jobCards.forEach((el, index) => {
        try {
          const titleSelectors = ['.jobTitle', '[data-test="job-title"]', 'a[class*="title"]'];
          let titleEl = null;
          for (const sel of titleSelectors) {
            titleEl = el.querySelector(sel);
            if (titleEl) break;
          }

          const companySelectors = ['.employerName', '[data-test="employer-name"]', 'span[class*="employer"]'];
          let companyEl = null;
          for (const sel of companySelectors) {
            companyEl = el.querySelector(sel);
            if (companyEl) break;
          }

          const locationSelectors = ['.location', '[data-test="emp-location"]', 'div[class*="location"]'];
          let locationEl = null;
          for (const sel of locationSelectors) {
            locationEl = el.querySelector(sel);
            if (locationEl) break;
          }

          const ageSelectors = ['.listingAge', '[data-test="job-age"]', 'div[class*="age"]'];
          let ageEl = null;
          for (const sel of ageSelectors) {
            ageEl = el.querySelector(sel);
            if (ageEl) break;
          }

          const linkEl = titleEl?.closest('a') || el.querySelector('a');
          
          if (titleEl && linkEl) {
            arr.push({
              title: titleEl?.innerText?.trim() || "",
              company: companyEl?.innerText?.trim() || "Not specified",
              location: locationEl?.innerText?.trim() || "Not specified",
              posted: ageEl?.innerText?.trim() || "Recently",
              link: linkEl?.href || "",
              source: "Glassdoor"
            });
          }
        } catch (e) {
          console.error(`Error parsing Glassdoor job ${index}:`, e.message);
        }
      });

      return arr;
    }, workingSelector);

    console.log(`✅ Glassdoor: Found ${jobs.length} jobs`);
    return jobs;

  } catch (error) {
    console.error("❌ Glassdoor error:", error.message);
    return [];
  }
}

// ==================== LINKEDIN SCRAPER ====================
async function scrapeLinkedIn(page) {
  console.log("🔍 Scraping LinkedIn...");
  
  try {
    await page.goto(
      "https://www.linkedin.com/jobs/search?keywords=React%20Native&location=India&sortBy=DD",
      { waitUntil: "domcontentloaded", timeout: 60000 }
    );

    await randomDelay(3000, 5000);
    await humanScroll(page, 4);
    await randomDelay(2000, 3000);

    const signInRequired = await page.evaluate(() => {
      return document.querySelector('.authwall') !== null;
    });

    if (signInRequired) {
      console.log("⚠️  LinkedIn requires sign-in");
      return [];
    }

    const possibleSelectors = [
      '.base-card',
      '.job-search-card',
      '[data-entity-urn]',
      'li[class*="job"]'
    ];

    let workingSelector = null;
    for (const selector of possibleSelectors) {
      const count = await page.$$eval(selector, els => els.length);
      if (count > 0) {
        workingSelector = selector;
        console.log(`✓ Found ${count} jobs with selector: ${selector}`);
        break;
      }
    }

    if (!workingSelector) {
      console.log("❌ LinkedIn: No job listings found");
      return [];
    }

    const jobs = await page.evaluate((selector) => {
      const arr = [];
      const jobCards = document.querySelectorAll(selector);

      jobCards.forEach((el, index) => {
        try {
          const titleEl = el.querySelector('.base-search-card__title, h3, .job-card-list__title');
          const companyEl = el.querySelector('.base-search-card__subtitle, h4, .job-card-container__company-name');
          const locationEl = el.querySelector('.job-search-card__location, .job-card-container__metadata-item');
          const timeEl = el.querySelector('time');
          const linkEl = el.querySelector('a');
          
          if (titleEl && linkEl && linkEl.href) {
            arr.push({
              title: titleEl?.innerText?.trim() || "",
              company: companyEl?.innerText?.trim() || "Not specified",
              location: locationEl?.innerText?.trim() || "Not specified",
              posted: timeEl?.innerText?.trim() || "Recently",
              link: linkEl?.href || "",
              source: "LinkedIn"
            });
          }
        } catch (e) {
          console.error(`Error parsing LinkedIn job ${index}:`, e.message);
        }
      });

      return arr;
    }, workingSelector);

    console.log(`✅ LinkedIn: Found ${jobs.length} jobs`);
    return jobs;

  } catch (error) {
    console.error("❌ LinkedIn error:", error.message);
    return [];
  }
}

// ==================== MAIN SCRAPER ====================
async function scrapeJobs() {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920,1080",
        "--disable-blink-features=AutomationControlled",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process"
      ]
    });

    const page = await browser.newPage();

    // Random user agent
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(randomUserAgent);

    // Set realistic viewport
    await page.setViewport({ 
      width: 1920, 
      height: 1080,
      deviceScaleFactor: 1
    });

    // Enhanced headers
    await page.setExtraHTTPHeaders({
      "accept-language": "en-US,en;q=0.9",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "accept-encoding": "gzip, deflate, br",
      "cache-control": "no-cache",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1"
    });

    // Advanced anti-detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      
      window.chrome = { runtime: {} };
      
      Object.defineProperty(navigator, 'permissions', {
        get: () => ({
          query: () => Promise.resolve({ state: 'granted' })
        })
      });
    });

    let allJobs = [];

    // Scrape with delays between sites
    const naukri = await scrapeNaukri(page);
    allJobs.push(...naukri);
    await randomDelay(4000, 7000);

    const indeed = await scrapeIndeed(page);
    allJobs.push(...indeed);
    await randomDelay(4000, 7000);

    const glassdoor = await scrapeGlassdoor(page);
    allJobs.push(...glassdoor);
    await randomDelay(4000, 7000);

    const linkedin = await scrapeLinkedIn(page);
    allJobs.push(...linkedin);

    await browser.close();

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Naukri: ${naukri.length}`);
    console.log(`   Indeed: ${indeed.length}`);
    console.log(`   Glassdoor: ${glassdoor.length}`);
    console.log(`   LinkedIn: ${linkedin.length}`);
    console.log(`   ─────────────────`);
    console.log(`   TOTAL: ${allJobs.length} jobs\n`);

    return allJobs;
    
  } catch (error) {
    console.error("❌ Fatal scraper error:", error);
    if (browser) await browser.close();
    return [];
  }
}

module.exports = { scrapeJobs };