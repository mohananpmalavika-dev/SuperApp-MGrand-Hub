/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { SOURCE, courses } = require('../services/education-service/src/config/ca-foundation-syllabus-2026');

const outputDirectory = path.resolve(
  __dirname,
  '../services/education-service/content/ca-foundation'
);

const titleCase = (value) =>
  value.replace(/\b\w/g, (character) => character.toUpperCase());

const subjectMethod = {
  Accounting: {
    method:
      'Classify the transaction, identify the accounts affected, apply debit-credit logic, post the effect, and verify the final balance.',
    answerFrame:
      'Show the working clearly, state every adjustment, preserve the double effect, and finish with a balance or statement that can be checked.',
    trap:
      'Do not memorise an entry without asking which asset, liability, income, expense or capital item is changing.',
  },
  'Business Laws': {
    method:
      'Use IRAC: identify the Issue, state the applicable Rule, Apply the rule to each material fact, and write a precise Conclusion.',
    answerFrame:
      'Use legal keywords carefully, keep rule and application in separate paragraphs, and never invent a section number.',
    trap:
      'A fact that sounds fair is not automatically the legal result; test every essential condition and exception.',
  },
  'Quantitative Aptitude': {
    method:
      'Translate the words into symbols, choose the shortest valid method, calculate carefully, and sanity-check the option before marking it.',
    answerFrame:
      'Write the formula or logical constraint first, substitute with units, eliminate impossible options, and manage negative-marking risk.',
    trap:
      'Do not force a memorised formula until you have checked its conditions and the units used in the question.',
  },
  'Business Economics': {
    method:
      'Define the concept, trace the causal chain, use the appropriate curve or identity, and distinguish movement along a curve from a shift.',
    answerFrame:
      'Connect assumptions to outcomes and compare nearby concepts before choosing an objective answer.',
    trap:
      'Avoid selecting an option merely because it contains a familiar term; test the direction of change and the ceteris-paribus assumption.',
  },
};

const buildConcept = (focus, index, subject) => ({
  concept: titleCase(focus),
  definition: `The chapter block dealing with ${focus}.`,
  explanation:
    `Master this by being able to define it in your own words, recognise it in a new fact pattern, ` +
    `apply its rule or method, and explain why a tempting alternative is wrong. ` +
    `${subjectMethod[subject].method}`,
  checkpoint: `Can you teach ${focus} in two minutes without looking at the notes?`,
  order: index + 1,
});

const buildDetailedContent = (course, item) => {
  const pedagogy = subjectMethod[course.subject];
  const sections = item.coverage
    .map(
      (focus, index) =>
        `### ${index + 1}. ${titleCase(focus)}\n\n` +
        `Start with the meaning and purpose of **${focus}**. Then separate its essential elements, ` +
        `conditions and exceptions. Connect it to the earlier block before attempting mixed questions. ` +
        `Your mastery test is not recall alone: you should be able to recognise the concept when the ` +
        `question changes its wording, demonstrate the method, and justify the result.\n\n` +
        `**Study drill:** write a one-line definition, a worked or real-life illustration, one common ` +
        `mistake, and one exam question that combines this block with another part of the chapter.`
    )
    .join('\n\n');

  return (
    `## The chapter in one view\n\n` +
    `**${item.topic}** is studied as a connected decision system, not as isolated definitions. ` +
    `${pedagogy.method}\n\n` +
    `## Deep-learning sequence\n\n` +
    `1. Build vocabulary and the basic rule.\n` +
    `2. Work through a clean single-concept illustration.\n` +
    `3. Add an exception, adjustment or competing rule.\n` +
    `4. Attempt an exam-style mixed question under time pressure.\n` +
    `5. Explain the answer aloud and record the error, if any, in an error log.\n\n` +
    `${sections}\n\n` +
    `## How to present the answer\n\n${pedagogy.answerFrame}\n\n` +
    `## Final self-check\n\n` +
    `Before moving ahead, close the notes and reconstruct the chapter map. If one link is missing, ask ` +
    `the lesson tutor to reteach that exact link with a fresh illustration.`
  );
};

