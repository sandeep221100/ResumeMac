import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Download, FileText, List, Sparkles } from 'lucide-react';
import {
  defaultResumeSettings,
  resumeSections,
  resumeSectionOptions,
  mapMasterProfileToResumeDocument,
  type ResumeDocument,
  type ResumeEntry,
  type ResumeExperience,
  type ResumeEducation,
  type ResumeSettings,
} from './resumeDocument';
import { downloadResumeDocx, downloadResumePdf } from './resumeMapper';
import { getTemplateConfig, resolveTemplateId, type TemplateId } from './resumeTemplates';
import type { MasterProfile } from './masterProfile';
import { analyzeResumeRelevance, extractJobDescriptionTerms } from './resumeOptimizer';
import TemplateGallery from './pages/TemplateGallery';

const SETTINGS_KEY = 'job-application-resume-settings-v1';

function loadSettings(profile: MasterProfile): ResumeSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const defaults = defaultResumeSettings(profile);
      const parsed = JSON.parse(stored) as Partial<ResumeSettings>;
      const selectedSections = Array.isArray(parsed.selectedSections)
        ? parsed.selectedSections.filter((key): key is ResumeSettings['selectedSections'][number] => resumeSectionOptions.some((option) => option.key === key))
        : defaults.selectedSections;
      return { ...defaults, ...parsed, selectedSections } as ResumeSettings;
    }
  } catch {
    // A corrupt settings value should never prevent the profile from opening.
  }
  return defaultResumeSettings(profile);
}

function entryTitle(entry: ResumeEntry | ResumeExperience | ResumeEducation): string {
  return 'employer' in entry ? entry.employer || entry.title : 'institution' in entry ? entry.institution || entry.qualification : entry.title;
}

function entrySubtitle(entry: ResumeEntry | ResumeExperience | ResumeEducation): string {
  if ('employer' in entry) return entry.title;
  if ('institution' in entry) return entry.qualification;
  return entry.subtitle ?? '';
}

function entryDates(entry: ResumeEntry | ResumeExperience | ResumeEducation): string {
  return entry.dates ?? '';
}

type ResumeBlock = {
  id: string;
  type: 'header' | 'summary' | 'entry';
  section?: { title: string; entry: ResumeEntry | ResumeExperience | ResumeEducation; showHeading: boolean };
};

function buildResumeBlocks(doc: ResumeDocument, mode: 'resume' | 'cv', settings: ResumeSettings): ResumeBlock[] {
  const blocks: ResumeBlock[] = [{ id: 'header', type: 'header' }];
  if (doc.summary) blocks.push({ id: 'summary', type: 'summary' });
  resumeSections(doc, mode, settings.length).forEach((section) => {
    section.entries.forEach((entry, index) => {
      blocks.push({
        id: `${section.title}-${index}`,
        type: 'entry',
        section: { title: section.title, entry, showHeading: index === 0 },
      });
    });
  });
  return blocks;
}

function ResumeBlockView({ block, doc }: { block: ResumeBlock; doc: ResumeDocument }) {
  if (block.type === 'header') {
    return <header className="resume-document-header">
      <h1 data-testid="text-resume-name">{doc.header.name || 'Your name will appear as your profile develops.'}</h1>
      {doc.header.targetTitle ? <p className="resume-target">{doc.header.targetTitle}</p> : null}
      {doc.header.contact.length || doc.header.links.length ? <p className="resume-contact">{[...doc.header.contact, ...doc.header.links].join('  |  ')}</p> : null}
    </header>;
  }
  if (block.type === 'summary') {
    return <section className="resume-section resume-summary">
      <h2>Professional Summary</h2>
      <p>{doc.summary}</p>
    </section>;
  }
  const section = block.section!;
  const entry = section.entry;
  return <section className={section.showHeading ? 'resume-section resume-section-start' : 'resume-section-entry'}>
    {section.showHeading ? <h2>{section.title}</h2> : null}
    <div className="resume-entry">
      <div className="resume-entry-heading">
        <strong>{entryTitle(entry)}</strong>
        {entryDates(entry) ? <span>{entryDates(entry)}</span> : null}
      </div>
      {entrySubtitle(entry) ? <div className="resume-entry-subtitle">{entrySubtitle(entry)}</div> : null}
      {'location' in entry && entry.location ? <div className="resume-entry-location">{entry.location}</div> : null}
      {'url' in entry && entry.url ? <div className="resume-entry-url">{entry.url}</div> : null}
      {entry.details?.map((detail, index) => <p className="resume-detail" key={`${detail}-${index}`}>{detail}</p>)}
    </div>
  </section>;
}

