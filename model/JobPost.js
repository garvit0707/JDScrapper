const mongoose = require('mongoose');
const JobPostSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  experience: String,
  description: String,
  tags: [String],
  posted: String,
  link: String,
  source: String,     // optional
  scrapedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('JobPost', JobPostSchema);
