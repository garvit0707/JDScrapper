const mongoose = require('mongoose');

const JobPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [500, 'Title cannot exceed 500 characters']
  },
  
  company: {
    type: String,
    default: 'Not specified',
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  
  location: {
    type: String,
    default: 'Not specified',
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  
  experience: {
    type: String,
    default: '',
    trim: true
  },
  
  description: {
    type: String,
    default: '',
    trim: true
  },
  
  tags: {
    type: [String],
    default: []
  },
  
  posted: {
    type: String,
    default: 'Recently',
    trim: true
  },
  
  link: {
    type: String,
    required: [true, 'Job link is required'],
    unique: true,  // Prevent duplicate jobs by link
    trim: true
  },
  
  source: {
    type: String,
    required: [true, 'Source is required'],
    enum: ['Naukri', 'Indeed', 'Glassdoor', 'LinkedIn'],
    trim: true
  },
  
  scrapedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt automatically
});

// Create indexes for better performance
JobPostSchema.index({ link: 1 });
JobPostSchema.index({ source: 1, scrapedAt: -1 });
JobPostSchema.index({ title: 'text', company: 'text' }); // For text search

// Pre-save middleware to clean data
JobPostSchema.pre('save', function(next) {
  // Clean up any extra whitespace
  if (this.title) this.title = this.title.trim();
  if (this.company) this.company = this.company.trim();
  if (this.location) this.location = this.location.trim();
  if (this.link) this.link = this.link.trim();
  
  next();
});

// Method to check if job already exists
JobPostSchema.statics.jobExists = async function(link) {
  const job = await this.findOne({ link });
  return !!job;
};

// Handle duplicate key errors
JobPostSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    console.log('Duplicate job detected:', this.link);
    next(); // Don't throw error, just skip
  } else {
    next(error);
  }
});

const JobPost = mongoose.model('JobPost', JobPostSchema);
module.exports = JobPost;