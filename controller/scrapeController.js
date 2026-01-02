const { default: axios } = require("axios");
const genericScraper = require("../scrapper/genericScraper");
// const Config = require('../model/Config');
// const JobPost = require('../models/JobPost');

exports.scrapeAll = async (req, res) => {
  // const configs = await Config.find();

  let configs = [
       {
      url: "https://www.glassdoor.co.in/Job/new-delhi-india-react-jobs-SRCH_IL.0,15_IC2891681_KO16,21.htm",
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
  ];

  const onlyUrl = {
    foundit: {
      url: "https://www.foundit.in/home/api/searchResultsPage?start=0&limit=20&query=react&jobCities=delhi&jobCities=noida&jobCities=greater+noida&jobCities=gurgaon+%2F+gurugram&locations=%22delhi%22&locations=%22noida%22&locations=%22greater+noida%22&locations=gurgaon+%2F+gurugram&queryDerived=true&countries=India&limit=20&variantName=embeddings512",
      title: "title",
    },
  };
  let allResults = [];
  for (const config of configs) {
    const data = await genericScraper(config);
    const tagged = data.map((item) => ({ ...item, source: config.url }));
    // await JobPost.insertMany(tagged);
    allResults.push(...tagged);
  }
  let UrlResult = [];

  for (const ele in onlyUrl) {
    const config = onlyUrl[ele]; // access config (url, title path, etc.)
    const response = await axios.get(config.url);
    let responseData = response.data.data;
    console.log("the data i am getting in here is ",responseData)

    const extracted = responseData.map((element) => {
      if (ele === "foundit") {
        return {
          title: element.title, // or use config.title to be dynamic
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
  }

  res.json([...allResults, ...UrlResult]);
};

function createFounditJobUrl(job) {
  const title = job.title || "";
  const city = job.locations?.[0]?.city || "location";
  const jobId = job.jobId;

  // Helper to slugify text
  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumerics with hyphens
      .replace(/^-+|-+$/g, ""); // Trim starting/ending hyphens

  const titleSlug = slugify(title);
  const citySlug = slugify(city);

  return `https://www.foundit.in/job/${titleSlug}-${citySlug}-${jobId}`;
}
// foundit,naukri,linkedin,glassdor,hirist,instahire