const buildSolvedExamples = (course, item) => {
  const first = item.coverage[0];
  const second = item.coverage[1] || item.coverage[0];
  return [
    {
      question:
        `A student can repeat the definition of ${first} but cannot identify it when the facts are rearranged. ` +
        `How should the student analyse the question?`,
      solution:
        `**Step 1 — Extract facts:** remove decorative wording and list only the quantities, events, legal facts or economic changes.\n\n` +
        `**Step 2 — State the test:** write the conditions that make ${first} applicable.\n\n` +
        `**Step 3 — Match:** connect each condition to a fact. Mark missing conditions explicitly.\n\n` +
        `**Step 4 — Check the nearest alternative:** compare the result with ${second}; this prevents a familiar-word trap.\n\n` +
        `**Step 5 — Conclude:** give the result and one sentence of justification.`,
      keyTakeaway: 'Recognition plus justified application is the real exam skill.',
    },
    {
      question:
        `Create a mixed revision answer connecting ${first} with ${second}. What must a complete answer contain?`,
      solution:
        `A complete response contains: (1) a correct definition of both blocks, (2) the link or distinction ` +
        `between them, (3) the method, rule or causal chain, (4) a short illustration, and (5) a check of ` +
        `the most likely error. ${subjectMethod[course.subject].answerFrame}`,
      keyTakeaway: 'Mixed questions reward connections, not separate memorised paragraphs.',
    },
  ];
};

const buildPractice = (course, item) =>
  item.coverage.map((focus, index) => ({
    id: `${course.code}-${item.chapterNumber}-${index + 1}`,
    question:
      index === 0
        ? `Explain ${focus} to a beginner, then give one exam-relevant application.`
        : `Distinguish ${focus} from the closest concept in this chapter and explain the consequence of confusing them.`,
    type: course.examMode.startsWith('Objective') ? 'concept-check' : 'written-practice',
    difficulty: index < 2 ? 'Foundation' : 'Exam',
    answerGuide: [
      'State the meaning or rule precisely.',
      'List the conditions, components or steps.',
      'Apply it to a short original illustration.',
      'Mention one exception or common trap.',
    ],
    marks: course.examMode.startsWith('Objective') ? 1 : 4,
  }));

const buildSlides = (course, item) => {
  const slides = [
    {
      title: item.topic,
      body: `Paper ${course.paper} · ${course.subject}\n${item.coverage.length} mastery blocks · ${item.duration} minutes`,
      cue: 'Preview the complete chapter map before entering the details.',
    },
    ...item.coverage.map((focus, index) => ({
      title: `${index + 1}. ${titleCase(focus)}`,
      body:
        `Meaning → conditions → method → illustration → trap\n\n` +
        `Pause and explain this block in your own words before continuing.`,
      cue: `Teach ${focus} with one original example and contrast it with the nearest alternative.`,
    })),
    {
      title: 'Retrieval checkpoint',
      body:
        `Close the notes. Rebuild the chapter map, attempt one mixed question, and log the first point where your reasoning becomes uncertain.`,
      cue: 'Use the tutor for the uncertain point, then attempt a new question without help.',
    },
  ];

  return {
    format: 'guided-slides',
    estimatedMinutes: Math.max(12, slides.length * 3),
    slides,
  };
};

