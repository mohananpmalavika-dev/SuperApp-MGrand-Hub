# 📝 Resume Builder Service

A comprehensive microservice for creating, managing, and exporting professional resumes with cloud storage and multiple export formats.

## Features

### 🎯 Core Features
- **Resume Builder** - Step-by-step wizard for creating professional resumes
- **Cloud Storage** - Save and manage multiple resume drafts
- **Multiple Templates** - 6 professional, ATS-optimized templates
- **Export Formats** - PDF and DOCX (Word) export
- **Public Sharing** - Generate shareable links for resumes
- **Version Control** - Track resume versions and changes

### 📋 Resume Sections
- Personal Information (contact details, social links)
- Professional Summary
- Work Experience (unlimited entries with achievements)
- Education (degrees, certifications)
- Skills (categorized: technical, soft, languages, tools)
- Certifications (with credentials and expiry)
- Projects (with technologies and highlights)
- Languages (with proficiency levels)
- Awards & Honors
- Publications
- Volunteer Work

### 🎨 Templates
1. **Modern Professional** - Clean contemporary design
2. **Classic ATS** - Traditional applicant tracking system friendly
3. **Creative** - Stand-out design for creative fields
4. **Minimal** - Simple elegant layout
5. **Executive** - Senior leadership style
6. **Professional** - Balanced corporate design

### 📤 Export Options
- **PDF Export** - High-quality PDF with proper formatting (300 DPI)
- **Word Export** - Editable DOCX format for further customization
- **HTML Preview** - Real-time preview before export
- **Custom Templates** - Handlebars-based template system

### 🔒 Features
- User authentication and authorization
- Resume privacy controls
- Public/private resume URLs
- Export tracking and analytics
- Search and filter resumes
- Duplicate resumes
- Tag-based organization

## API Endpoints

### Resume Management

```http
POST   /api/resume/resumes                      # Create resume
GET    /api/resume/resumes                      # Get all user resumes
GET    /api/resume/resumes/:id                  # Get specific resume
PUT    /api/resume/resumes/:id                  # Update resume
DELETE /api/resume/resumes/:id                  # Delete resume
POST   /api/resume/resumes/:id/duplicate        # Duplicate resume
PATCH  /api/resume/resumes/:id/status           # Update status
POST   /api/resume/resumes/:id/public           # Make public
```

### Export

```http
GET    /api/resume/resumes/:id/export/pdf       # Export as PDF
GET    /api/resume/resumes/:id/export/docx      # Export as DOCX
```

### Templates

```http
GET    /api/resume/templates                    # Get all templates
GET    /api/resume/templates/:name              # Get specific template
```

### Analytics

```http
GET    /api/resume/resumes/statistics           # Get user statistics
GET    /api/resume/resumes/search               # Search resumes
```

### Public Access

```http
GET    /api/resume/public/:publicUrl            # View public resume
```

## Database Models

### Resume Model

```javascript
{
  userId: ObjectId,
  title: String,
  personalInfo: {
    firstName, lastName, email, phone,
    location, linkedin, portfolio, github, website
  },
  summary: String,
  experience: [{
    position, company, location,
    startDate, endDate, current,
    description, achievements: [String]
  }],
  education: [{
    degree, institution, location,
    startYear, endYear, gpa, honors, description
  }],
  skills: {
    technical: [String],
    soft: [String],
    languages: [String],
    tools: [String],
    other: [String]
  },
  certifications: [{
    name, issuer, issueDate, expiryDate,
    credentialId, url
  }],
  projects: [{
    name, description, technologies: [String],
    url, github, startDate, endDate, highlights: [String]
  }],
  languages: [{
    language, proficiency
  }],
  awards: [{ title, issuer, date, description }],
  publications: [{ title, publisher, date, url, description }],
  volunteer: [{
    role, organization, startDate, endDate, current, description
  }],
  template: String,
  theme: { primaryColor, secondaryColor, fontFamily, fontSize },
  status: 'draft' | 'published' | 'archived',
  version: Number,
  lastExported: Date,
  exportCount: Number,
  views: Number,
  isPublic: Boolean,
  publicUrl: String,
  tags: [String],
  targetRole: String,
  targetIndustry: String
}
```

### Template Model

