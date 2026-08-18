import type { TemplateConfig } from '../resumeTemplates';

// ---------------------------------------------------------------------------
// ATS Safe — 10 templates (Batch 1)
// All single-column, ATS-optimised, no graphics/tables/icons
// ---------------------------------------------------------------------------

export const atsSafeTemplates: TemplateConfig[] = [
  // 1. ATS Classic — serif, centered header, monochrome
  {
    metadata: {
      id: 'ats-classic',
      name: 'ATS Classic',
      category: 'ats-safe',
      description: 'The traditional, timeless resume — serif, centered header, monochrome. Trusted by hiring managers for 20 years.',
      targetUser: 'All professionals seeking a conservative, universally-accepted resume format.',
    },
    typography: { headingFont: 'serif', bodyFont: 'serif', nameSize: 20, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.2 },
    colors: { text: '#000000', accent: '#000000' },
    spacing: { lineHeight: 1.15, sectionBeforePt: 14, sectionAfterPt: 6 },
    header: { style: 'centered', contactSeparator: ' · ', showTitle: false },
    accent: { type: 'none' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['experience', 'education', 'skills', 'certifications'],
    },
  },

  // 2. ATS Professional — sans-serif, left-aligned, skills after summary
  {
    metadata: {
      id: 'ats-professional',
      name: 'ATS Professional',
      category: 'ats-safe',
      description: 'A polished, modern-but-safe corporate standard with sans-serif typography and skills placed right after the summary.',
      targetUser: 'Most office/business roles — the default recommendation for corporate applications.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 18, headingSize: 11, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0 },
    colors: { text: '#000000', accent: '#1F3A5F' },
    spacing: { lineHeight: 1.15, sectionBeforePt: 12, sectionAfterPt: 4 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: false },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['skills', 'experience', 'education', 'certifications', 'projects'],
    },
  },

  // 3. ATS Minimal — maximum whitespace, no dividers, quiet confidence
  {
    metadata: {
      id: 'ats-minimal',
      name: 'ATS Minimal',
      category: 'ats-safe',
      description: 'Maximum white space, minimum ornamentation. No dividers at all — whitespace signals confidence.',
      targetUser: 'Professionals with under 15 years experience who want a clean, understated look.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 17, headingSize: 10, bodySize: 10.5, smallSize: 9.5, nameWeight: 'regular', headingWeight: 'regular' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.5 },
    colors: { text: '#1a1a1a', accent: '#1a1a1a' },
    spacing: { lineHeight: 1.3, sectionBeforePt: 20, sectionAfterPt: 6 },
    header: { style: 'left-aligned', contactSeparator: ' — ', showTitle: false },
    accent: { type: 'none' },
    sections: {
      headingStyle: 'uppercase',
      entryLayout: 'stacked',
      bulletStyle: 'dash',
      divider: 'none',
      sectionOrder: ['experience', 'skills', 'education'],
    },
  },

  // 4. ATS Clean — colored name + partial heading underline
  {
    metadata: {
      id: 'ats-clean',
      name: 'ATS Clean',
      category: 'ats-safe',
      description: 'A crisp, contemporary look using one restrained accent color — colored name with short partial underline under headings.',
      targetUser: 'Professionals wanting a single accent color as the sole design element.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 19, headingSize: 11.5, bodySize: 10.5, smallSize: 9.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0 },
    colors: { text: '#000000', accent: '#0F6B5C' },
    spacing: { lineHeight: 1.15, sectionBeforePt: 12, sectionAfterPt: 5 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'underline' },
    sections: {
      headingStyle: 'bold-color',
      entryLayout: 'title-company-dates',
      bulletStyle: 'round',
      divider: 'partial-underline',
      sectionOrder: ['experience', 'skills', 'education', 'certifications', 'projects'],
    },
  },

  // 5. ATS Compact — dense, information-maximizing, tightest spacing
  {
    metadata: {
      id: 'ats-compact',
      name: 'ATS Compact',
      category: 'ats-safe',
      description: 'A dense, information-maximizing layout for extensive experience. Smallest fonts, tightest spacing.',
      targetUser: 'Candidates with 15+ years of experience needing more content on one page.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 15, headingSize: 10, bodySize: 9.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 1.6 },
    colors: { text: '#000000', accent: '#000000', muted: '#666666' },
    spacing: { lineHeight: 1.0, sectionBeforePt: 8, sectionAfterPt: 2 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: false },
    accent: { type: 'none' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-company-dates',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['experience', 'skills', 'education', 'certifications'],
    },
  },

  // 6. ATS Executive — formal serif, centered, double-rule framed headings
  {
    metadata: {
      id: 'ats-executive',
      name: 'ATS Executive',
      category: 'ats-safe',
      description: 'A formal, senior-level template with large centered serif name and double horizontal rules framing each heading.',
      targetUser: 'Director/VP/C-suite candidates — understated elegance for senior leadership.',
    },
    typography: { headingFont: 'serif', bodyFont: 'serif', nameSize: 22, headingSize: 12, bodySize: 10.5, smallSize: 9.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.5 },
    colors: { text: '#000000', accent: '#000000' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 16, sectionAfterPt: 6 },
    header: { style: 'centered', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'none' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'double-rule',
      sectionOrder: ['skills', 'experience', 'education', 'certifications'],
    },
  },

  // 7. ATS Corporate — rule-above-heading, rigid pipe-separated structure
  {
    metadata: {
      id: 'ats-corporate',
      name: 'ATS Corporate',
      category: 'ats-safe',
      description: 'A structured, big-company standard — rules above headings, rigid Field | Field | Field entry structure.',
      targetUser: 'Professionals at large corporations who want a systematic, predictable format.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 17, headingSize: 11, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.2 },
    colors: { text: '#000000', accent: '#333333' },
    spacing: { lineHeight: 1.15, sectionBeforePt: 14, sectionAfterPt: 6 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'none' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-company-dates',
      bulletStyle: 'round',
      divider: 'rule-above',
      sectionOrder: ['skills', 'experience', 'education', 'certifications', 'projects'],
    },
  },

  // 8. ATS Technical — monospace accent font, prominent projects section
  {
    metadata: {
      id: 'ats-technical',
      name: 'ATS Technical',
      category: 'ats-safe',
      description: 'Built for engineers and developers — monospace accent font for skills/tools, dedicated prominent Projects section.',
      targetUser: 'Software engineers, backend/frontend/full-stack developers, DevOps/SRE, data engineers.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', accentFont: 'monospace', nameSize: 17, headingSize: 11, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0 },
    colors: { text: '#000000', accent: '#4A6785' },
    spacing: { lineHeight: 1.15, sectionBeforePt: 12, sectionAfterPt: 5 },
    header: { style: 'left-aligned', contactSeparator: ' · ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['skills', 'experience', 'projects', 'education', 'certifications'],
    },
  },

  // 9. ATS Academic — CV-style, education-first, publications with hanging indents
  {
    metadata: {
      id: 'ats-academic',
      name: 'ATS Academic',
      category: 'ats-safe',
      description: 'A CV-style layout for researchers and academics — education-first, publications section, 2-page length supported.',
      targetUser: 'Researchers, PhD candidates, and academic-track applicants.',
    },
    typography: { headingFont: 'serif', bodyFont: 'serif', nameSize: 18, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
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

  // 10. ATS Simple — zero ornamentation, maximum compatibility
  {
    metadata: {
      id: 'ats-simple',
      name: 'ATS Simple',
      category: 'ats-safe',
      description: 'The absolute floor of design — zero ornamentation, no rules, no color, maximum ATS compatibility.',
      targetUser: 'When in doubt, use this. Maximum compatibility with legacy or unknown ATS platforms.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 16, headingSize: 11, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.5 },
    colors: { text: '#000000', accent: '#000000' },
    spacing: { lineHeight: 1.15, sectionBeforePt: 12, sectionAfterPt: 4 },
    header: { style: 'left-aligned', contactSeparator: '\n', showTitle: false },
    accent: { type: 'none' },
    sections: {
      headingStyle: 'bold',
      entryLayout: 'stacked',
      bulletStyle: 'round',
      divider: 'none',
      sectionOrder: ['experience', 'education', 'skills', 'certifications'],
    },
  },
];
