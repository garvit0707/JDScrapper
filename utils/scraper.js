const { default: axios } = require("axios");
const genericScraper = require("../scrapper/genericScraper");
const JobPost = require("../model/JobPost");

async function scrapeJobs() {
  console.log("🚀 Starting scrapeJobs function");
  let configs = [
    {
      url: "https://www.glassdoor.co.in/Job/india-react-native-jobs-SRCH_IL.0,5_IN1_KO6,18.htm",
      wrapperSelector: ".jobCard.JobCard_jobCardContent__JQ5Rq",
      source: "Glassdoor",
      selectors: {
        title: "a.JobCard_jobTitle__GLyJ1",
        company: ".EmployerProfile_compactEmployerName__9MGcV",
        location: "[id^='job-location-']",
        experience: "",
        description: ".JobCard_jobDescriptionSnippet__l1tnl > div:first-child",
        tags: ".JobCard_jobDescriptionSnippet__l1tnl > div:nth-child(2)",
        posted: ".JobCard_listingAge__jJsuc",
        link: "a.JobCard_trackingLink__HMyun",
      },
    },
    {
      url: "https://www.glassdoor.co.in/Job/india-mobile-application-developer-jobs-SRCH_IL.0,5_IN1_KO6,32.htm",
      wrapperSelector: ".jobCard.JobCard_jobCardContent__JQ5Rq",
      source: "Glassdoor",
      selectors: {
        title: "a.JobCard_jobTitle__GLyJ1",
        company: ".EmployerProfile_compactEmployerName__9MGcV",
        location: "[id^='job-location-']",
        experience: "",
        description: ".JobCard_jobDescriptionSnippet__l1tnl > div:first-child",
        tags: ".JobCard_jobDescriptionSnippet__l1tnl > div:nth-child(2)",
        posted: ".JobCard_listingAge__jJsuc",
        link: "a.JobCard_trackingLink__HMyun",
      },
    },
    {
      url: "https://www.linkedin.com/jobs/search/?keywords=react%20native&location=Remote",
      wrapperSelector: ".base-card",
      source: "LinkedIn",
      selectors: {
        title: ".base-search-card__title",
        company: ".base-search-card__subtitle",
        location: ".job-search-card__location",
        experience: "",
        description: ".base-search-card__metadata",
        tags: "",
        posted: ".job-search-card__listdate",
        link: ".base-card__full-link",
      },
    },
    {
      url: "https://www.indeed.com/jobs?q=react+native&remotejob=1",
      wrapperSelector: ".job_seen_beacon",
      source: "Indeed",
      selectors: {
        title: ".jobTitle a",
        company: ".companyName",
        location: ".companyLocation",
        experience: "",
        description: ".job-snippet",
        tags: "",
        posted: ".date",
        link: ".jobTitle a",
      },
    },
    {
      url: "https://www.naukri.com/react-native-jobs?k=react+native",
      wrapperSelector: ".job-tuple",
      source: "Naukri",
      selectors: {
        title: "a.title",
        company: "a.comp-name",
        location: ".locWdth",
        experience: ".expwdth",
        description: ".job-desc",
        tags: ".tags-gt li",
        posted: ".job-post-day",
        link: "a.title",
      },
    },
    {
      url: "https://www.foundit.in/search?query=react+native",
      wrapperSelector: ".job-tuple", // Updated to match current structure
      source: "Foundit",
      selectors: {
        title: "a.title",
        company: "a.comp-name",
        location: ".locWdth",
        experience: ".expwdth",
        description: ".job-desc",
        tags: ".tags-gt li",
        posted: ".job-post-day",
        link: "a.title",
      },
    },
  ];

  const onlyUrl = {}; // Removed foundit from here

  let allResults = [];
  let totalItems = 0;
  for (const config of configs) {
    try {
      const data = await genericScraper(config);
      const tagged = data.map((item) => ({ ...item, source: config.url }));
      allResults.push(...tagged);
      totalItems += data.length;
    } catch (error) {
      console.error(`Error scraping ${config.source}:`, error.message);
      // Continue with other sites
    }
  }
  console.log(`✅ Total items found across all sites: ${totalItems}`);

  let UrlResult = [];

  for (const ele in onlyUrl) {
    const config = onlyUrl[ele];
    try {
      const response = await axios.get(config.url);
      let responseData = response.data.data;
      console.log("the data i am getting in here is ", responseData);

      const extracted = responseData.map((element) => {
        if (ele === "foundit") {
          return {
            title: element.title,
            company: element.company.name,
            location: element.locations[0].name,
            experience: element.minimumExperience.years,
            description: element.description,
            tags: element.itSkills.map((ele) => ele.text),
            posted: element.postedAt,
            link: createFounditJobUrl(element),
          };
        }
      });

      UrlResult = [...UrlResult, ...extracted];
    } catch (error) {
      console.error(`Error scraping from ${ele}:`, error.message);
      // Skip adding results for this source and continue with others
    }
  }

function parsePostedDate(postedString) {
  if (!postedString) return null;

  const lower = postedString.toLowerCase().trim();

  // Handle formats like "1 day ago", "2 days ago", "1d", "2d", etc.
  const dayMatch = lower.match(/(\d+)\s*(day|d)/);
  if (dayMatch) {
    return parseInt(dayMatch[1], 10);
  }

  // Handle "Just posted" or "Today" as 0 days
  if (lower.includes('just posted') || lower.includes('today')) {
    return 0;
  }

  // Handle "Yesterday" as 1 day
  if (lower.includes('yesterday')) {
    return 1;
  }

  // If no match, return null
  return null;
}

// Temporarily remove strict filters for testing
const filteredResults = [...allResults, ...UrlResult];

// Temporarily remove strict filters for testing
const indiaJobs = [...allResults, ...UrlResult];

// Save India jobs to DB, avoiding duplicates by title and company
for (const job of indiaJobs) {
  try {
    const existingJob = await JobPost?.findOne({ title: job.title, company: job.company }).maxTimeMS(30000); // Increase timeout to 30 seconds
    if (!existingJob) {
      const newJob = new JobPost(job);
      await newJob.save();
      console.log(`Saved job: ${job.title}`);
    } else {
      console.log(`Job already exists: ${job.title}`);
    }
  } catch (error) {
    console.error(`Error saving job ${job.title}:`, error);
  }
}

  return filteredResults;
}

function createFounditJobUrl(job) {
  const title = job.title || "";
  const city = job.locations?.[0]?.city || "location";
  const jobId = job.jobId;

  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const titleSlug = slugify(title);
  const citySlug = slugify(city);

  return `https://www.foundit.in/job/${titleSlug}-${citySlug}-${jobId}`;
}

module.exports = { scrapeJobs };
