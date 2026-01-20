// scraper-config.js - Advanced configuration for web scraping

const SCRAPER_CONFIG = {
  maxRetries: 3,
  retryDelay: 5000,
  timeout: 60000,
  
  // Job site configurations
  sites: {
    naukri: {
      name: "Naukri",
      enabled: true,
      url: "https://www.naukri.com/react-native-jobs?sort=recency",
      selectors: {
        container: [
          '.cust-job-tuple',
          '.srp-jobtuple-wrapper',
          'article.jobTuple',
          '.jobTuple',
          'article[class*="job"]'
        ],
        title: ['.title', 'a.title', '.jobTitle', 'h2 a', 'h3 a'],
        company: ['.comp-name', '.companyInfo .subTitle', '.company', '.companyName'],
        location: ['.locWdth', '.location .ellipsis', '.loc', '.location'],
        posted: ['.job-post-day', '.jobTupleFooter .fleft', '.postDate', 'span[class*="date"]'],
        link: ['.title', 'a.title']
      }
    },
    
    indeed: {
      name: "Indeed",
      enabled: true,
      url: "https://in.indeed.com/jobs?q=react+native&l=India&sort=date",
      selectors: {
        container: [
          '[data-testid="jobTitle"]',
          '.jobTitle',
          '.job_seen_beacon',
          'h2.jobTitle a',
          '.resultContent h2 a'
        ],
        title: ['self'], // self means the container element itself
        company: ['[data-testid="company-name"]', '.companyName', 'span[class*="company"]'],
        location: ['[data-testid="text-location"]', '.companyLocation', 'div[class*="location"]'],
        posted: ['.date', '[data-testid="myJobsStateDate"]', 'span[class*="date"]'],
        link: ['self']
      },
      baseUrl: "https://in.indeed.com"
    },
    
    glassdoor: {
      name: "Glassdoor",
      enabled: true,
      url: "https://www.glassdoor.co.in/Job/india-react-native-jobs-SRCH_IL.0,5_IN1_KO6,18.htm",
      selectors: {
        container: [
          '.jobCard',
          '.react-job-listing',
          '[data-test="jobListing"]',
          'li[class*="job"]'
        ],
        title: ['.jobTitle', '[data-test="job-title"]', 'a[class*="title"]'],
        company: ['.employerName', '[data-test="employer-name"]', 'span[class*="employer"]'],
        location: ['.location', '[data-test="emp-location"]', 'div[class*="location"]'],
        posted: ['.listingAge', '[data-test="job-age"]', 'div[class*="age"]'],
        link: ['a']
      }
    },
    
    linkedin: {
      name: "LinkedIn",
      enabled: true,
      url: "https://www.linkedin.com/jobs/search?keywords=React%20Native&location=India&sortBy=DD",
      selectors: {
        container: [
          '.base-card',
          '.job-search-card',
          '[data-entity-urn]',
          'li[class*="job"]'
        ],
        title: ['.base-search-card__title', 'h3', '.job-card-list__title'],
        company: ['.base-search-card__subtitle', 'h4', '.job-card-container__company-name'],
        location: ['.job-search-card__location', '.job-card-container__metadata-item'],
        posted: ['time'],
        link: ['a']
      },
      requiresAuth: true
    }
  }
};

// Retry wrapper function
async function retryOperation(operation, maxRetries = 3, delay = 5000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`⚠️  Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        console.error(`❌ All ${maxRetries} attempts failed`);
        throw error;
      }
      
      console.log(`🔄 Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}

// Extract data using multiple selector strategies
function extractWithSelectors(element, selectors, attribute = null) {
  if (!selectors || selectors.length === 0) return "";
  
  for (const selector of selectors) {
    if (selector === 'self') {
      if (attribute) {
        return element.getAttribute(attribute) || element.href || "";
      }
      return element.innerText?.trim() || "";
    }
    
    const el = element.querySelector(selector);
    if (el) {
      if (attribute) {
        return el.getAttribute(attribute) || el.href || "";
      }
      return el.innerText?.trim() || "";
    }
  }
  
  return "";
}

// Generic scraper using configuration
async function scrapeWithConfig(page, siteConfig) {
  const siteName = siteConfig.name;
  console.log(`🔍 Scraping ${siteName}...`);
  
  try {
    // Navigate
    await page.goto(siteConfig.url, { 
      waitUntil: "domcontentloaded", 
      timeout: SCRAPER_CONFIG.timeout 
    });

    // Random delay
    await new Promise(r => setTimeout(r, Math.random() * 2000 + 3000));
    
    // Human-like scrolling
    for (let i = 0; i < 4; i++) {
      await page.evaluate((y) => {
        window.scrollBy({ top: y, behavior: 'smooth' });
      }, Math.floor(Math.random() * 300) + 200);
      await new Promise(r => setTimeout(r, Math.random() * 700 + 800));
    }
    
    await new Promise(r => setTimeout(r, 2000));

    // Find working container selector
    let containerSelector = null;
    let containerCount = 0;
    
    for (const selector of siteConfig.selectors.container) {
      const count = await page.$$eval(selector, els => els.length).catch(() => 0);
      if (count > 0) {
        containerSelector = selector;
        containerCount = count;
        console.log(`✓ ${siteName}: Found ${count} jobs with selector: ${selector}`);
        break;
      }
    }

    if (!containerSelector) {
      console.log(`❌ ${siteName}: No job listings found`);
      
      // Debug screenshot
      await page.screenshot({ path: `debug-${siteName.toLowerCase()}-${Date.now()}.png` });
      
      return [];
    }

    // Extract jobs
    const jobs = await page.evaluate((config, containerSel, baseUrl) => {
      const arr = [];
      const containers = document.querySelectorAll(containerSel);

      // Helper function (copied to browser context)
      function extract(element, selectors, attr = null) {
        if (!selectors) return "";
        
        for (const selector of selectors) {
          if (selector === 'self') {
            if (attr) return element.getAttribute(attr) || element.href || "";
            return element.innerText?.trim() || "";
          }
          
          const el = element.querySelector(selector);
          if (el) {
            if (attr) return el.getAttribute(attr) || el.href || "";
            return el.innerText?.trim() || "";
          }
        }
        return "";
      }

      containers.forEach((container, idx) => {
        try {
          const title = extract(container, config.selectors.title);
          const company = extract(container, config.selectors.company) || "Not specified";
          const location = extract(container, config.selectors.location) || "Not specified";
          const posted = extract(container, config.selectors.posted) || "Recently";
          
          let link = extract(container, config.selectors.link, 'href');
          
          // Make absolute URL
          if (link && !link.startsWith('http')) {
            if (baseUrl) {
              link = new URL(baseUrl).origin + link;
            }
          }

          if (title && link) {
            arr.push({
              title,
              company,
              location,
              posted,
              link,
              source: config.name
            });
          }
        } catch (e) {
          console.error(`Error at index ${idx}:`, e.message);
        }
      });

      return arr;
    }, siteConfig, containerSelector, siteConfig.baseUrl);

    console.log(`✅ ${siteName}: Found ${jobs.length} jobs`);
    return jobs;

  } catch (error) {
    console.error(`❌ ${siteName} error:`, error.message);
    return [];
  }
}

module.exports = {
  SCRAPER_CONFIG,
  retryOperation,
  scrapeWithConfig,
  extractWithSelectors
};