const buildLesson = (course, item, lessonIndex) => {
  const pedagogy = subjectMethod[course.subject];
  const objectives = item.coverage.map((focus) => `Understand and apply ${focus}`);
  const introduction =
    `## Why this chapter matters\n\n` +
    `${item.topic} is part of **CA Foundation Paper ${course.paper}: ${course.subject}** under the ` +
    `${SOURCE.scheme}. This lesson converts the official syllabus heading into an original teaching path ` +
    `for concept mastery, application and exam revision.\n\n` +
    `### Learning outcomes\n\n${objectives.map((objective) => `- ${objective}`).join('\n')}`;
  const narrationScript =
    `Welcome to ${item.topic}, in CA Foundation Paper ${course.paper}, ${course.subject}. ` +
    `In this lesson we will master ${item.coverage.join('; ')}. ` +
    `${pedagogy.method} ${pedagogy.trap} ` +
    `At the end, pause the audio and reconstruct the complete chapter map from memory.`;

  return {
    schemaVersion: 2,
    id: `${course.code.toLowerCase()}-chapter-${String(item.chapterNumber).padStart(2, '0')}`,
    lessonIndex,
    lessonNumber: lessonIndex + 1,
    moduleNumber: item.moduleNumber,
    moduleTitle: item.part || course.modules[item.moduleNumber - 1] || `Module ${item.moduleNumber}`,
    chapterNumber: item.chapterNumber,
    topic: item.topic,
    subject: course.subject,
    paper: course.paper,
    examType: 'CA_FOUNDATION',
    examMode: item.examMode || course.examMode,
    duration: item.duration,
    source: SOURCE,
    learningObjectives: objectives,
    introduction,
    keyConcepts: item.coverage.map((focus, index) => buildConcept(focus, index, course.subject)),
    detailedContent: buildDetailedContent(course, item),
    solvedExamples: buildSolvedExamples(course, item),
    commonMistakes: [
      {
        mistake: 'Passive rereading',
        why: 'Familiarity with a page can feel like mastery even when the idea cannot be recalled or applied.',
        howToAvoid: 'Use closed-book retrieval, then solve or explain a fresh application.',
      },
      {
        mistake: 'Skipping the nearest competing concept',
        why: 'ICAI-style questions often test a distinction, condition, exception or adjustment.',
        howToAvoid: `Compare every rule or method with its closest alternative. ${pedagogy.trap}`,
      },
    ],
    practiceProblems: buildPractice(course, item),
    quickRevision: {
      summary: item.coverage.map((focus) => `Master the meaning, conditions and application of ${focus}.`),
      formulas: course.subject === 'Quantitative Aptitude' ? ['Build a formula sheet while studying this chapter.'] : [],
      mnemonics: ['MAP: Meaning → Application → Pitfall'],
    },
    examTips: [
      pedagogy.answerFrame,
      pedagogy.trap,
      course.examMode.startsWith('Objective')
        ? 'Because a wrong objective answer attracts 0.25 negative marking, guess only after eliminating options with a stated reason.'
        : 'Reserve the final minutes for totals, legal conclusions, workings and unanswered sub-parts.',
    ],
    audio: {
      format: 'browser-tts',
      language: 'en-IN',
      narrationScript,
      sections: [
        { title: 'Chapter orientation', text: narrationScript },
        ...item.coverage.map((focus) => ({
          title: titleCase(focus),
          text:
            `Now study ${focus}. Define it, identify its conditions, apply it to an original example, ` +
            `and name the most likely mistake. Pause before continuing and explain the concept aloud.`,
        })),
      ],
    },
    video: buildSlides(course, item),
    tutorContext: {
      scope: [item.topic, ...item.coverage],
      teachingContract:
        'Teach from first principles, diagnose the student misconception, use Indian and ICAI-relevant examples, show every step, check understanding, and never claim the lesson is an official ICAI publication.',
    },
    status: 'published',
    generatedAt: new Date().toISOString(),
  };
};

fs.mkdirSync(outputDirectory, { recursive: true });

const catalog = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  source: SOURCE,
  storage: 'Google Drive JSON with bundled offline fallback',
  courses: [],
};

for (const course of courses) {
  const lessons = course.lessons.map((item, index) => buildLesson(course, item, index));
  const filePath = path.join(outputDirectory, course.localFile);
  fs.writeFileSync(filePath, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');

  catalog.courses.push({
    id: course.id,
    code: course.code,
    paper: course.paper,
    title: course.title,
    description: course.description,
    subject: course.subject,
    examType: 'CA_FOUNDATION',
    examMode: course.examMode,
    level: 'Foundation',
    instructor: 'MGrand CA Foundation Tutor',
    totalLessons: lessons.length,
    totalMinutes: lessons.reduce((sum, current) => sum + current.duration, 0),
    localFile: course.localFile,
    contentFileId: process.env[course.driveEnv] || course.driveFileId || null,
    source: SOURCE,
  });

  console.log(`Generated ${lessons.length} lessons: ${filePath}`);
}

fs.writeFileSync(
  path.join(outputDirectory, 'ca-foundation-catalog.json'),
  `${JSON.stringify(catalog, null, 2)}\n`,
  'utf8'
);
fs.writeFileSync(
  path.join(outputDirectory, 'manifest.json'),
  `${JSON.stringify(catalog, null, 2)}\n`,
  'utf8'
);

console.log(`Generated catalog for ${catalog.courses.length} courses.`);
