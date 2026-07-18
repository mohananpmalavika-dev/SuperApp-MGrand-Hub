const mongoose = require('mongoose');

/**
 * Resume Model
 * Stores resume data with all sections and metadata
 */
const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  // Personal Information
  personalInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    github: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  // Professional Summary
  summary: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  // Work Experience
  experience: [
    {
      position: { type: String, required: true, trim: true },
      company: { type: String, required: true, trim: true },
      location: { type: String, trim: true },
      startDate: { type: String, required: true },
      endDate: { type: String },
      current: { type: Boolean, default: false },
      description: { type: String, trim: true },
      achievements: [String],
    },
  ],
  // Education
  education: [
    {
      degree: { type: String, required: true, trim: true },
      institution: { type: String, required: true, trim: true },
      location: { type: String, trim: true },
      startYear: { type: String },
      endYear: { type: String, required: true },
      gpa: { type: String, trim: true },
      honors: { type: String, trim: true },
      description: { type: String, trim: true },
    },
  ],
  // Skills
  skills: {
    technical: [String],
    soft: [String],
    languages: [String],
    tools: [String],
    other: [String],
  },
  // Certifications
  certifications: [
    {
      name: { type: String, required: true, trim: true },
      issuer: { type: String, trim: true },
      issueDate: { type: String },
      expiryDate: { type: String },
      credentialId: { type: String, trim: true },
      url: { type: String, trim: true },
    },
  ],
  // Projects
  projects: [
    {
      name: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      technologies: [String],
      url: { type: String, trim: true },
      github: { type: String, trim: true },
      startDate: { type: String },
      endDate: { type: String },
      highlights: [String],
    },
  ],
  // Languages
  languages: [
    {
      language: { type: String, required: true, trim: true },
      proficiency: { 
        type: String, 
        enum: ['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'],
        default: 'Professional',
      },
    },
  ],
  // Awards & Honors
  awards: [
    {
      title: { type: String, required: true, trim: true },
      issuer: { type: String, trim: true },
      date: { type: String },
      description: { type: String, trim: true },
    },
  ],
  // Publications
  publications: [
    {
      title: { type: String, required: true, trim: true },
      publisher: { type: String, trim: true },
      date: { type: String },
      url: { type: String, trim: true },
      description: { type: String, trim: true },
    },
  ],
  // Volunteer Work
  volunteer: [
    {
      role: { type: String, required: true, trim: true },
      organization: { type: String, required: true, trim: true },
      startDate: { type: String },
      endDate: { type: String },
      current: { type: Boolean, default: false },
      description: { type: String, trim: true },
    },
  ],
  // Template & Styling
  template: {
    type: String,
    enum: ['modern', 'classic', 'creative', 'minimal', 'executive', 'professional'],
    default: 'modern',
  },
  theme: {
    primaryColor: { type: String, default: '#2c3e50' },
    secondaryColor: { type: String, default: '#3498db' },
    fontFamily: { type: String, default: 'Arial' },
    fontSize: { type: Number, default: 11 },
  },
  // Metadata
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  lastExported: {
    type: Date,
  },
  exportCount: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  publicUrl: {
    type: String,
    unique: true,
    sparse: true,
  },
  tags: [String],
  targetRole: {
    type: String,
    trim: true,
  },
  targetIndustry: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes
resumeSchema.index({ userId: 1, status: 1, createdAt: -1 });
resumeSchema.index({ userId: 1, title: 1 });
resumeSchema.index({ publicUrl: 1 });
resumeSchema.index({ tags: 1 });

// Virtual for full name
resumeSchema.virtual('personalInfo.fullName').get(function () {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Method to increment export count
resumeSchema.methods.recordExport = function () {
  this.exportCount += 1;
  this.lastExported = new Date();
  return this.save();
};

// Method to increment views
resumeSchema.methods.recordView = function () {
  this.views += 1;
  return this.save();
};

// Method to generate public URL
resumeSchema.methods.generatePublicUrl = function () {
  if (!this.publicUrl) {
    this.publicUrl = `${this._id}-${Date.now()}`;
  }
  return this.publicUrl;
};

// Static method to get user's resume count
resumeSchema.statics.getUserResumeCount = async function (userId) {
  return await this.countDocuments({ userId });
};

// Static method to get user's resumes by status
resumeSchema.statics.getUserResumesByStatus = async function (userId, status) {
  return await this.find({ userId, status }).sort({ updatedAt: -1 });
};

module.exports = mongoose.model('Resume', resumeSchema);
