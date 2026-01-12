const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

scrapeFromConfig = async (config) => {
  const browser = await puppeteer.launch({
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      //  '--disable-dev-shm-usage',
      // '--disable-gpu',
      // '--window-size=1920x1080',
    ],
  });
  const page = await browser.newPage();

  // Spoof as real user
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  await page.setExtraHTTPHeaders({
    "accept-language": "en-US,en;q=0.9",
  });

  try {
    await page.goto(config.url, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector(config.wrapperSelector);

    const results = await page.evaluate(
      ({ wrapperSelector, selectors }) => {
        const items = Array.from(document.querySelectorAll(wrapperSelector));
        return items.map((el) => {
          const getText = (sel) =>
            sel && el.querySelector(sel)?.innerText?.trim() || "";
          const getAttr = (sel, attr = "href") =>
            el.querySelector(sel)?.getAttribute(attr) || "";
          const getList = (sel) =>
            Array.from(el.querySelectorAll(sel)).map((li) =>
              li.innerText.trim()
            );

          return {
            title: getText(selectors.title),
            company: getText(selectors.company),
            location: getText(selectors.location),
            experience: getText(selectors.experience),
            description: getText(selectors.description),
            tags: getList(selectors.tags),
            posted: getText(selectors.posted),
            link: getAttr(selectors.link, "href"),
          };
        });
      },
      { wrapperSelector: config.wrapperSelector, selectors: config.selectors }
    );
    // const results = {}
    console.log(`✅ Found ${results.length} items`);
    return results;
  } catch (err) {
    console.error("❌ Error:", err.message);
    return [];
  } finally {
    await browser.close();
  }
};

module.exports = scrapeFromConfig;
