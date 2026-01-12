module.exports = function generateJobHTML(jobs) {
  return `
  <html>
    <body style="font-family: Arial; background:#f4f4f4; padding:20px">
      <h2>🚀 Today's Job Openings</h2>

      ${jobs
        .map(
          (job) => `
          <div style="background:#fff;padding:15px;margin-bottom:15px;border-radius:6px">
            <h3>${job.title}</h3>
            <p><strong>Company:</strong> ${job.company}</p>
            <p><strong>Location:</strong> ${job.location}</p>
            <p>${job.description?.slice(0, 200)}...</p>
            <a href="${job.link}" 
               target="_blank"
               style="display:inline-block;margin-top:10px;
                      padding:10px 15px;background:#007bff;
                      color:#fff;text-decoration:none;border-radius:4px">
              Apply Now
            </a>
          </div>
        `
        )
        .join("")}

    </body>
  </html>
  `;
};