```javascript
{
  name: String,
  displayName: String,
  description: String,
  category: 'professional' | 'creative' | 'academic' | 'technical' | 'executive',
  thumbnail: String,
  preview: String,
  config: {
    layout, sectionOrder, headerStyle,
    showPhoto, showIcons, colorScheme, typography
  },
  features: {
    atsOptimized, customizable, printFriendly, responsive
  },
  isActive: Boolean,
  isPremium: Boolean,
  usageCount: Number,
  rating: Number,
  tags: [String]
}
```

## Usage Examples

### Create Resume

```javascript
POST /api/resume/resumes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Software Engineer Resume",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "phone": "+1234567890",
    "location": "San Francisco, CA",
    "linkedin": "linkedin.com/in/johndoe",
    "portfolio": "johndoe.com"
  },
  "summary": "Experienced software engineer with 5+ years...",
  "template": "modern",
  "status": "draft"
}
```

### Export as PDF

```javascript
GET /api/resume/resumes/123abc/export/pdf?template=modern
Authorization: Bearer <token>

Response: PDF file download
```

### Make Resume Public

```javascript
POST /api/resume/resumes/123abc/public
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "publicUrl": "123abc-1234567890",
    "fullUrl": "https://app.com/resume/view/123abc-1234567890"
  }
}
```

## Environment Variables

```env
PORT=3006
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/superapp-resume
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
UPLOAD_DIR=./uploads/resumes
MAX_FILE_SIZE=10485760
PDF_QUALITY=high
PDF_DPI=300
```

## Installation

```bash
# Navigate to service directory
cd services/resume-service

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Docker Deployment

```bash
# Build image
docker build -t resume-service .

# Run container
docker run -p 3006:3006 \
  -e MONGODB_URI=mongodb://mongo:27017/superapp-resume \
  -e JWT_SECRET=your-secret \
  resume-service
```

## PDF Generation

The service uses **Puppeteer** for high-quality PDF generation:

- Headless Chromium for rendering
- Custom templates with Handlebars
- Print-optimized CSS
- A4 paper size
- Professional margins
- Background graphics support

## DOCX Generation

The service uses **docx** library for Word document export:

- Native Word formatting
- Section-based layout
- Professional styling
- Editable output
- Cross-platform compatibility

## Template System

Templates are HTML files with Handlebars syntax:

```handlebars
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Template-specific CSS */
  </style>
</head>
<body>
  <h1>{{fullName}}</h1>
  <p>{{personalInfo.email}}</p>
  
  {{#if summary}}
  <div class="summary">{{summary}}</div>
  {{/if}}
  
  {{#each experience}}
  <div class="job">
    <h3>{{position}} - {{company}}</h3>
    <p>{{startDate}} - {{#if current}}Present{{else}}{{endDate}}{{/if}}</p>
  </div>
  {{/each}}
</body>
</html>
```

## Performance Considerations

- **Caching**: Resume data cached in memory
- **Queue System**: Export jobs queued for processing
- **Rate Limiting**: 100 requests per 15 minutes
- **File Size**: Max 10MB per resume
- **Pagination**: Default 20 items per page

## Security

- JWT authentication required for all endpoints (except public)
- User can only access their own resumes
- Input validation and sanitization
- XSS protection with Helmet
- CORS configured for allowed origins
- Rate limiting to prevent abuse

## Testing

```bash
# Run tests
npm test

# Test specific endpoint
curl -X GET http://localhost:3006/api/resume/health
```

## Monitoring

Health check endpoint:
```http
GET /api/resume/health

Response:
{
  "success": true,
  "service": "resume-service",
  "status": "healthy",
  "timestamp": "2024-12-18T10:30:00.000Z"
}
```

## Future Enhancements

- [ ] AI-powered content suggestions
- [ ] Resume scoring and optimization
- [ ] ATS keyword analysis
- [ ] LinkedIn import
- [ ] Multi-language support
- [ ] Cover letter generator
- [ ] Resume comparison tool
- [ ] Analytics dashboard
- [ ] Collaboration features
- [ ] Version history with diff
- [ ] Custom branding
- [ ] Video resume support

## Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^7.6.3",
  "jspdf": "^2.5.1",
  "docx": "^8.5.0",
  "puppeteer": "^21.6.0",
  "handlebars": "^4.7.8",
  "multer": "^1.4.5-lts.1",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "jsonwebtoken": "^9.0.2"
}
```

## Support

For issues or feature requests:
- Check the documentation
- Contact the development team
- Create an issue in the project repository

## License

MIT License - Part of SuperApp MGrand Hub

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainers**: SuperApp Development Team
