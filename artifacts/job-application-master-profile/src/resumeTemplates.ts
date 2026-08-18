import type { ResumeSectionKey } from './resumeDocument';

// ---------------------------------------------------------------------------
// Template ID — union of all 40 template identifiers
// ---------------------------------------------------------------------------
export type TemplateId =
  // Batch 1: ATS Safe
  | 'ats-classic' | 'ats-professional' | 'ats-minimal' | 'ats-clean' | 'ats-compact'
  | 'ats-executive' | 'ats-corporate' | 'ats-technical' | 'ats-academic' | 'ats-simple'
  // Batch 2: Modern Professional
  | 'modern-edge' | 'modern-pro' | 'minimal-pro' | 'clean-bold' | 'elegant'
  | 'contemporary' | 'professional-plus' | 'modern-executive' | 'modern-corporate' | 'premium-minimal'
  // Batch 3: Industry
  | 'tech-software' | 'data-ai' | 'business-consulting' | 'finance-accounting' | 'marketing-sales'
  | 'product-project' | 'healthcare' | 'design-creative' | 'academic-research' | 'engineering'
  // Batch 4: Career Stage
  | 'student' | 'intern' | 'fresher' | 'entry-level' | 'experienced-professional'
  | 'executive' | 'career-switch' | 'career-return' | 'freelancer' | 'contractor';

// ---------------------------------------------------------------------------
// Supporting enums / union types
// ---------------------------------------------------------------------------
export type TemplateCategory = 'ats-safe' | 'modern-professional' | 'industry' | 'career-stage';

export type TemplateLayout = 'single' | 'two-column-left' | 'two-column-right';

export type HeaderStyle = 'centered' | 'left-aligned' | 'full-width';

export type AccentType = 'none' | 'vertical-bar' | 'underline' | 'color-text' | 'tinted-sidebar';

export type SectionHeadingStyle = 'uppercase-rule' | 'uppercase' | 'bold' | 'bold-color' | 'small-caps';

export type EntryLayout = 'title-dates-same-line' | 'stacked' | 'title-company-dates';

export type BulletStyle = 'round' | 'dash' | 'square' | 'none';

export type DividerType = 'none' | 'thin-rule' | 'double-rule' | 'partial-underline' | 'rule-above';

export type FontFamily = 'serif' | 'sans-serif' | 'geometric-sans' | 'monospace';

// ---------------------------------------------------------------------------
// Sub-config interfaces
// ---------------------------------------------------------------------------

export interface TypographyConfig {
  headingFont: FontFamily;
  bodyFont: FontFamily;
  /** Optional monospace accent font for tech-oriented templates. */
  accentFont?: FontFamily;
  nameSize: number;
  headingSize: number;
  bodySize: number;
  /** Smaller text size used for dates, contact info, etc. */
  smallSize?: number;
  nameWeight: 'light' | 'regular' | 'medium' | 'bold' | 'black';
  headingWeight: 'regular' | 'bold';
}

export interface LayoutConfig {
  type: TemplateLayout;
  /** Sidebar width as a percentage (0 for single-column). */
  sidebarWidthPercent: number;
  /** Margin in cm applied to all sides (outer margins). */
  marginCm: number;
  /** Left margin override in cm (for templates with accent bars). */
  marginLeftCm?: number;
  /** Column gutter in cm (two-column only). */
  gutterCm?: number;
}

export interface ColorConfig {
  /** Primary text color (hex). */
  text: string;
  /** Accent color (hex). */
  accent: string;
  /** Heading color — defaults to accent if not set. */
  headingColor?: string;
  /** Sidebar background tint (hex). */
  sidebarBg?: string;
  /** Header band background color (hex). */
  headerBandBg?: string;
  /** Secondary muted color for dates, subtitles. */
  muted?: string;
}

export interface SpacingConfig {
  lineHeight: number;
  /** Sidebar line height override (two-column only). */
  sidebarLineHeight?: number;
  sectionBeforePt: number;
  sectionAfterPt: number;
}

export interface HeaderConfig {
  style: HeaderStyle;
  /** Contact info separator string. */
  contactSeparator: string;
  /** Whether to show target title/role beneath the name. */
  showTitle: boolean;
}

export interface AccentConfig {
  type: AccentType;
  /** Accent element color — defaults to colors.accent if not set. */
  color?: string;
  /** Bar width in cm (vertical-bar only). */
  barWidthCm?: number;
}

export interface SectionConfig {
  headingStyle: SectionHeadingStyle;
  entryLayout: EntryLayout;
  bulletStyle: BulletStyle;
  divider: DividerType;
  /** Custom section order — if undefined, the default order from resumeDocument is used. */
  sectionOrder?: ResumeSectionKey[];
  /** Section keys rendered in the sidebar (two-column templates). */
  sidebarSections?: ResumeSectionKey[];
}

// ---------------------------------------------------------------------------
// Template metadata
// ---------------------------------------------------------------------------

export interface TemplateMetadata {
  id: TemplateId;
  name: string;
  category: TemplateCategory;
  description: string;
  targetUser: string;
}

// ---------------------------------------------------------------------------
// Full template config
// ---------------------------------------------------------------------------

export interface TemplateConfig {
  metadata: TemplateMetadata;
  typography: TypographyConfig;
  layout: LayoutConfig;
  colors: ColorConfig;
  spacing: SpacingConfig;
  header: HeaderConfig;
  accent: AccentConfig;
  sections: SectionConfig;
}

// ---------------------------------------------------------------------------
// Registry — populated by src/templates/index.ts
// ---------------------------------------------------------------------------

const templateRegistry = new Map<TemplateId, TemplateConfig>();

export function registerTemplate(config: TemplateConfig): void {
  templateRegistry.set(config.metadata.id, config);
}

export function getTemplateConfig(id: TemplateId): TemplateConfig {
  const config = templateRegistry.get(id);
  if (!config) {
    // Fallback to ats-classic for unknown IDs (backward compat with 'ats' | 'modern').
    return templateRegistry.get('ats-classic')!;
  }
  return config;
}

export function templatesByCategory(category: TemplateCategory): TemplateConfig[] {
  return Array.from(templateRegistry.values()).filter((c) => c.metadata.category === category);
}

export function allTemplates(): TemplateConfig[] {
  return Array.from(templateRegistry.values());
}

// ---------------------------------------------------------------------------
// jsPDF font mapping — maps our FontFamily to jsPDF's built-in fonts
// ---------------------------------------------------------------------------

export function jsPdfFont(family: FontFamily, weight: 'normal' | 'bold' | 'italic' = 'normal'): string {
  // jsPDF has: helvetica, times, courier (built-in).
  const base = family === 'serif' ? 'times' : family === 'monospace' ? 'courier' : 'helvetica';
  if (weight === 'bold') return base;
  if (weight === 'italic') return base;
  return base;
}

// ---------------------------------------------------------------------------
// Legacy template ID mapping (backward compat with 'ats' | 'modern')
// ---------------------------------------------------------------------------

export function resolveTemplateId(template: string): TemplateId {
  if (template === 'ats') return 'ats-classic';
  if (template === 'modern') return 'modern-pro';
  if (templateRegistry.has(template as TemplateId)) return template as TemplateId;
  return 'ats-classic';
}
