import type { TemplateConfig } from '../resumeTemplates';

// ---------------------------------------------------------------------------
// Modern Professional — 10 templates (Batch 2)
// Premium, designed, ATS-conscious. Two-column layouts use flex regions.
// ---------------------------------------------------------------------------

export const modernProfessionalTemplates: TemplateConfig[] = [
  // 1. Modern Edge — full-height vertical accent bar, color on company names
  {
    metadata: {
      id: 'modern-edge',
      name: 'Modern Edge',
      category: 'modern-professional',
      description: 'Confident layout with a bold vertical accent bar running down the left edge — energetic but boardroom-appropriate.',
      targetUser: 'Mid-career professionals in marketing, sales, business development.',
    },
    typography: { headingFont: 'geometric-sans', bodyFont: 'sans-serif', nameSize: 20, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0, marginLeftCm: 2.6 },
    colors: { text: '#000000', accent: '#2451D6' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 14, sectionAfterPt: 6 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'vertical-bar', barWidthCm: 0.6 },
    sections: {
      headingStyle: 'bold-color',
      entryLayout: 'title-company-dates',
      bulletStyle: 'round',
      divider: 'none',
      sectionOrder: ['experience', 'skills', 'education', 'certifications', 'projects'],
    },
  },

  // 2. Modern Pro — flagship two-column with left tinted sidebar
  {
    metadata: {
      id: 'modern-pro',
      name: 'Modern Pro',
      category: 'modern-professional',
      description: 'The flagship two-column layout — light tinted sidebar for quick-scan facts, clean main column for narrative content.',
      targetUser: 'General-purpose modern professional for corporate, business, and office roles.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 19, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'two-column-left', sidebarWidthPercent: 33, marginCm: 1.8, gutterCm: 1.0 },
    colors: { text: '#000000', accent: '#2D6A8E', headingColor: '#2D6A8E', sidebarBg: '#F4F5F7' },
    spacing: { lineHeight: 1.2, sidebarLineHeight: 1.3, sectionBeforePt: 12, sectionAfterPt: 4 },
    header: { style: 'left-aligned', contactSeparator: ' · ', showTitle: false },
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

  // 3. Minimal Pro — serif display name + sans body + dash bullets
  {
    metadata: {
      id: 'minimal-pro',
      name: 'Minimal Pro',
      category: 'modern-professional',
      description: 'Refined minimalism with a serif display name, sans-serif body, and one small deliberate color accent.',
      targetUser: 'Designers-adjacent, consultants, professionals wanting understated sophistication.',
    },
    typography: { headingFont: 'serif', bodyFont: 'sans-serif', nameSize: 22, headingSize: 10.5, bodySize: 10.5, nameWeight: 'light', headingWeight: 'regular' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.4 },
    colors: { text: '#000000', accent: '#B5651D', muted: '#666666' },
    spacing: { lineHeight: 1.25, sectionBeforePt: 16, sectionAfterPt: 6 },
    header: { style: 'left-aligned', contactSeparator: ' · ', showTitle: false },
    accent: { type: 'underline' },
    sections: {
      headingStyle: 'uppercase',
      entryLayout: 'stacked',
      bulletStyle: 'dash',
      divider: 'partial-underline',
      sectionOrder: ['experience', 'education', 'skills', 'certifications'],
    },
  },

  // 4. Clean Bold — filled tag-style section headings, heavy-weight name
  {
    metadata: {
      id: 'clean-bold',
      name: 'Clean Bold',
      category: 'modern-professional',
      description: 'High-contrast, confident typography with filled pill/tag-style section headings that command attention.',
      targetUser: 'Sales, business development, leadership-track candidates projecting confidence and clarity.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 21, headingSize: 10.5, bodySize: 10.5, nameWeight: 'black', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0 },
    colors: { text: '#000000', accent: '#16233F' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 14, sectionAfterPt: 8 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'bold-color',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'none',
      sectionOrder: ['experience', 'skills', 'education', 'certifications', 'projects'],
    },
  },

  // 5. Elegant — centered serif, small-caps company names, muted accent
  {
    metadata: {
      id: 'elegant',
      name: 'Elegant',
      category: 'modern-professional',
      description: 'Soft, refined, and understated — centered serif headings, small-caps company names, muted low-saturation accent.',
      targetUser: 'Senior professionals in law, consulting, finance, or luxury sectors wanting polish without boldness.',
    },
    typography: { headingFont: 'serif', bodyFont: 'sans-serif', nameSize: 19, headingSize: 11.5, bodySize: 10.5, nameWeight: 'regular', headingWeight: 'regular' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.3 },
    colors: { text: '#000000', accent: '#A9758C', muted: '#666666' },
    spacing: { lineHeight: 1.3, sectionBeforePt: 16, sectionAfterPt: 6 },
    header: { style: 'centered', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'underline' },
    sections: {
      headingStyle: 'small-caps',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'dash',
      divider: 'thin-rule',
      sectionOrder: ['experience', 'education', 'skills', 'certifications'],
    },
  },

  // 6. Contemporary — full-bleed colored header band + two-column editorial body
  {
    metadata: {
      id: 'contemporary',
      name: 'Contemporary',
      category: 'modern-professional',
      description: 'Editorial two-column layout with a full-width colored header band — modern magazine profile page feel.',
      targetUser: 'Professionals in media, communications, product, UX-adjacent business roles.',
    },
    typography: { headingFont: 'geometric-sans', bodyFont: 'sans-serif', nameSize: 20, headingSize: 11, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'two-column-left', sidebarWidthPercent: 38, marginCm: 1.8, gutterCm: 0.8 },
    colors: { text: '#000000', accent: '#2D7D9A', sidebarBg: '#FFFFFF', headerBandBg: '#2D7D9A' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 12, sectionAfterPt: 4 },
    header: { style: 'full-width', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'bold-color',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'none',
      sectionOrder: ['experience', 'projects'],
      sidebarSections: ['skills', 'education', 'certifications'],
    },
  },

  // 7. Professional Plus — highlights strip beneath header
  {
    metadata: {
      id: 'professional-plus',
      name: 'Professional Plus',
      category: 'modern-professional',
      description: 'Single-column layout with a compact highlights strip beneath the header — quick elevator-pitch callouts.',
      targetUser: 'Mid-to-senior professionals wanting a quick highlights summary up top.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 19, headingSize: 11.5, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0 },
    colors: { text: '#000000', accent: '#2D6A8E' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 13, sectionAfterPt: 5 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'uppercase-rule',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'thin-rule',
      sectionOrder: ['experience', 'skills', 'education', 'certifications', 'projects'],
    },
  },

  // 8. Modern Executive — dark header band + right-side sidebar
  {
    metadata: {
      id: 'modern-executive',
      name: 'Modern Executive',
      category: 'modern-professional',
      description: 'Refined two-column with dark header band and right-side sidebar — modern senior leadership look.',
      targetUser: 'Directors, VPs, senior managers moving into modern/tech-adjacent company culture.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 20, headingSize: 12, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'two-column-right', sidebarWidthPercent: 30, marginCm: 1.8, gutterCm: 0.8 },
    colors: { text: '#000000', accent: '#8B7D3C', headingColor: '#1C2431', sidebarBg: '#F2F3F5', headerBandBg: '#1C2431', muted: '#666666' },
    spacing: { lineHeight: 1.25, sidebarLineHeight: 1.2, sectionBeforePt: 14, sectionAfterPt: 4 },
    header: { style: 'full-width', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'tinted-sidebar' },
    sections: {
      headingStyle: 'bold-color',
      entryLayout: 'title-dates-same-line',
      bulletStyle: 'round',
      divider: 'none',
      sectionOrder: ['experience'],
      sidebarSections: ['skills', 'education', 'certifications'],
    },
  },

  // 9. Modern Corporate — full-width light-tint heading bands replacing rules
  {
    metadata: {
      id: 'modern-corporate',
      name: 'Modern Corporate',
      category: 'modern-professional',
      description: 'Structured like ATS Corporate but modernized with full-width light-tint heading bands instead of plain rules.',
      targetUser: 'Professionals at large modern companies wanting structure with a contemporary finish.',
    },
    typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', nameSize: 18, headingSize: 11, bodySize: 10.5, nameWeight: 'bold', headingWeight: 'bold' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.0 },
    colors: { text: '#000000', accent: '#3D6B8E', headingColor: '#2C4A63', sidebarBg: '#E7ECF3' },
    spacing: { lineHeight: 1.2, sectionBeforePt: 10, sectionAfterPt: 8 },
    header: { style: 'left-aligned', contactSeparator: ' | ', showTitle: true },
    accent: { type: 'color-text' },
    sections: {
      headingStyle: 'bold-color',
      entryLayout: 'title-company-dates',
      bulletStyle: 'round',
      divider: 'none',
      sectionOrder: ['skills', 'experience', 'education', 'certifications', 'projects'],
    },
  },

  // 10. Premium Minimal — double-rule under serif name, grey-scale palette
  {
    metadata: {
      id: 'premium-minimal',
      name: 'Premium Minimal',
      category: 'modern-professional',
      description: 'The quiet luxury option — oversized serif name with signature double-rule, fully grey-scale palette.',
      targetUser: 'Senior creative-adjacent professionals, consultants, design-literate industries.',
    },
    typography: { headingFont: 'serif', bodyFont: 'sans-serif', nameSize: 23, headingSize: 10, bodySize: 10.5, smallSize: 9, nameWeight: 'regular', headingWeight: 'regular' },
    layout: { type: 'single', sidebarWidthPercent: 0, marginCm: 2.6 },
    colors: { text: '#1A1A1A', accent: '#1A1A1A', muted: '#6B6B6B' },
    spacing: { lineHeight: 1.35, sectionBeforePt: 20, sectionAfterPt: 8 },
    header: { style: 'left-aligned', contactSeparator: ' · ', showTitle: true },
    accent: { type: 'underline' },
    sections: {
      headingStyle: 'small-caps',
      entryLayout: 'stacked',
      bulletStyle: 'dash',
      divider: 'none',
      sectionOrder: ['experience', 'education', 'skills', 'certifications'],
    },
  },
];
