/**
 * Original course map aligned to ICAI's Foundation study-material structure
 * applicable from the May 2026 examination onward.
 *
 * This file contains topic names and original teaching guidance only. It does
 * not reproduce ICAI study-material text.
 */

const SOURCE = {
  authority: 'The Institute of Chartered Accountants of India (ICAI)',
  scheme: 'New Scheme of Education and Training',
  applicableFrom: 'May 2026 examination onward',
  verifiedOn: '2026-07-19',
  syllabusUrl: 'https://www.icai.org/post/foundation-nset',
  studyMaterialUrl: 'https://www.icai.org/post/study-material-nset',
  disclaimer:
    'Original MGrand teaching material aligned to the ICAI syllabus. It is not an ICAI publication or substitute for official announcements and corrigenda.',
};

const lesson = (chapterNumber, topic, coverage, options = {}) => ({
  chapterNumber,
  topic,
  coverage,
  moduleNumber: options.moduleNumber || 1,
  part: options.part,
  duration: options.duration || 75,
  examMode: options.examMode,
});

const courses = [
  {
    id: 'ca-f-accounting',
    paper: 1,
    code: 'CA-F-ACC',
    subject: 'Accounting',
    title: 'CA Foundation Paper 1: Accounting',
    description:
      'Build accounting logic from first principles, then master recording, adjustments, final accounts, partnership, LLP and company accounts.',
    examMode: 'Subjective',
    localFile: 'ca-f-accounting.json',
    driveEnv: 'GDRIVE_ACCOUNTING_FILE_ID',
    modules: ['Module 1', 'Module 2'],
    lessons: [
      lesson(1, 'Theoretical Framework', [
        'meaning, objectives, users and limitations of accounting',
        'accounting concepts, principles and conventions',
        'capital and revenue expenditure and receipts',
        'contingent assets and contingent liabilities',
        'accounting policies, estimates, valuation principles and standards',
      ], { duration: 100 }),
      lesson(2, 'Accounting Process', [
        'accounting equation and the debit-credit logic',
        'journal entries and narration',
        'ledger posting and balancing',
        'trial balance and methods of preparation',
        'subsidiary books, cash book and rectification of errors',
      ], { duration: 150 }),
      lesson(3, 'Bank Reconciliation Statement', [
        'causes of difference between cash book and pass book',
        'reconciliation from favourable and overdraft balances',
        'adjusted cash book method and treatment of common timing items',
      ]),
      lesson(4, 'Inventories', [
        'cost of inventory and costs excluded from valuation',
        'net realisable value and the lower-of-cost-and-NRV rule',
        'FIFO and weighted-average cost formulas',
        'periodic and perpetual inventory systems',
      ]),
      lesson(5, 'Depreciation and Amortisation', [
        'depreciable amount, useful life and residual value',
        'straight-line and written-down-value methods',
        'change in method, revision of estimate, disposal and replacement',
      ]),
      lesson(6, 'Bills of Exchange and Promissory Notes', [
        'parties, acceptance, maturity and days of grace',
        'retention, discounting, endorsement and collection',
        'dishonour, noting charges, renewal, retirement and insolvency',
      ]),
      lesson(7, 'Final Accounts of Sole Proprietors', [
        'trading account, statement of profit and loss and balance sheet',
        'year-end adjustments and their double effect',
        'manufacturing account and cost of production',
      ], { duration: 120 }),
      lesson(8, 'Financial Statements of Not-for-Profit Organisations', [
        'receipts and payments account versus income and expenditure account',
        'subscription, donation, entrance fee, legacy and special funds',
        'preparation of income and expenditure account and balance sheet',
      ], { moduleNumber: 2, duration: 100 }),
      lesson(9, 'Accounts from Incomplete Records', [
        'statement of affairs method and calculation of opening capital',
        'conversion of incomplete information into missing-account figures',
        'preparation of final accounts from reconstructed records',
      ], { moduleNumber: 2, duration: 100 }),
      lesson(10, 'Partnership and LLP Accounts', [
        'profit-sharing, fixed and fluctuating capitals and past adjustments',
        'goodwill valuation and treatment',
        'admission, retirement and death of a partner',
        'dissolution, realisation account and settlement of partners',
      ], { moduleNumber: 2, duration: 180 }),
      lesson(11, 'Company Accounts', [
        'share capital terminology and basic company-accounting entries',
        'issue, forfeiture and reissue of shares',
        'issue and redemption of preference shares and debentures',
        'bonus issue and rights issue',
      ], { moduleNumber: 2, duration: 180 }),
    ],
  },
  {
    id: 'ca-f-business-laws',
    paper: 2,
    code: 'CA-F-LAW',
    subject: 'Business Laws',
    title: 'CA Foundation Paper 2: Business Laws',
    description:
      'Learn to identify legal issues, state the applicable rule, apply facts and reach a reasoned conclusion in ICAI-style case answers.',
    examMode: 'Subjective',
    localFile: 'ca-f-business-laws.json',
    driveEnv: 'GDRIVE_LAWS_FILE_ID',
    modules: ['Business Laws'],
    lessons: [
      lesson(1, 'Indian Regulatory Framework', [
        'sources of Indian law and the legislative process',
        'court hierarchy, precedent and basic dispute-resolution institutions',
        'how to read a provision, identify an issue and structure a legal answer',
      ]),
      lesson(2, 'The Indian Contract Act, 1872', [
        'nature, classification and formation of contracts',
        'offer, acceptance, consideration, capacity and free consent',
        'legality, void agreements and contingent and quasi contracts',
        'performance, discharge, breach and remedies',
        'indemnity, guarantee, bailment, pledge and agency',
      ], { duration: 240 }),
      lesson(3, 'The Sale of Goods Act, 1930', [
        'formation of a contract of sale and distinction from an agreement to sell',
        'conditions, warranties and the caveat emptor exceptions',
        'transfer of property, title, risk and delivery',
        'rights of an unpaid seller against goods and buyer',
      ], { duration: 130 }),
      lesson(4, 'The Indian Partnership Act, 1932', [
        'essential elements and tests of partnership',
        'authority, mutual rights and duties of partners',
        'incoming and outgoing partners and liability to third parties',
        'registration and modes and consequences of dissolution',
      ], { duration: 130 }),
      lesson(5, 'The Limited Liability Partnership Act, 2008', [
        'nature, separate legal entity and perpetual succession of an LLP',
        'partners, designated partners and incorporation',
        'mutual rights, liability, financial disclosures and conversion',
      ]),
      lesson(6, 'The Companies Act, 2013', [
        'company characteristics, corporate veil and classifications',
        'promotion, incorporation, memorandum and articles',
        'capital, membership and basic management concepts within Foundation scope',
      ], { duration: 110 }),
      lesson(7, 'The Negotiable Instruments Act, 1881', [
        'promissory note, bill of exchange and cheque',
        'holder, holder in due course, negotiation and endorsement',
        'presentment, dishonour, discharge and material alteration',
      ], { duration: 100 }),
    ],
  },
  {
    id: 'ca-f-quantitative-aptitude',
    paper: 3,
    code: 'CA-F-QA',
    subject: 'Quantitative Aptitude',
    title: 'CA Foundation Paper 3: Quantitative Aptitude',
    description:
      'A complete objective-paper path through Business Mathematics, Logical Reasoning and Statistics, with fast methods and negative-marking discipline.',
    examMode: 'Objective with 0.25 negative marking',
    localFile: 'ca-f-quantitative-aptitude.json',
    driveEnv: 'GDRIVE_MATHS_FILE_ID',
    modules: ['Business Mathematics', 'Logical Reasoning', 'Statistics'],
    lessons: [
      lesson(1, 'Ratio, Proportion, Indices and Logarithms', ['ratio and proportion', 'laws of indices', 'logarithm laws and applications'], { part: 'Business Mathematics' }),
      lesson(2, 'Equations', ['linear and simultaneous equations', 'quadratic equations', 'business applications of equations'], { part: 'Business Mathematics' }),
      lesson(3, 'Linear Inequalities', ['solution sets', 'number-line representation', 'two-variable graphical interpretation'], { part: 'Business Mathematics' }),
      lesson(4, 'Mathematics of Finance', ['simple and compound interest', 'effective rates', 'annuities, present value, future value and sinking funds'], { part: 'Business Mathematics', duration: 120 }),
      lesson(5, 'Permutations and Combinations', ['fundamental counting principle', 'arrangements and selections', 'restricted cases'], { part: 'Business Mathematics' }),
      lesson(6, 'Sequences and Series', ['arithmetic progression', 'geometric progression', 'sum and business applications'], { part: 'Business Mathematics' }),
      lesson(7, 'Sets, Relations, Functions, Limits and Continuity', ['set operations and Venn diagrams', 'relations and functions', 'basic limits and continuity'], { part: 'Business Mathematics', duration: 100 }),
      lesson(8, 'Business Applications of Calculus', ['derivatives and marginal concepts', 'maxima and minima', 'basic integration and business applications'], { part: 'Business Mathematics', duration: 120 }),
      lesson(9, 'Number Series, Coding-Decoding and Odd Man Out', ['pattern recognition', 'alphabet and symbol coding', 'classification'], { moduleNumber: 2, part: 'Logical Reasoning' }),
      lesson(10, 'Direction Sense Test', ['direction mapping', 'turns and orientation', 'shortest distance'], { moduleNumber: 2, part: 'Logical Reasoning' }),
      lesson(11, 'Seating Arrangements', ['linear arrangements', 'circular arrangements', 'constraint tables and elimination'], { moduleNumber: 2, part: 'Logical Reasoning' }),
      lesson(12, 'Blood Relations', ['family-tree notation', 'coded relations', 'generation and gender checks'], { moduleNumber: 2, part: 'Logical Reasoning' }),
      lesson(13, 'Statistical Description of Data and Sampling', ['data types and presentation', 'frequency distributions and graphs', 'population, sample and sampling methods'], { moduleNumber: 3, part: 'Statistics', duration: 100 }),
      lesson(14, 'Measures of Central Tendency and Dispersion', ['arithmetic mean, median and mode', 'range, quartile deviation, mean deviation and standard deviation', 'coefficient of variation'], { moduleNumber: 3, part: 'Statistics', duration: 120 }),
      lesson(15, 'Probability', ['sample space and events', 'addition and multiplication rules', 'conditional probability and Bayes reasoning'], { moduleNumber: 3, part: 'Statistics', duration: 110 }),
      lesson(16, 'Theoretical Distributions', ['binomial distribution', 'Poisson distribution', 'normal distribution and standardisation'], { moduleNumber: 3, part: 'Statistics', duration: 110 }),
      lesson(17, 'Correlation and Regression', ['scatter plots and correlation coefficients', 'rank correlation', 'regression lines and prediction'], { moduleNumber: 3, part: 'Statistics', duration: 120 }),
      lesson(18, 'Index Numbers', ['price and quantity indices', 'Laspeyres, Paasche and Fisher indices', 'tests, chain indices and purchasing power'], { moduleNumber: 3, part: 'Statistics', duration: 100 }),
    ],
  },
  {
    id: 'ca-f-business-economics',
    paper: 4,
    code: 'CA-F-ECO',
    subject: 'Business Economics',
    title: 'CA Foundation Paper 4: Business Economics',
    description:
      'Connect microeconomics, macroeconomics and the Indian economy through diagrams, causal chains and exam-focused objective practice.',
    examMode: 'Objective with 0.25 negative marking',
    localFile: 'ca-f-business-economics.json',
    driveEnv: 'GDRIVE_ECONOMICS_FILE_ID',
    modules: ['Business Economics'],
    lessons: [
      lesson(1, 'Nature and Scope of Business Economics', ['meaning and scope of business economics', 'microeconomics and macroeconomics', 'central economic problems and the price mechanism']),
      lesson(2, 'Theory of Demand and Supply', ['law, determinants and elasticity of demand', 'consumer behaviour and utility analysis', 'supply, elasticity and market equilibrium'], { duration: 130 }),
      lesson(3, 'Theory of Production and Cost', ['production function and laws of returns', 'isoquants and producer equilibrium', 'short-run and long-run cost concepts'], { duration: 120 }),
      lesson(4, 'Price Determination in Different Markets', ['market forms and their features', 'price determination', 'perfect competition, monopoly, monopolistic competition and oligopoly'], { duration: 140 }),
      lesson(5, 'Business Cycles', ['phases and indicators', 'causes and transmission', 'business decisions across the cycle']),
      lesson(6, 'Determination of National Income', ['national-income aggregates and measurement methods', 'nominal and real measures', 'Keynesian income determination and the multiplier'], { duration: 120 }),
      lesson(7, 'Public Finance', ['allocation, distribution and stabilisation functions', 'market failure and government intervention', 'budget, revenue, expenditure, public debt and fiscal policy'], { duration: 130 }),
      lesson(8, 'Money Market', ['demand for money', 'money supply and monetary aggregates', 'central banking and monetary-policy transmission'], { duration: 110 }),
      lesson(9, 'International Trade', ['trade theories and gains from trade', 'tariffs, quotas and trade negotiations', 'exchange rates and international capital movements'], { duration: 140 }),
      lesson(10, 'Indian Economy', ['sectoral structure and structural transformation', 'planning, reforms and policy institutions', 'growth, inclusion, employment, inflation and external-sector challenges'], { duration: 130 }),
    ],
  },
];

module.exports = { SOURCE, courses };