function ResumePaper({ doc, mode, settings, page, blocks, measureRef }: {
  doc: ResumeDocument;
  mode: 'resume' | 'cv';
  settings: ResumeSettings;
  page: number;
  blocks: ResumeBlock[];
  measureRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const resolvedId = resolveTemplateId(settings.template as string);
  const cfg = getTemplateConfig(resolvedId);
  const fontFamily = cfg.typography.bodyFont === 'serif' ? "'Georgia', 'Times New Roman', serif"
    : cfg.typography.bodyFont === 'monospace' ? "'Courier New', Consolas, monospace"
    : cfg.typography.headingFont === 'geometric-sans' ? "'Montserrat', 'Poppins', 'Calibri', sans-serif"
    : "'Calibri', 'Arial', 'Helvetica', sans-serif";
  const paperStyle: Record<string, string> = {
    '--template-font': fontFamily,
    '--template-accent': cfg.colors.accent,
    '--template-heading-color': cfg.colors.headingColor ?? cfg.colors.accent,
    '--template-text': cfg.colors.text,
    '--template-muted': cfg.colors.muted ?? '#666666',
    '--template-line-height': String(cfg.spacing.lineHeight),
    '--template-heading-font': cfg.typography.headingFont === 'serif' ? "'Georgia', 'Times New Roman', serif" : fontFamily,
  };
  return (
    <article className={`resume-paper template-${resolvedId}`} style={paperStyle} data-testid={`resume-paper-${page + 1}`}>
      <div className="resume-page-content" ref={measureRef}>
        {blocks.map((block) => <div className="resume-block" data-resume-block={block.id} key={block.id}><ResumeBlockView block={block} doc={doc} /></div>)}
        {!doc.header.name && page === 0 ? <div className="resume-empty-note">Complete relevant profile questions to shape this preview. Empty sections stay hidden.</div> : null}
      </div>
      <footer className="resume-paper-footer">{mode === 'cv' ? 'Professional CV' : 'Professional Resume'} · {page + 1}</footer>
    </article>
  );
}

export default function ResumeBuilder({
  profile,
  onBack,
  onOpenAllPages,
  onDownloadCsv,
  onGateDownload,
}: {
  profile: MasterProfile;
  onBack: () => void;
  onOpenAllPages: () => void;
  onDownloadCsv: () => void;
  onGateDownload?: (type: 'pdf' | 'word' | 'csv', action: () => void) => void;
}) {
  const [mode, setMode] = useState<'resume' | 'cv'>('resume');
  const [settings, setSettings] = useState<ResumeSettings>(() => loadSettings(profile));
  const [page, setPage] = useState(0);
  const [tailorMessage, setTailorMessage] = useState('');
  const [showGallery, setShowGallery] = useState(false);
  const measureRef = useRef<HTMLDivElement>(null);
  const doc = useMemo(() => mapMasterProfileToResumeDocument(profile, settings), [profile, settings]);
  const blocks = useMemo(() => buildResumeBlocks(doc, mode, settings), [doc, mode, settings]);
  const [pages, setPages] = useState<ResumeBlock[][]>(() => [blocks]);
  const relevance = useMemo(
    () => analyzeResumeRelevance(doc, settings.targetTitle, settings.jobDescription),
    [doc, settings.targetTitle, settings.jobDescription],
  );
  const pageCount = pages.length;

  useLayoutEffect(() => {
    const measure = () => {
      const content = measureRef.current;
      if (!content) return;
      const capacity = content.clientHeight;
      const heights = new Map(
        Array.from(content.querySelectorAll<HTMLElement>('[data-resume-block]')).map((element) => [
          element.dataset.resumeBlock ?? '',
          element.offsetHeight,
        ]),
      );
      if (!capacity || heights.size !== blocks.length) return;

      const nextPages: ResumeBlock[][] = [];
      let current: ResumeBlock[] = [];
      let used = 0;
      for (const block of blocks) {
        const height = heights.get(block.id) ?? 0;
        if (current.length && used + height > capacity) {
          nextPages.push(current);
          current = [];
          used = 0;
        }
        current.push(block);
        used += height;
      }
      if (current.length) nextPages.push(current);
      setPages((previous) => {
        const currentIds = previous.map((items) => items.map((item) => item.id).join('|')).join('/');
        const nextIds = nextPages.map((items) => items.map((item) => item.id).join('|')).join('/');
        return currentIds === nextIds ? previous : nextPages;
      });
    };
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    if (measureRef.current) observer.observe(measureRef.current);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [blocks, settings.template]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1));
  }, [pageCount]);

  const updateSetting = <K extends keyof ResumeSettings>(key: K, value: ResumeSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const toggleSection = (key: ResumeSettings['selectedSections'][number]) => {
    setSettings((current) => {
      const selected = new Set(current.selectedSections);
      if (selected.has(key)) {
        if (selected.size === 1) return current;
        selected.delete(key);
      } else {
        selected.add(key);
      }
      return { ...current, selectedSections: resumeSectionOptions.map((option) => option.key).filter((item) => selected.has(item)) };
    });
  };

  // Template gallery modal
  if (showGallery) {
    return (
      <div className="template-gallery-modal" data-testid="template-gallery-modal">
        <TemplateGallery
          selectedRole={profile.professionalIdentity.targetRole || null}
          selectedTemplate={resolveTemplateId(settings.template as string)}
          onSelect={(id: TemplateId) => {
            updateSetting('template', id);
            setShowGallery(false);
          }}
          onBack={() => setShowGallery(false)}
        />
      </div>
    );
  }

  return (
    <div className="resume-builder" data-testid="resume-builder">
      <div className="resume-toolbar">
        <div>
          <div className="eyebrow">Live document studio</div>
          <h1 className="resume-builder-title">Resume &amp; CV builder</h1>
          <p className="resume-builder-subtitle">Mapped directly from your saved master profile. No duplicate entry, no invented details.</p>
        </div>
        <div className="resume-toolbar-actions">
          <button type="button" className="button button-secondary" onClick={onBack} data-testid="button-back-to-questionnaire"><ArrowLeft size={15} /> BACK TO QUESTIONNAIRE</button>
          <button type="button" className="button button-secondary" onClick={onOpenAllPages} data-testid="button-all-pages-resume"><List size={15} /> ALL PAGES</button>
        </div>
      </div>

      <div className="resume-layout">
        <aside className="resume-settings" aria-label="Resume settings">
          <div className="settings-heading"><BriefcaseBusiness size={17} /><span>Resume settings</span></div>
          <label className="settings-field">Target job title
            <input data-testid="input-target-job-title" value={settings.targetTitle} onChange={(event) => updateSetting('targetTitle', event.target.value)} placeholder="From your profile" />
          </label>
          <label className="settings-field">Professional summary
            <textarea data-testid="input-resume-summary" value={settings.summary} onChange={(event) => updateSetting('summary', event.target.value)} rows={5} placeholder="Use the summary from your profile, or refine it here." />
          </label>
          <label className="settings-field">Document length
            <select data-testid="select-resume-length" value={settings.length} onChange={(event) => updateSetting('length', event.target.value as ResumeSettings['length'])}>
              <option value="1">1 page</option><option value="2">2 pages</option><option value="full">Full</option>
            </select>
          </label>
          <div className="settings-field">
            <span>Template <span className="field-hint">{getTemplateConfig(resolveTemplateId(settings.template as string)).metadata.name}</span></span>
            <button type="button" className="button button-secondary" onClick={() => setShowGallery(true)} data-testid="button-change-template">
              CHANGE TEMPLATE
            </button>
          </div>
          <label className="settings-field">Date format
            <select data-testid="select-date-format" value={settings.dateFormat} onChange={(event) => updateSetting('dateFormat', event.target.value as ResumeSettings['dateFormat'])}>
              <option value="month-year">Month · Year</option><option value="numeric">MM/YYYY</option><option value="year">Year only</option>
            </select>
          </label>
          <div className="settings-divider" />
           <label className="settings-field">Target job description <span className="field-hint">Optional · used to select matching evidence</span>
            <textarea data-testid="input-target-job-description" value={settings.jobDescription} onChange={(event) => updateSetting('jobDescription', event.target.value)} rows={5} placeholder="Paste the role description here." />
          </label>
           <div className="settings-field">
             <span>Include sections <span className="field-hint">Choose the evidence to carry into this document</span></span>
             <div className="settings-section-list">
               {resumeSectionOptions.map((option) => (
                 <label className="settings-section-option" key={option.key}>
                   <input
                     type="checkbox"
                     data-testid={`checkbox-resume-section-${option.key}`}
                     checked={settings.selectedSections.includes(option.key)}
                     onChange={() => toggleSection(option.key)}
                   />
                   <span>{option.label}</span>
                 </label>
               ))}
             </div>
           </div>
           <button type="button" className="button button-secondary settings-tailor" data-testid="button-tailor-resume" onClick={() => {
             const descriptionTerms = extractJobDescriptionTerms(settings.jobDescription);
             const matchedEvidence = relevance.filter((item) => item.matchedTerms.length > 0).length;
             const role = settings.targetTitle.trim() || profile.professionalIdentity.targetRole || profile.professionalIdentity.alternativeRole || 'the target role';
             setTailorMessage(settings.jobDescription.trim()
               ? `Updated for ${role}: ${matchedEvidence} evidence items matched ${descriptionTerms.keywords.length} extracted terms.`
               : `Updated for ${role}: ${relevance.length} evidence items ranked by role relevance, recency, importance, evidence strength, and completeness.`);
           }}>
            <Sparkles size={15} /> TAILOR RESUME
          </button>
          {tailorMessage ? <p className="tailor-message" role="status">{tailorMessage}</p> : null}
        </aside>

        <section className="resume-preview-column" aria-label="Resume preview">
          <div className="preview-controls">
            <div className="document-toggle" role="tablist" aria-label="Document format">
              <button type="button" className={mode === 'resume' ? 'active' : ''} onClick={() => { setMode('resume'); setPage(0); }} data-testid="button-document-resume"><FileText size={15} /> RESUME</button>
              <button type="button" className={mode === 'cv' ? 'active' : ''} onClick={() => { setMode('cv'); setPage(0); }} data-testid="button-document-cv"><FileText size={15} /> CV</button>
            </div>
            <div className="export-actions">
              <button type="button" className="button button-secondary" aria-label="Download PDF" title="Download PDF" onClick={() => {
                const action = () => void downloadResumePdf(doc, mode, settings);
                onGateDownload ? onGateDownload('pdf', action) : action();
              }} data-testid="button-download-pdf"><Download size={14} aria-hidden="true" /> PDF</button>
              <button type="button" className="button button-secondary" aria-label="Download Word document" title="Download Word document" onClick={() => {
                const action = () => void downloadResumeDocx(doc, mode, settings);
                onGateDownload ? onGateDownload('word', action) : action();
              }} data-testid="button-download-word"><Download size={14} aria-hidden="true" /> WORD</button>
              <button type="button" className="button button-secondary" aria-label="Download CSV" title="Download CSV" onClick={onDownloadCsv} data-testid="button-download-resume-csv"><Download size={14} aria-hidden="true" /> CSV</button>
            </div>
          </div>
          <div className="resume-paper-stage">
            <ResumePaper doc={doc} mode={mode} settings={settings} page={page} blocks={pages[page] ?? []} />
            <div className="resume-measurement" aria-hidden="true">
              <ResumePaper doc={doc} mode={mode} settings={settings} page={0} blocks={blocks} measureRef={measureRef} />
            </div>
          </div>
          <div className="resume-page-navigation">
            <button type="button" className="button button-secondary" disabled={page === 0} onClick={() => setPage((current) => current - 1)} data-testid="button-previous-resume-page"><ArrowLeft size={15} /> PREVIOUS PAGE</button>
            <span data-testid="status-resume-page">PAGE {page + 1} OF {pageCount}</span>
            <button type="button" className="button button-secondary" disabled={page >= pageCount - 1} onClick={() => setPage((current) => current + 1)} data-testid="button-next-resume-page">NEXT PAGE <ArrowRight size={15} /></button>
          </div>
        </section>
      </div>
    </div>
  );
}
