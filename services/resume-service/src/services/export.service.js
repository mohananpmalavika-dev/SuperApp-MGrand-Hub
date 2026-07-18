const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../../../packages/shared/src/logger');

/**
 * Export Service
 * Handles PDF and DOCX generation from resume data
 */
class ExportService {
  constructor() {
    this.templatesPath = path.join(__dirname, '../templates');
  }

  /**
   * Export resume as PDF
   */
  async exportToPDF(resume, template = 'modern') {
    try {
      logger.info(`Exporting resume ${resume._id} to PDF with template: ${template}`);

      // Generate HTML from template
      const html = await this.generateHTML(resume, template);

      // Use Puppeteer to convert HTML to PDF
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF with proper formatting
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in',
        },
      });

      await browser.close();

      // Record export
      await resume.recordExport();

      return {
        buffer: pdfBuffer,
        filename: `${this.sanitizeFilename(resume.title)}.pdf`,
        mimeType: 'application/pdf',
      };
    } catch (error) {
      logger.error('Error exporting resume to PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Export resume as DOCX
   */
  async exportToDOCX(resume) {
    try {
      logger.info(`Exporting resume ${resume._id} to DOCX`);

      const sections = [];

      // Header with name and contact info
      sections.push(
        new Paragraph({
          text: `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        })
      );

      // Contact Information
      const contactInfo = [
        resume.personalInfo.email,
        resume.personalInfo.phone,
        resume.personalInfo.location,
        resume.personalInfo.linkedin,
        resume.personalInfo.portfolio,
      ].filter(Boolean).join(' | ');

      sections.push(
        new Paragraph({
          children: [new TextRun({ text: contactInfo, size: 20 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );

      // Professional Summary
      if (resume.summary) {
        sections.push(
          new Paragraph({
            text: 'PROFESSIONAL SUMMARY',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: resume.summary,
            spacing: { after: 200 },
          })
        );
      }

      // Work Experience
      if (resume.experience && resume.experience.length > 0) {
        sections.push(
          new Paragraph({
            text: 'WORK EXPERIENCE',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );

        resume.experience.forEach((exp) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: exp.position, bold: true, size: 24 }),
                new TextRun({ text: ` - ${exp.company}`, size: 24 }),
              ],
              spacing: { before: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
                  italics: true,
                  size: 20,
                }),
                exp.location ? new TextRun({ text: ` | ${exp.location}`, italics: true, size: 20 }) : null,
              ].filter(Boolean),
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: exp.description || '',
              spacing: { after: 100 },
            })
          );

          if (exp.achievements && exp.achievements.length > 0) {
            exp.achievements.forEach((achievement) => {
              sections.push(
                new Paragraph({
                  text: `• ${achievement}`,
                  spacing: { left: 200, after: 50 },
                })
              );
            });
          }
        });
      }

      // Education
      if (resume.education && resume.education.length > 0) {
        sections.push(
          new Paragraph({
            text: 'EDUCATION',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );

        resume.education.forEach((edu) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: edu.degree, bold: true, size: 24 }),
                new TextRun({ text: ` - ${edu.institution}`, size: 24 }),
              ],
              spacing: { before: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: edu.endYear, italics: true, size: 20 }),
                edu.location ? new TextRun({ text: ` | ${edu.location}`, italics: true, size: 20 }) : null,
                edu.gpa ? new TextRun({ text: ` | GPA: ${edu.gpa}`, italics: true, size: 20 }) : null,
              ].filter(Boolean),
              spacing: { after: 100 },
            })
          );

          if (edu.description) {
            sections.push(
              new Paragraph({
                text: edu.description,
                spacing: { after: 100 },
              })
            );
          }
        });
      }

      // Skills
      if (resume.skills) {
        const allSkills = [
          ...(resume.skills.technical || []),
          ...(resume.skills.soft || []),
          ...(resume.skills.languages || []),
          ...(resume.skills.tools || []),
          ...(resume.skills.other || []),
        ];

        if (allSkills.length > 0) {
          sections.push(
            new Paragraph({
              text: 'SKILLS',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              text: allSkills.join(' • '),
              spacing: { after: 200 },
            })
          );
        }
      }

      // Certifications
      if (resume.certifications && resume.certifications.length > 0) {
        sections.push(
          new Paragraph({
            text: 'CERTIFICATIONS',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );

        resume.certifications.forEach((cert) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: cert.name, bold: true }),
                cert.issuer ? new TextRun({ text: ` - ${cert.issuer}` }) : null,
                cert.issueDate ? new TextRun({ text: ` (${cert.issueDate})`, italics: true }) : null,
              ].filter(Boolean),
              spacing: { before: 50, after: 50 },
            })
          );
        });
      }

      // Projects
      if (resume.projects && resume.projects.length > 0) {
        sections.push(
          new Paragraph({
            text: 'PROJECTS',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );

        resume.projects.forEach((project) => {
          sections.push(
            new Paragraph({
              text: project.name,
              bold: true,
              spacing: { before: 100 },
            }),
            new Paragraph({
              text: project.description || '',
              spacing: { after: 50 },
            })
          );

          if (project.technologies && project.technologies.length > 0) {
            sections.push(
              new Paragraph({
                text: `Technologies: ${project.technologies.join(', ')}`,
                italics: true,
                spacing: { after: 100 },
              })
            );
          }
        });
      }

      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: sections,
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);

      // Record export
      await resume.recordExport();

      return {
        buffer,
        filename: `${this.sanitizeFilename(resume.title)}.docx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
    } catch (error) {
      logger.error('Error exporting resume to DOCX:', error);
      throw new Error('Failed to generate DOCX');
    }
  }

  /**
   * Generate HTML from resume data and template
   */
  async generateHTML(resume, templateName = 'modern') {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
      
      // Check if template file exists
      try {
        await fs.access(templatePath);
      } catch {
        // Use default template if not found
        return this.generateDefaultHTML(resume);
      }

      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const template = handlebars.compile(templateContent);

      // Prepare data for template
      const data = {
        ...resume.toObject(),
        fullName: `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`,
        currentYear: new Date().getFullYear(),
      };

      return template(data);
    } catch (error) {
      logger.error('Error generating HTML:', error);
      return this.generateDefaultHTML(resume);
    }
  }

  /**
   * Generate default HTML template
   */
  generateDefaultHTML(resume) {
    const { personalInfo, summary, experience, education, skills } = resume;
    const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullName} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', sans-serif;
      color: #333;
      line-height: 1.6;
      padding: 40px;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #2c3e50;
      padding-bottom: 20px;
    }
    h1 {
      font-size: 36px;
      color: #2c3e50;
      margin-bottom: 10px;
    }
    .contact {
      font-size: 14px;
      color: #666;
    }
    .section {
      margin-bottom: 25px;
    }
    h2 {
      font-size: 20px;
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 5px;
      margin-bottom: 15px;
      text-transform: uppercase;
    }
    .job, .edu {
      margin-bottom: 15px;
    }
    .job-title, .degree {
      font-weight: bold;
      font-size: 16px;
    }
    .company, .institution {
      color: #3498db;
      font-size: 15px;
    }
    .date {
      font-style: italic;
      color: #666;
      font-size: 14px;
    }
    .description {
      margin-top: 5px;
    }
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .skill {
      background: #ecf0f1;
      padding: 5px 10px;
      border-radius: 3px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${fullName}</h1>
    <div class="contact">
      ${personalInfo.email} | ${personalInfo.phone || ''} | ${personalInfo.location || ''}
      ${personalInfo.linkedin ? `| ${personalInfo.linkedin}` : ''}
      ${personalInfo.portfolio ? `| ${personalInfo.portfolio}` : ''}
    </div>
  </div>

  ${summary ? `
  <div class="section">
    <h2>Professional Summary</h2>
    <p>${summary}</p>
  </div>
  ` : ''}

  ${experience && experience.length > 0 ? `
  <div class="section">
    <h2>Work Experience</h2>
    ${experience.map(exp => `
      <div class="job">
        <div class="job-title">${exp.position}</div>
        <div class="company">${exp.company}</div>
        <div class="date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
        ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
        ${exp.achievements && exp.achievements.length > 0 ? `
          <ul>
            ${exp.achievements.map(a => `<li>${a}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${education && education.length > 0 ? `
  <div class="section">
    <h2>Education</h2>
    ${education.map(edu => `
      <div class="edu">
        <div class="degree">${edu.degree}</div>
        <div class="institution">${edu.institution}</div>
        <div class="date">${edu.endYear}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${skills && (skills.technical || skills.soft || skills.tools) ? `
  <div class="section">
    <h2>Skills</h2>
    <div class="skills">
      ${[...(skills.technical || []), ...(skills.soft || []), ...(skills.tools || [])]
        .map(skill => `<span class="skill">${skill}</span>`).join('')}
    </div>
  </div>
  ` : ''}
</body>
</html>
    `;
  }

  /**
   * Sanitize filename for export
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }
}

module.exports = new ExportService();
