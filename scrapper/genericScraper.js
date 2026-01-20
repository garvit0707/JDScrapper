const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const chromium = require("@sparticuz/chromium");

puppeteer.use(StealthPlugin());

// List of user agents to randomize
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15"
];

scrapeFromConfig = async (config) => {
  const browser = await puppeteer.launch({
    // args: chromium.args,
    // defaultViewport: chromium.defaultViewport,
    // executablePath: await chromium.executablePath(),
    // headless: chromium.headless,
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process"
    ]
  });
  const page = await browser.newPage();

  // Randomize user agent
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  await page.setUserAgent(randomUserAgent);

  // Set random viewport
  const viewports = [
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
  ];
  const randomViewport = viewports[Math.floor(Math.random() * viewports.length)];
  await page.setViewport(randomViewport);

  await page.setExtraHTTPHeaders({
    "accept-language": "en-US,en;q=0.9",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-encoding": "gzip, deflate, br",
    "cache-control": "no-cache",
    "pragma": "no-cache",
  });

  // Simulate human-like behavior: random delay before navigation
  await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000)); // 1-4 seconds

  try {
    await page.goto(config.url, { waitUntil: "networkidle2", timeout: 60000 });
    // Check for anti-bot challenges (e.g., Cloudflare, CAPTCHA)
    const title = await page.title();
    if (title.toLowerCase().includes('cloudflare') || title.toLowerCase().includes('access denied') || title.toLowerCase().includes('blocked')) {
      console.log('Anti-bot challenge detected. Retrying with new session...');
      await browser.close();
      return await scrapeFromConfig(config); // Recursive retry
    }

    // Simulate human-like behavior: random delays, scrolling, and mouse movements
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // 1-3 seconds
    await page.evaluate(() => {
      window.scrollTo(0, Math.random() * 500 + 100); // Random scroll down
    });
    await page.mouse.move(Math.random() * 800 + 100, Math.random() * 600 + 100); // Random mouse move
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // Another delay

    let wrapperSelector = config.wrapperSelector;
    try {
      await page.waitForSelector(wrapperSelector, { timeout: 60000 });
    } catch (error) {
      console.error(`Primary selector ${wrapperSelector} failed for ${config.source}, trying fallback selectors...`);
      // Try fallback selectors
      const fallbacks = [".job-tuple", ".srp-jobtuple-wrapper", ".jobCard", ".base-card", ".job_seen_beacon"];
      for (const fallback of fallbacks) {
        try {
          await page.waitForSelector(fallback, { timeout: 10000 });
          wrapperSelector = fallback;
          console.log(`Using fallback selector: ${fallback} for ${config.source}`);
          break;
        } catch (fallbackError) {
          // Continue to next fallback
        }
      }
      if (wrapperSelector === config.wrapperSelector) {
        console.error(`All selectors failed for ${config.source}, returning empty results`);
        return [];
      }
    }

    const results = await page.evaluate(
      ({ wrapperSelector, selectors, baseUrl }) => {
        const items = Array.from(document.querySelectorAll(wrapperSelector));
        return items.map((el) => {
          const getText = (sel) =>
            sel && el.querySelector(sel)?.innerText?.trim() || "";
          const getAttr = (sel, attr = "href") =>
            el.querySelector(sel)?.getAttribute(attr) || "";
          const getList = (sel) =>
            sel ? Array.from(el.querySelectorAll(sel)).map((li) =>
              li.innerText.trim()
            ) : [];

          let link = getAttr(selectors.link, "href");
          if (link && link.startsWith('/')) {
            link = new URL(baseUrl).origin + link;
          }

          return {
            title: getText(selectors.title),
            company: getText(selectors.company),
            location: getText(selectors.location),
            experience: getText(selectors.experience),
            description: getText(selectors.description),
            tags: getList(selectors.tags),
            posted: getText(selectors.posted),
            link,
          };
        });
      },
      { wrapperSelector, selectors: config.selectors, baseUrl: config.url }
    );
    // const results = {}
    console.log(`✅ Found ${results.length} items`);
    return results;
  } catch (err) {
    console.error("❌ Error: this error is here", err.message);
    console.error("❌ Error: this error is here", err.message);
    return [];
  } finally {
    await browser.close();
  }
};

module.exports = scrapeFromConfig;
