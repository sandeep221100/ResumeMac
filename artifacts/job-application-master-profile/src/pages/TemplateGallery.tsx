import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import {
  allTemplates,
  templatesByCategory,
  type TemplateCategory,
  type TemplateConfig,
  type TemplateId,
} from '../resumeTemplates';

const CATEGORY_TABS: { key: TemplateCategory; label: string }[] = [
  { key: 'ats-safe', label: 'ATS Safe' },
  { key: 'modern-professional', label: 'Modern Professional' },
  { key: 'industry', label: 'Industry' },
  { key: 'career-stage', label: 'Career Stage' },
];

const CATEGORY_DESCRIPTIONS: Record<TemplateCategory, string> = {
  'ats-safe': 'Maximum ATS compatibility — single-column, no graphics, standard formatting.',
  'modern-professional': 'Designed, premium feel — two-column layouts, accent colors, editorial touches.',
  'industry': 'Field-specific — section ordering and structure tuned to how recruiters in your industry scan.',
  'career-stage': 'Experience-level aware — information hierarchy matched to where you are in your career.',
};

function categoryCount(category: TemplateCategory): number {
  return templatesByCategory(category).length;
}

// Realistic sample resume data for preview thumbnails
const SAMPLE = {
  name: 'Alex Johnson',
  title: 'Senior Software Engineer',
  contact: 'alex@email.com · (555) 123-4567 · San Francisco, CA',
  sections: [
    { heading: 'EXPERIENCE', lines: ['Led a team of 6 engineers at FinTech Corp, delivering…', 'Built microservices handling 2M+ daily requests…', 'Mentored 3 junior developers through promotion cycles…'] },
    { heading: 'EDUCATION', lines: ['B.S. Computer Science — Stanford University, 2018'] },
    { heading: 'SKILLS', lines: ['TypeScript · React · Node.js · PostgreSQL · AWS · Docker'] },
  ],
};

