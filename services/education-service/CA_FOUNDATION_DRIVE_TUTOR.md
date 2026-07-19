# CA Foundation Drive Tutor

This module targets the ICAI Foundation syllabus applicable from the May 2026
examination onward. Course material is stored as JSON in Google Drive, cached in
memory, and backed by bundled files if Drive is temporarily unavailable. Course
material does not need MongoDB.

## Coverage

- Paper 1: Accounting — 11 chapter lessons
- Paper 2: Business Laws — 7 chapter lessons
- Paper 3: Quantitative Aptitude — 18 chapter lessons
- Paper 4: Business Economics — 10 chapter lessons

Each lesson includes original text teaching, browser audio narration, a guided
visual class, worked reasoning, practice, revision and a lesson-scoped tutor.
The tutor reloads the Drive lesson and uses it as grounding context before
answering.

## Drive configuration

```env
GDRIVE_CA_FOUNDATION_FOLDER_ID=1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw
GDRIVE_COURSE_CATALOG_FILE_ID=1GA5OvnqP9TrxllrUKLy_k1EpDa29xxRz
GDRIVE_ACCOUNTING_FILE_ID=19Au6YbuWNOOkFXYTavuiSmbMtffbHMuE
GDRIVE_LAWS_FILE_ID=110O7Ct9S0LpXvGJYmGu0NnOb7JvG-jWY
GDRIVE_MATHS_FILE_ID=1dIqWoR_v73zffRTkKb5qOlCWbzFUfkAb
GDRIVE_ECONOMICS_FILE_ID=1YJEjP-sjlVMMWer4hYCr7NnoZkIQA-Se

# Optional local-only mode
USE_LOCAL_CONTENT=false
LOCAL_CONTENT_PATH=./content/ca-foundation
```

## Regenerate and validate

Run these commands from the repository root:

```bash
node scripts/generate-ca-foundation-2026-materials.js
node scripts/validate-ca-foundation-2026.js
node scripts/test-ca-foundation-service.js
```

## API

```text
GET  /api/education/ca-foundation/courses
GET  /api/education/ca-foundation/courses/:courseId
GET  /api/education/ca-foundation/courses/:courseId/lessons/:lessonIndex
POST /api/education/ca-foundation/tutor/ask
```

The material follows the official syllabus structure but is an original MGrand
teaching resource, not an ICAI publication. Current ICAI announcements and
corrigenda remain authoritative where examination or statutory details change.
