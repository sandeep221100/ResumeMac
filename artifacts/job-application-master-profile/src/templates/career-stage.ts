import type { TemplateConfig } from '../resumeTemplates';

// ---------------------------------------------------------------------------
// Career Stage — 10 templates (Batch 4)
// Each built around how much experience the candidate has and what needs
// to be foregrounded at that career stage.
// ---------------------------------------------------------------------------

export const careerStageTemplates: TemplateConfig[] = [
  // 1. Student — education-first, projects prominent, coursework line
  {
    metadata: {
      id: 'student',
      name: 'Student',
      category: 'career-stage',
      description: 'Education-and-potential-forward — Education leads, Projects as second section, coursework sub-line included.',
      targetUser: 'Current undergraduate/graduate students with little to no paid work experience.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 18, headingSize: 11.5, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.2 },
    colors: { text: '#000000', accent: '#4A90D9' },
    spacing: { lineHeight: 1.25, sectionBeforePt: 14, sectionAfterPt: 6 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['education', 'projects', 'skills', 'experience', 'achievements', 'leadership'],
    },
  },

  // 2. Intern — two-column, internship experience leads main column
  {
    metadata: {
      id: 'intern',
      name: 'Intern',
      category: 'career-stage',
      description: 'Skills-and-application-ready — Internship Experience leads the main column, sidebar keeps reference facts compact.',
      targetUser: 'Students or recent grads actively applying to internship programs.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 17, headingSize: 11.5, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'two-column-right', sidebarWidthPercent: 30, marginCm: 1.9, gutterCm: 0.9 },
    colors: { text: '#000000', accent: '#C4851C', sidebarBg: '#F9F6F0' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 12, sectionAfterPt: 4 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'tinted-sidebar' },
    sections: {
      headingStyle: 'bold-color',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'none',
      sectionOrder: ['experience', 'projects', 'achievements'],
      sidebarSections: ['education', 'skills', 'certifications'],
    },
  },

  // 3. Fresher — two-column, projects as primary proof section
  {
    metadata: {
      id: 'fresher',
      name: 'Fresher',
      category: 'career-stage',
      description: 'Projects-dominant — the largest, most detailed section compensates for short or absent experience.',
      targetUser: 'Recent graduates with no or minimal full-time work experience, actively job-hunting.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 18, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'two-column-right', sidebarWidthPercent: 35, marginCm: 1.9, gutterCm: 0.9 },
    colors: { text: '#000000', accent: '#2E8B57', sidebarBg: '#F0F7F4' },
    spacing: { lineHeight: 1.25, sectionBeforePt: 13, sectionAfterPt: 5 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'tinted-sidebar' },
    sections: {
      headingStyle: 'bold-color',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'none',
      sectionOrder: ['projects', 'experience', 'achievements'],
      sidebarSections: ['education', 'skills', 'certifications'],
    },
  },

  // 4. Entry-Level — experience = projects equal weight, transitional
  {
    metadata: {
      id: 'entry-level',
      name: 'Entry-Level',
      category: 'career-stage',
      description: 'Balanced transitional — Experience and Projects given equal section-level prominence back-to-back.',
      targetUser: 'Candidates with 0–2 years of paid full-time work experience.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 18, headingSize: 11.5, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0 },
    colors: { text: '#000000', accent: '#4A7FB5' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 13, sectionAfterPt: 5 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['experience', 'projects', 'skills', 'education', 'certifications', 'achievements'],
    },
  },

  // 5. Experienced Professional — experience-dominant, no projects, compressed education
  {
    metadata: {
      id: 'experienced-professional',
      name: 'Experienced Professional',
      category: 'career-stage',
      description: 'Experience-dominant — 55–65% of content is experience, education compressed, projects omitted.',
      targetUser: 'Candidates with 3+ years applying for IC or mid-management roles.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 19, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0 },
    colors: { text: '#000000', accent: '#2C4A6E' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 13, sectionAfterPt: 5 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['experience', 'skills', 'certifications', 'education'],
    },
  },

  // 6. Executive — career highlights block, condensed earlier roles
  {
    metadata: {
      id: 'executive',
      name: 'Executive',
      category: 'career-stage',
      description: 'Restrained high-trust layout — Career Highlights block + condensed Earlier Career summaries for decades of experience.',
      targetUser: 'VP/C-suite/senior director-level candidates with an extensive leadership track record.',
    },
    typography: { headingFont: 'serif', bodyFont: 'sans-serif', nameSize: 20, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.4 },
    colors: { text: '#000000', accent: '#333333', muted: '#555555' },
    spacing: { lineHeight: 1.25, sectionBeforePt: 16, sectionAfterPt: 6 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'none' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['experience', 'skills', 'education'],
    },
  },

  // 7. Career Switch — thematic transferable skills, condensed additional experience
  {
    metadata: {
      id: 'career-switch',
      name: 'Career Switch',
      category: 'career-stage',
      description: 'Functional/hybrid — leads with Transferable Skills grouped by theme, curates relevant experience.',
      targetUser: 'Candidates moving into a new industry or function whose recent titles don\'t map to the target role.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 18, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0 },
    colors: { text: '#000000', accent: '#C45D3E' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 13, sectionAfterPt: 5 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['skills', 'experience', 'projects', 'certifications', 'education'],
    },
  },

  // 8. Career Return — recent upskilling elevated, year-only dates
  {
    metadata: {
      id: 'career-return',
      name: 'Career Return',
      category: 'career-stage',
      description: 'Confidence-forward — Recent Upskilling leads, year-only dates de-emphasise gaps, two-tier experience split.',
      targetUser: 'Candidates returning to the workforce after an extended break.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 18, headingSize: 11.5, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.1 },
    colors: { text: '#000000', accent: '#B8860B' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 13, sectionAfterPt: 5 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['certifications', 'experience', 'skills', 'education'],
    },
  },

  // 9. Freelancer — services & skills + selected client work, experience optional
  {
    metadata: {
      id: 'freelancer',
      name: 'Freelancer',
      category: 'career-stage',
      description: 'Professional-identity-led — Services & Skills + Selected Client Work replace traditional employer-led structure.',
      targetUser: 'Independent freelancers/consultants presenting a body of client work.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 19, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0 },
    colors: { text: '#000000', accent: '#2E7D7D' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 13, sectionAfterPt: 5 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['skills', 'projects', 'experience', 'education', 'certifications'],
    },
  },

  // 10. Contractor — uniform contract-log structure, visible dividers between entries
  {
    metadata: {
      id: 'contractor',
      name: 'Contractor',
      category: 'career-stage',
      description: 'Contract-log style — every engagement follows identical Client/Contract/Scope/Duration structure.',
      targetUser: 'Independent contractors and contract-based professionals moving between client engagements.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 18, headingSize: 11.5, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0 },
    colors: { text: '#000000', accent: '#5A7A8E' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 12, sectionAfterPt: 4 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-company-dates',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['skills', 'experience', 'certifications', 'education'],
    },
  },
];
