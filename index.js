const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

// Use stealth plugin to mask automation
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
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
    console.log("⏳ Navigating to Naukri...");
    await page.goto(
      "https://www.naukri.com/react-jobs-2?k=react&ctcFilter=3to6",
      {
        waitUntil: "networkidle2",
        timeout: 60000,
      }
    );

    // Give time to render after initial load
    await new Promise((resolve) => setTimeout(resolve, 8000));

    // Save screenshot to verify page loaded
    // await page.screenshot({ path: 'naukri-page.png', fullPage: true });

    // Wait for job listings
    await page.waitForSelector(".job-tuple", { timeout: 60000 });

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll(".job-tuple");
      const results = [];

      jobElements.forEach((el) => {
        const title = el.querySelector("a.title")?.innerText.trim() || "";
        const company = el.querySelector("a.comp-name")?.innerText.trim() || "";
        const location = el.querySelector(".locWdth")?.innerText.trim() || "";
        const experience = el.querySelector(".expwdth")?.innerText.trim() || "";
        const description =
          el.querySelector(".job-desc")?.innerText.trim() || "";
        const tags = Array.from(el.querySelectorAll(".tags-gt li")).map((li) =>
          li.innerText.trim()
        );
        const posted =
          el.querySelector(".job-post-day")?.innerText.trim() || "";
        const link = el.querySelector("a.title")?.href || "";

        results.push({
          title,
          company,
          location,
          experience,
          description,
          tags,
          posted,
          link,
        });
      });

      return results;
    });

    console.log(`📦 Total Jobs Found: ${jobs.length}\n`);

    jobs.forEach((job, i) => {
      console.log(`🔹 Job #${i + 1}`);
      console.log(`Title:       ${job.title}`);
      console.log(`Company:     ${job.company}`);
      console.log(`Location:    ${job.location}`);
      console.log(`Experience:  ${job.experience}`);
      console.log(`Description: ${job.description}`);
      console.log(`Tags:        ${job.tags.join(", ")}`);
      console.log(`Posted:      ${job.posted}`);
      console.log(`Link:        ${job.link}`);
      console.log("----------------------------");
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await browser.close();
  }
})();
