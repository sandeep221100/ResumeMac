import type { TemplateConfig } from '../resumeTemplates';

// ---------------------------------------------------------------------------
// Industry — 10 templates (Batch 3)
// Each built around how recruiters in that specific field scan resumes.
// ---------------------------------------------------------------------------

export const industryTemplates: TemplateConfig[] = [
  // 1. Tech / Software — two-column, skills sidebar, projects after experience
  {
    metadata: {
      id: 'tech-software',
      name: 'Tech / Software',
      category: 'industry',
      description: 'Build-and-ship resume — technical skills sidebar + experience + projects for "stack match then proof" scanning.',
      targetUser: 'Software engineers, backend/frontend/full-stack developers, DevOps/SRE, mobile engineers.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', accentFont: 'monospace', nameSize: 18, headingSize: 11, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'two-column-right', sidebarWidthPercent: 32, marginCm: 1.8, gutterCm: 0.9 },
    colors: { text: '#000000', accent: '#4A6785', sidebarBg: '#F5F6F8' },
    spacing: { lineHeight: 1.2, sidebarLineHeight: 1.3, sectionBeforePt: 12, sectionAfterPt: 4 },
    header: { style: 'left-aligned', contactSeparator: ' · ', showTitle: true },
    accent: { type: 'tinted-sidebar' },
    sections: {
      headingStyle: 'bold-color',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'none',
      sectionOrder: ['experience', 'projects'],
      sidebarSections: ['skills', 'certifications', 'education'],
    },
  },

  // 2. Data / AI — single column, bolded metrics, technical stack grouping
  {
    metadata: {
      id: 'data-ai',
      name: 'Data / AI',
      category: 'industry',
      description: 'Metrics-led resume — bolded quantified results in every bullet, three-way technical stack grouping.',
      targetUser: 'Data scientists, ML/AI engineers, data analysts, applied research engineers.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 18, headingSize: 11.5, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0 },
    colors: { text: '#000000', accent: '#0F6B5C' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 13, sectionAfterPt: 5 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'bold-color',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['skills', 'experience', 'projects', 'publications', 'education', 'certifications'],
    },
  },

  // 3. Business / Consulting — impact-first bullets, centered header
  {
    metadata: {
      id: 'business-consulting',
      name: 'Business / Consulting',
      category: 'industry',
      description: 'Case-study resume — impact-first bullets, optional Selected Engagements sub-list under consulting roles.',
      targetUser: 'Management consultants, strategy/business analysts, operations leads.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 19, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.1 },
    colors: { text: '#000000', accent: '#1F3A5F', muted: '#666666' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 13, sectionAfterPt: 5 },
    header: { style: 'centered', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['experience', 'education', 'skills', 'certifications'],
    },
  },

  // 4. Finance / Accounting — credentials-forward, certifications elevated
  {
    metadata: {
      id: 'finance-accounting',
      name: 'Finance / Accounting',
      category: 'industry',
      description: 'Credentials-forward — certifications placed ahead of experience, reflecting CPA/CFA screening priority.',
      targetUser: 'Financial analysts, accountants, controllers, auditors, FP&A, banking professionals.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 18, headingSize: 11.5, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.2 },
    colors: { text: '#000000', accent: '#1F4E3D' },
    spacing: { lineHeight: 1.15, sectionBeforePt: 12, sectionAfterPt: 4 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: false },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['certifications', 'experience', 'education', 'skills'],
    },
  },

  // 5. Marketing / Sales — key wins block, bolded metrics, campaigns
  {
    metadata: {
      id: 'marketing-sales',
      name: 'Marketing / Sales',
      category: 'industry',
      description: 'Results-and-revenue resume — Key Wins highlight block + bolded metrics throughout, built around numbers.',
      targetUser: 'Marketing managers, growth marketers, sales executives, account managers.',
    },
    typography: { headingFont: 'geometric-sans', bodyFont: 'sans-serif', nameSize: 19, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0 },
    colors: { text: '#000000', accent: '#D4573B' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 13, sectionAfterPt: 5 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'bold-color',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['experience', 'skills', 'education', 'certifications'],
    },
  },

  // 6. Product / Project — two-column, methodologies sidebar, key products
  {
    metadata: {
      id: 'product-project',
      name: 'Product / Project',
      category: 'industry',
      description: 'Ownership-and-outcomes — methodologies/tools sidebar + key products/initiatives as ownership portfolio.',
      targetUser: 'Product managers, project managers, program managers, product owners.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 18, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'two-column-right', sidebarWidthPercent: 34, marginCm: 1.9, gutterCm: 0.9 },
    colors: { text: '#000000', accent: '#3D5A80', sidebarBg: '#F5F6F8' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 12, sectionAfterPt: 4 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'tinted-sidebar' },
    sections: {
      headingStyle: 'bold-color',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'none',
      sectionOrder: ['experience', 'projects'],
      sidebarSections: ['skills', 'education', 'certifications'],
    },
  },

  // 7. Healthcare — licenses-first, clinical competencies, conservative
  {
    metadata: {
      id: 'healthcare',
      name: 'Healthcare',
      category: 'industry',
      description: 'Licensure-and-competency-forward — licenses/certs elevated ahead of experience, clinical competencies section.',
      targetUser: 'Nurses, allied health professionals, clinicians, healthcare administrators.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 18, headingSize: 11.5, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.2 },
    colors: { text: '#000000', accent: '#2E7D8E' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 12, sectionAfterPt: 4 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: false },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['certifications', 'experience', 'skills', 'education'],
    },
  },

  // 8. Design / Creative — oversized name, selected work prominent
  {
    metadata: {
      id: 'design-creative',
      name: 'Design / Creative',
      category: 'industry',
      description: 'Most visually expressive while staying ATS-safe — dramatic typographic scale contrast, Selected Work leads.',
      targetUser: 'Graphic designers, UX/UI designers, art directors, creative producers.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 26, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0 },
    colors: { text: '#000000', accent: '#7B2D8E' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 14, sectionAfterPt: 6 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'bold-color',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'none',
      sectionOrder: ['projects', 'experience', 'skills', 'education', 'certifications'],
    },
  },

  // 9. Academic / Research — research interests, grants & funding, 2-page
  {
    metadata: {
      id: 'academic-research',
      name: 'Academic / Research',
      category: 'industry',
      description: 'Funding-and-output-forward CV — research interests statement, grants & funding section, 2-page supported.',
      targetUser: 'PhD candidates, postdocs, research scientists, faculty applicants.',
    },
    typography: { headingFont: 'serif', bodyFont: 'serif', nameSize: 19, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.2 },
    colors: { text: '#000000', accent: '#000000' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 14, sectionAfterPt: 5 },
    header: { style: 'centered', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'none' },
    sections: {
      headingStyle: 'small-caps',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['education', 'experience', 'publications', 'skills', 'certifications', 'achievements'],
    },
  },

  // 10. Engineering — two-column, licenses at sidebar top, technical projects
  {
    metadata: {
      id: 'engineering',
      name: 'Engineering',
      category: 'industry',
      description: 'Specs-and-standards — credential-first sidebar + technical projects with measurable engineering outcomes.',
      targetUser: 'Mechanical, civil, electrical, and industrial engineers (non-software).',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 18, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'two-column-right', sidebarWidthPercent: 32, marginCm: 1.9, gutterCm: 0.9 },
    colors: { text: '#000000', accent: '#5A6E7F', sidebarBg: '#F5F6F8' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 12, sectionAfterPt: 4 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'tinted-sidebar' },
    sections: {
      headingStyle: 'bold-color',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'none',
      sectionOrder: ['experience', 'projects'],
      sidebarSections: ['certifications', 'skills', 'education'],
    },
  },
];
