/**
 * CA Foundation Courses Configuration
 * Using Google Drive for content delivery
 */

module.exports = {
  // Google Drive File IDs (Update these after uploading)
  driveFileIds: {
    'ca-foundation-accounting': process.env.CA_ACCOUNTING_DRIVE_FILE_ID || '',
    'ca-foundation-economics': process.env.CA_ECONOMICS_DRIVE_FILE_ID || '',
    'ca-foundation-laws': process.env.CA_LAWS_DRIVE_FILE_ID || '',
    'ca-foundation-mathematics': process.env.CA_MATHEMATICS_DRIVE_FILE_ID || ''
  },

  // Course Metadata
  courses: [
    {
      id: 'ca-foundation-accounting',
      courseId: 'ca-f-acc',
      title: 'CA Foundation - Accounting',
      description: 'Complete Accounting course for CA Foundation covering all topics with detailed explanations, solved examples, and practice questions. Perfect preparation for CA Foundation examination.',
      category: 'Professional',
      examType: 'CA_FOUNDATION',
      subject: 'Accounting',
      level: 'Foundation',
      duration: 630,
      totalLessons: 10,
      instructor: 'CA Expert Team',
      price: 4999,
      currency: 'INR',
      thumbnail: 'https://via.placeholder.com/400x225/2196F3/ffffff?text=CA+Foundation+Accounting',
      tags: ['CA', 'Accounting', 'Foundation', 'Professional', 'Indian Exam'],
      localFile: 'ca-f-acc.json',
      driveFileId: '', // Will be set from driveFileIds
      language: 'English',
      featured: true
    },
    {
      id: 'ca-foundation-economics',
      courseId: 'ca-f-eco',
      title: 'CA Foundation - Business Economics',
      description: 'Comprehensive Business Economics course for CA Foundation with real-world examples, case studies, and exam-focused content covering microeconomics and macroeconomics.',
      category: 'Professional',
      examType: 'CA_FOUNDATION',
      subject: 'Business Economics',
      level: 'Foundation',
      duration: 600, // 10 lessons x 60 min
      totalLessons: 10,
      instructor: 'CA Expert Team',
      price: 3999,
      currency: 'INR',
      thumbnail: 'https://via.placeholder.com/400x225/4CAF50/ffffff?text=CA+Foundation+Economics',
      tags: ['CA', 'Economics', 'Foundation', 'Professional', 'Indian Exam'],
      localFile: 'ca-f-eco.json',
      driveFileId: '',
      language: 'English',
      featured: true
    },
    {
      id: 'ca-foundation-laws',
      courseId: 'ca-f-law',
      title: 'CA Foundation - Business Laws',
      description: 'Complete Business Laws course for CA Foundation covering Indian Contract Act, Sale of Goods Act, Partnership Act, and other essential legal concepts for commerce students.',
      category: 'Professional',
      examType: 'CA_FOUNDATION',
      subject: 'Business Laws',
      level: 'Foundation',
      duration: 480,
      totalLessons: 8,
      instructor: 'CA Expert Team',
      price: 3999,
      currency: 'INR',
      thumbnail: 'https://via.placeholder.com/400x225/FF9800/ffffff?text=CA+Foundation+Laws',
      tags: ['CA', 'Business Laws', 'Foundation', 'Professional', 'Indian Exam'],
      localFile: 'ca-f-law.json',
      driveFileId: '',
      language: 'English',
      featured: true
    },
    {
      id: 'ca-foundation-mathematics',
      courseId: 'ca-f-math',
      title: 'CA Foundation - Business Mathematics',
      description: 'Business Mathematics and Logical Reasoning for CA Foundation with step-by-step solutions, shortcuts, and exam strategies. Covers ratio, statistics, probability, and more.',
      category: 'Professional',
      examType: 'CA_FOUNDATION',
      subject: 'Business Mathematics',
      level: 'Foundation',
      duration: 720, // 12 lessons x 60 min
      totalLessons: 12,
      instructor: 'CA Expert Team',
      price: 3999,
      currency: 'INR',
      thumbnail: 'https://via.placeholder.com/400x225/9C27B0/ffffff?text=CA+Foundation+Maths',
      tags: ['CA', 'Mathematics', 'Foundation', 'Professional', 'Indian Exam'],
      localFile: 'ca-f-maths.json',
      driveFileId: '',
      language: 'English',
      featured: true
    }
  ],

  // Initialize drive file IDs for courses
  init() {
    this.courses.forEach(course => {
      course.driveFileId = this.driveFileIds[course.id];
    });
    return this;
  }
};
