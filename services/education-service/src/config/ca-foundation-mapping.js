/**
 * CA Foundation Course Mapping
 * 
 * Maps course IDs to Google Drive file IDs and lesson structures
 * Update DRIVE_FILE_IDS after uploading files to Google Drive
 */

// TODO: Replace with actual Google Drive file IDs after upload
const DRIVE_FILE_IDS = {
  accounting: 'YOUR_ACCOUNTING_FILE_ID',
  businessLaws: 'YOUR_BUSINESS_LAWS_FILE_ID',
  businessMaths: 'YOUR_BUSINESS_MATHS_FILE_ID',
  businessEconomics: 'YOUR_BUSINESS_ECONOMICS_FILE_ID'
};

// Lesson structures (will be populated from actual JSON files)
const LESSON_STRUCTURES = {
  accounting: {
    driveFileId: DRIVE_FILE_IDS.accounting,
    subject: 'Accounting',
    totalLessons: 12,
    lessons: [
      { index: 0, title: 'Introduction to Accounting', duration: 60 },
      { index: 1, title: 'Accounting Equation', duration: 55 },
      { index: 2, title: 'Double Entry System', duration: 65 },
      { index: 3, title: 'Journal Entries', duration: 70 },
      { index: 4, title: 'Ledger Posting', duration: 60 },
      { index: 5, title: 'Trial Balance', duration: 55 },
      { index: 6, title: 'Bank Reconciliation Statement', duration: 65 },
      { index: 7, title: 'Depreciation Accounting', duration: 60 },
      { index: 8, title: 'Inventory Valuation', duration: 55 },
      { index: 9, title: 'Financial Statements - Part 1', duration: 70 },
      { index: 10, title: 'Financial Statements - Part 2', duration: 65 },
      { index: 11, title: 'Cash Flow Statement', duration: 60 }
    ]
  },
  businessLaws: {
    driveFileId: DRIVE_FILE_IDS.businessLaws,
    subject: 'Business Laws',
    totalLessons: 10,
    lessons: [
      { index: 0, title: 'Introduction to Business Law', duration: 55 },
      { index: 1, title: 'Indian Contract Act - Part 1', duration: 65 },
      { index: 2, title: 'Indian Contract Act - Part 2', duration: 60 },
      { index: 3, title: 'Sale of Goods Act - Part 1', duration: 70 },
      { index: 4, title: 'Sale of Goods Act - Part 2', duration: 65 },
      { index: 5, title: 'Partnership Act', duration: 60 },
      { index: 6, title: 'Limited Liability Partnership Act', duration: 55 },
      { index: 7, title: 'Companies Act - Part 1', duration: 70 },
      { index: 8, title: 'Companies Act - Part 2', duration: 65 },
      { index: 9, title: 'Other Important Laws', duration: 55 }
    ]
  },
  businessMaths: {
    driveFileId: DRIVE_FILE_IDS.businessMaths,
    subject: 'Business Mathematics',
    totalLessons: 12,
    lessons: [
      { index: 0, title: 'Ratio and Proportion', duration: 55 },
      { index: 1, title: 'Indices and Logarithms', duration: 60 },
      { index: 2, title: 'Linear Equations', duration: 55 },
      { index: 3, title: 'Quadratic Equations', duration: 65 },
      { index: 4, title: 'Arithmetic and Geometric Progression', duration: 60 },
      { index: 5, title: 'Permutations and Combinations', duration: 70 },
      { index: 6, title: 'Sets and Functions', duration: 55 },
      { index: 7, title: 'Basic Calculus', duration: 65 },
      { index: 8, title: 'Matrices and Determinants', duration: 70 },
      { index: 9, title: 'Probability', duration: 60 },
      { index: 10, title: 'Statistical Description of Data', duration: 65 },
      { index: 11, title: 'Correlation and Regression', duration: 60 }
    ]
  },
  businessEconomics: {
    driveFileId: DRIVE_FILE_IDS.businessEconomics,
    subject: 'Business Economics',
    totalLessons: 10,
    lessons: [
      { index: 0, title: 'Introduction to Economics', duration: 55 },
      { index: 1, title: 'Theory of Demand and Supply', duration: 65 },
      { index: 2, title: 'Elasticity of Demand and Supply', duration: 60 },
      { index: 3, title: 'Theory of Production', duration: 70 },
      { index: 4, title: 'Theory of Cost', duration: 65 },
      { index: 5, title: 'Price Determination', duration: 60 },
      { index: 6, title: 'Forms of Market', duration: 65 },
      { index: 7, title: 'Business Cycles', duration: 55 },
      { index: 8, title: 'National Income', duration: 60 },
      { index: 9, title: 'Money and Banking', duration: 65 }
    ]
  }
};

/**
 * Get course mapping by subject name
 */
function getCourseMapping(subject) {
  const subjectKey = subject.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
  
  if (subjectKey.includes('accounting')) return LESSON_STRUCTURES.accounting;
  if (subjectKey.includes('law')) return LESSON_STRUCTURES.businessLaws;
  if (subjectKey.includes('math')) return LESSON_STRUCTURES.businessMaths;
  if (subjectKey.includes('economic')) return LESSON_STRUCTURES.businessEconomics;
  
  return null;
}

/**
 * Get drive file ID by subject
 */
function getDriveFileId(subject) {
  const mapping = getCourseMapping(subject);
  return mapping ? mapping.driveFileId : null;
}

/**
 * Get lesson info by subject and index
 */
function getLessonInfo(subject, lessonIndex) {
  const mapping = getCourseMapping(subject);
  if (!mapping) return null;
  
  return mapping.lessons[lessonIndex] || null;
}

/**
 * Get all lessons for a subject
 */
function getAllLessons(subject) {
  const mapping = getCourseMapping(subject);
  return mapping ? mapping.lessons : [];
}

/**
 * Validate if file IDs are configured
 */
function validateFileIds() {
  const notSet = Object.entries(DRIVE_FILE_IDS)
    .filter(([key, val]) => val.startsWith('YOUR_'))
    .map(([key]) => key);
  
  return {
    valid: notSet.length === 0,
    missingKeys: notSet
  };
}

module.exports = {
  DRIVE_FILE_IDS,
  LESSON_STRUCTURES,
  getCourseMapping,
  getDriveFileId,
  getLessonInfo,
  getAllLessons,
  validateFileIds
};