function TemplateCard({
  config,
  selected,
  recommended,
  onSelect,
}: {
  config: TemplateConfig;
  selected: boolean;
  recommended: boolean;
  onSelect: (id: TemplateId) => void;
}) {
  const layoutLabel = config.layout.type === 'single'
    ? 'Single Column'
    : config.layout.type === 'two-column-left'
      ? 'Left Sidebar'
      : 'Right Sidebar';

  const fontLabel = config.typography.headingFont === 'serif'
    ? 'Serif'
    : config.typography.headingFont === 'monospace'
      ? 'Mono'
      : config.typography.headingFont === 'geometric-sans'
        ? 'Geometric'
        : 'Sans';

  const isTwoCol = config.layout.type === 'two-column-left' || config.layout.type === 'two-column-right';
  const accent = config.colors.accent;
  const text = config.colors.text;
  const muted = config.colors.muted ?? '#666';
  const heading = config.colors.headingColor ?? accent;
  const sidebarBg = config.colors.sidebarBg ?? '#f4f4f4';
  const fontFamily = config.typography.headingFont === 'serif'
    ? "'Georgia', serif"
    : config.typography.headingFont === 'monospace'
      ? "'Courier New', monospace"
      : config.typography.headingFont === 'geometric-sans'
        ? "'Calibri', sans-serif"
        : "'Arial', sans-serif";

  return (
    <button
      type="button"
      className={`template-card${selected ? ' template-card-selected' : ''}${recommended ? ' template-card-recommended' : ''}`}
      onClick={() => onSelect(config.metadata.id)}
      data-testid={`template-card-${config.metadata.id}`}
    >
      {/* Realistic mini resume preview */}
      <div className="template-card-preview" style={{ fontFamily, fontSize: '6.5px', lineHeight: '1.35', color: text }}>
        {isTwoCol ? (
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ width: '35%', background: sidebarBg, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontWeight: 700, fontSize: '8px', color: accent, marginBottom: '2px' }}>{SAMPLE.name}</div>
              <div style={{ fontSize: '5.5px', color: muted }}>{SAMPLE.title}</div>
              <div style={{ borderTop: `1px solid ${muted}40`, marginTop: '3px', paddingTop: '3px' }}>
                <div style={{ fontWeight: 600, fontSize: '5.5px', color: heading, marginBottom: '1px' }}>CONTACT</div>
                <div style={{ fontSize: '5px', color: muted }}>alex@email.com</div>
                <div style={{ fontSize: '5px', color: muted }}>(555) 123-4567</div>
                <div style={{ fontSize: '5px', color: muted }}>San Francisco, CA</div>
              </div>
              <div style={{ marginTop: '3px' }}>
                <div style={{ fontWeight: 600, fontSize: '5.5px', color: heading, marginBottom: '1px' }}>SKILLS</div>
                <div style={{ fontSize: '5px', color: text }}>TypeScript · React</div>
                <div style={{ fontSize: '5px', color: text }}>Node.js · PostgreSQL</div>
                <div style={{ fontSize: '5px', color: text }}>AWS · Docker</div>
              </div>
            </div>
            <div style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {config.accent.type === 'vertical-bar' && <div style={{ width: '3px', height: '100%', background: accent, position: 'absolute', left: '35%', top: 0 }} />}
              {SAMPLE.sections.slice(0, 2).map((s) => (
                <div key={s.heading}>
                  <div style={{ fontWeight: 600, fontSize: '5.5px', color: heading, borderBottom: `0.5px solid ${heading}40`, paddingBottom: '1px', marginBottom: '2px' }}>{s.heading}</div>
                  {s.lines.map((line, i) => (
                    <div key={i} style={{ fontSize: '5px', color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{line}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {config.accent.type === 'vertical-bar' && <div style={{ width: '3px', background: accent, position: 'absolute', left: 0, top: 0, height: '100%' }} />}
            <div style={{ fontWeight: 700, fontSize: '9px', color: config.accent.type === 'color-text' || config.accent.type === 'underline' ? accent : text }}>{SAMPLE.name}</div>
            <div style={{ fontSize: '6px', color: accent, fontWeight: 500 }}>{SAMPLE.title}</div>
            <div style={{ fontSize: '5px', color: muted }}>{SAMPLE.contact}</div>
            {config.accent.type === 'underline' && <div style={{ height: '1.5px', background: accent, marginTop: '1px' }} />}
            {config.accent.type !== 'underline' && <div style={{ height: '0.5px', background: `${muted}50`, marginTop: '1px' }} />}
            {SAMPLE.sections.map((s) => (
              <div key={s.heading}>
                <div style={{ fontWeight: 600, fontSize: '5.5px', color: heading, textTransform: 'uppercase' as const, borderBottom: `0.5px solid ${heading}30`, paddingBottom: '0.5px', marginBottom: '1.5px' }}>{s.heading}</div>
                {s.lines.slice(0, 2).map((line, i) => (
                  <div key={i} style={{ fontSize: '5px', color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>• {line}</div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="template-card-body">
        <div className="template-card-header">
          <h3 className="template-card-name">{config.metadata.name}</h3>
          {selected && <span className="template-card-check"><Check size={14} /></span>}
        </div>
        <div className="template-card-badges">
          <span className="template-badge template-badge-category">{config.metadata.category}</span>
          <span className="template-badge template-badge-layout">{layoutLabel}</span>
          <span className="template-badge template-badge-font">{fontLabel}</span>
        </div>
        <p className="template-card-desc">{config.metadata.description}</p>
        {recommended && <span className="template-card-recommended-badge">Recommended</span>}
      </div>
    </button>
  );
}

export default function TemplateGallery({
  selectedRole,
  selectedTemplate,
  browseMode,
  onSelect,
  onBack,
}: {
  selectedRole: string | null;
  selectedTemplate?: TemplateId | string;
  browseMode?: boolean;
  onSelect: (templateId: TemplateId) => void;
  onBack: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('ats-safe');
  const [selection, setSelection] = useState<TemplateId | string>(selectedTemplate ?? 'ats-classic');

  const all = useMemo(() => allTemplates(), []);
  const filtered = useMemo(() => templatesByCategory(activeCategory), [activeCategory]);

  // Simple recommendation logic: match role keywords to template category/targetUser
  const recommendedIds = useMemo((): Set<TemplateId> => {
    if (!selectedRole) return new Set();
    const role = selectedRole.toLowerCase();
    const ids = new Set<TemplateId>();

    if (/student|undergrad|university/.test(role)) ids.add('student');
    if (/intern|internship/.test(role)) ids.add('intern');
    if (/fresher|graduate|entry/.test(role)) { ids.add('fresher'); ids.add('entry-level'); }
    if (/engineer|developer|software|frontend|backend|fullstack/.test(role)) ids.add('tech-software');
    if (/data|machine learning|ml|ai|analyst/.test(role)) ids.add('data-ai');
    if (/consult|strategy|business analyst/.test(role)) ids.add('business-consulting');
    if (/financ|account|audit|bank/.test(role)) ids.add('finance-accounting');
    if (/market|sales|growth|revenue/.test(role)) ids.add('marketing-sales');
    if (/product|project|program|pm /.test(role)) ids.add('product-project');
    if (/nurse|health|clinical|medical/.test(role)) ids.add('healthcare');
    if (/design|ux|ui|creative|brand/.test(role)) ids.add('design-creative');
    if (/research|phd|academic|professor/.test(role)) { ids.add('academic-research'); ids.add('ats-academic'); }
    if (/mechanical|civil|electrical|structural/.test(role)) ids.add('engineering');
    if (/executive|director|vp|c-suite|chief/.test(role)) { ids.add('executive'); ids.add('ats-executive'); ids.add('modern-executive'); }
    if (/freelanc|independent|contract/.test(role)) { ids.add('freelancer'); ids.add('contractor'); }

    // Always recommend a couple of ATS-safe templates as fallback
    if (ids.size === 0) {
      ids.add('ats-professional');
      ids.add('modern-pro');
    }
    return ids;
  }, [selectedRole]);

  const handleSelect = (id: TemplateId) => {
    setSelection(id);
  };

  const handleContinue = () => {
    onSelect(selection as TemplateId);
  };

  return (
    <div className="template-gallery" data-testid="template-gallery">
      <header className="template-gallery-header">
        <button type="button" className="button button-secondary" onClick={onBack} data-testid="button-gallery-back">
          <ArrowLeft size={15} /> BACK
        </button>
        <div>
          <div className="eyebrow">{browseMode ? 'Browse Templates' : 'Step 2 of 5'}</div>
          <h1 className="template-gallery-title">{browseMode ? 'Browse our templates' : 'Choose your template'}</h1>
          <p className="template-gallery-subtitle">
            {browseMode
              ? '40 professionally designed templates across 4 categories. Pick one to start building.'
              : '40 professionally designed templates across 4 categories. You can change this later in the builder.'}
          </p>
        </div>
      </header>

      {/* Category tabs */}
      <nav className="template-gallery-tabs" role="tablist" aria-label="Template categories">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeCategory === tab.key}
            className={`template-tab${activeCategory === tab.key ? ' template-tab-active' : ''}`}
            onClick={() => setActiveCategory(tab.key)}
            data-testid={`template-tab-${tab.key}`}
          >
            <span className="template-tab-label">{tab.label}</span>
            <span className="template-tab-count">{categoryCount(tab.key)}</span>
          </button>
        ))}
      </nav>

      <p className="template-gallery-category-desc">{CATEGORY_DESCRIPTIONS[activeCategory]}</p>

      {/* Template grid */}
      <div className="template-gallery-grid">
        {filtered.map((config) => (
          <TemplateCard
            key={config.metadata.id}
            config={config}
            selected={selection === config.metadata.id}
            recommended={recommendedIds.has(config.metadata.id)}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Footer action */}
      <div className="template-gallery-footer">
        <p className="template-gallery-selection-info">
          Selected: <strong>{all.find((c) => c.metadata.id === selection)?.metadata.name ?? selection}</strong>
        </p>
        <button
          type="button"
          className="button button-primary"
          onClick={handleContinue}
          data-testid="button-gallery-continue"
        >
          {browseMode ? 'START BUILDING WITH THIS TEMPLATE' : 'CONTINUE'} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
