import { AlignmentType, BorderStyle, Document, HeadingLevel, Packer, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
import jsPDF from 'jspdf';
import {
  defaultResumeSettings,
  mapMasterProfileToResumeDocument,
  resumeSections,
  resumeEntryDisplayValues,
  type ResumeDocument,
  type ResumeEducation,
  type ResumeEntry,
  type ResumeExperience,
  type ResumeSectionEntry,
  type ResumeSectionKey,
  type ResumeSection,
  type ResumeAdditionalSection,
  type ResumeHeader,
  type ResumeSettings,
  type ResumeTemplate,
  type ResumeLength,
  type DateFormat,
} from './resumeDocument';
import {
  getTemplateConfig,
  resolveTemplateId,
  jsPdfFont,
  type TemplateConfig,
  type FontFamily,
} from './resumeTemplates';
// Side-effect: registers all 40 templates into the global registry.
import './templates/index';
import type { MasterProfile } from './masterProfile';

// Compatibility facade: existing callers can keep importing from resumeMapper.
export type {
  ResumeDocument, ResumeEducation, ResumeEntry, ResumeExperience,
  ResumeSectionEntry, ResumeSectionKey, ResumeSection, ResumeAdditionalSection,
  ResumeHeader, ResumeSettings, ResumeTemplate, ResumeLength, DateFormat,
};
export { defaultResumeSettings, mapMasterProfileToResumeDocument, resumeSections, resumeEntryDisplayValues };

/** Backward-compatible name for the canonical MasterProfile -> ResumeDocument projection. */
export function mapResume(profile: MasterProfile, settings: ResumeSettings): ResumeDocument {
  return mapMasterProfileToResumeDocument(profile, settings);
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function entryTitleForExport(entry: ResumeSectionEntry): string {
  return 'employer' in entry ? entry.employer || entry.title : 'institution' in entry ? entry.institution || entry.qualification : entry.title;
}

function entrySubtitleForExport(entry: ResumeSectionEntry): string {
  if ('employer' in entry) return [entry.title, entry.location].filter(Boolean).join(' · ');
  if ('institution' in entry) return [entry.qualification, entry.location].filter(Boolean).join(' · ');
  return [entry.subtitle, entry.url].filter(Boolean).join(' · ');
}

function entryDatesForExport(entry: ResumeSectionEntry): string {
  return entry.dates ?? '';
}

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

function bulletChar(cfg: TemplateConfig): string {
  switch (cfg.sections.bulletStyle) {
    case 'dash': return '–';
    case 'square': return '▪';
    case 'none': return '';
    default: return '•';
  }
}

function getConfig(settings: ResumeSettings): TemplateConfig {
  return getTemplateConfig(resolveTemplateId(settings.template as string));
}

// ---------------------------------------------------------------------------
// PDF Rendering Engine — config-driven
// ---------------------------------------------------------------------------

export function downloadResumePdf(doc: ResumeDocument, mode: 'resume' | 'cv', settings: ResumeSettings): void {
  const cfg = getConfig(settings);
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const allSections = resumeSections(doc, mode, settings.length);

  const margin = cfg.layout.marginCm * 10;
  const mLeft = (cfg.layout.marginLeftCm ?? cfg.layout.marginCm) * 10;
  const contentWidth = 210 - mLeft - margin;
  const bottom = 283;
  const isTwoCol = cfg.layout.type !== 'single' && cfg.layout.sidebarWidthPercent > 0;
  const gutter = (cfg.layout.gutterCm ?? 0.8) * 10;
  const sideW = isTwoCol ? contentWidth * (cfg.layout.sidebarWidthPercent / 100) : 0;
  const mainW = isTwoCol ? contentWidth - sideW - gutter : contentWidth;
  const sideLeft = cfg.layout.type === 'two-column-right' ? mLeft + mainW + gutter : mLeft;
  const mainLeft = cfg.layout.type === 'two-column-right' ? mLeft : (isTwoCol ? mLeft + sideW + gutter : mLeft);

  let page = 1;
  let y = 16;

  const setFont = (family: FontFamily, weight: 'normal' | 'bold' | 'italic' = 'normal', size?: number) => {
    pdf.setFont(jsPdfFont(family, weight), weight === 'bold' ? 'bold' : weight === 'italic' ? 'italic' : 'normal');
    if (size) pdf.setFontSize(size);
  };
  const setColor = (hex: string) => { const [r, g, b] = hexToRgb(hex); pdf.setTextColor(r, g, b); };
  const setDrawColor = (hex: string) => { const [r, g, b] = hexToRgb(hex); pdf.setDrawColor(r, g, b); };
  const setFillColor = (hex: string) => { const [r, g, b] = hexToRgb(hex); pdf.setFillColor(r, g, b); };

  const addFooter = () => {
    setDrawColor('#d0d0d0');
    pdf.line(margin, 287, 210 - margin, 287);
    setFont(cfg.typography.bodyFont, 'normal', 7.5);
    setColor('#666666');
    pdf.text(`${mode === 'cv' ? 'Professional CV' : 'Professional Resume'} · ${page}`, 210 - margin, 291, { align: 'right' });
  };
  const nextPage = () => { addFooter(); pdf.addPage(); page += 1; y = 16; };
  const ensureSpace = (height: number) => { if (y + height > bottom && y > 16) nextPage(); };

  // Section heading
  const writeSectionTitle = (title: string, x: number, w: number) => {
    ensureSpace(10);
    const hs = cfg.sections.headingStyle;
    const hColor = cfg.colors.headingColor ?? cfg.colors.accent;

    if (cfg.sections.divider === 'rule-above') {
      setDrawColor(cfg.colors.muted ?? '#c8c8c8');
      pdf.setLineWidth(0.18);
      pdf.line(x, y, x + w, y);
      y += 3;
    }

    setColor(hs === 'bold-color' || hs === 'uppercase-rule' || hs === 'small-caps' ? hColor : cfg.colors.text);
    const weight: 'normal' | 'bold' = (hs === 'uppercase' && cfg.typography.headingWeight === 'regular') ? 'normal' : 'bold';
    setFont(cfg.typography.headingFont, weight, cfg.typography.headingSize);
    const displayTitle = (hs === 'uppercase-rule' || hs === 'uppercase' || hs === 'small-caps') ? title.toUpperCase() : title;
    const headingAlign = cfg.header.style === 'centered' && !isTwoCol ? 'center' : 'left';
    pdf.text(displayTitle, headingAlign === 'center' ? x + w / 2 : x, y, { align: headingAlign });
    y += 3;

    // Dividers below heading
    if (cfg.sections.divider === 'thin-rule') {
      setDrawColor(cfg.colors.muted ?? '#c8c8c8');
      pdf.setLineWidth(0.18);
      pdf.line(x, y, x + w, y);
      y += 3;
    } else if (cfg.sections.divider === 'double-rule') {
      setDrawColor(cfg.colors.muted ?? '#c8c8c8');
      pdf.setLineWidth(0.12);
      pdf.line(x, y - 1, x + w, y - 1);
      pdf.line(x, y + 1, x + w, y + 1);
      y += 4;
    } else if (cfg.sections.divider === 'partial-underline') {
      setDrawColor(cfg.colors.accent);
      pdf.setLineWidth(0.2);
      pdf.line(x, y, x + 25, y);
      y += 3;
    } else {
      y += 2;
    }
  };

  // Entry
  const entryHeight = (entry: ResumeSectionEntry) => {
    const details = 'details' in entry ? entry.details : [];
    return 8 + details.reduce((sum, d) => sum + pdf.splitTextToSize(d, (isTwoCol ? mainW : contentWidth) - 5).length * 3.8 + 1.2, 0);
  };

  const writeEntry = (entry: ResumeSectionEntry, x: number, w: number) => {
    ensureSpace(entryHeight(entry));
    const title = entryTitleForExport(entry);
    const dates = entryDatesForExport(entry);
    const subtitle = entrySubtitleForExport(entry);

    // Title + dates line
    setColor(cfg.colors.text);
    setFont(cfg.typography.bodyFont, 'bold', cfg.typography.bodySize);
    pdf.text(title, x, y);
    if (dates) {
      setFont(cfg.typography.bodyFont, 'normal', cfg.typography.smallSize ?? 8.5);
      setColor(cfg.colors.muted ?? '#666666');
      pdf.text(dates, x + w, y, { align: 'right' });
    }
    y += 4;

    // Subtitle
    if (subtitle) {
      setFont(cfg.typography.bodyFont, 'normal', cfg.typography.smallSize ?? 8.5);
      setColor(cfg.colors.muted ?? '#666666');
      pdf.text(subtitle, x, y);
      y += 3.8;
    }

    // Details/bullets
    const bullet = bulletChar(cfg);
    entry.details.forEach((detail) => {
      setColor(cfg.colors.text);
      setFont(cfg.typography.bodyFont, 'normal', cfg.typography.bodySize);
      const lines = pdf.splitTextToSize(detail, w - 5);
      if (bullet) {
        pdf.text(bullet, x + 1, y);
        pdf.text(lines, x + 5, y);
      } else {
        pdf.text(lines, x, y);
      }
      y += lines.length * 3.8 + 1.2;
    });
    y += 2.2;
  };

  // --- Header ---
  const writeHeader = () => {
    const nameX = cfg.header.style === 'centered' ? 105 : mLeft;
    const nameAlign = cfg.header.style === 'centered' ? 'center' : 'left';

    // Accent color for name in certain templates
    if (cfg.accent.type === 'underline' || cfg.accent.type === 'color-text') {
      setColor(cfg.colors.accent);
    } else {
      setColor(cfg.colors.text);
    }
    const nameWeight: 'normal' | 'bold' = (cfg.typography.nameWeight === 'bold' || cfg.typography.nameWeight === 'black') ? 'bold' : 'normal';
    setFont(cfg.typography.headingFont, nameWeight, cfg.typography.nameSize);
    pdf.text(doc.header.name || 'Resume', nameX, y, { align: nameAlign });
    y += cfg.typography.nameSize * 0.45 + 2;

    // Underline accent beneath name
    if (cfg.accent.type === 'underline') {
      setDrawColor(cfg.colors.accent);
      pdf.setLineWidth(0.3);
      const ulX = cfg.header.style === 'centered' ? 105 - 15 : mLeft;
      pdf.line(ulX, y - 2, ulX + 30, y - 2);
    }

    // Title
    if (cfg.header.showTitle && doc.header.targetTitle) {
      setColor(cfg.colors.accent);
      setFont(cfg.typography.bodyFont, 'normal', 11);
      pdf.text(doc.header.targetTitle, nameX, y, { align: nameAlign });
      y += 5;
    }

    // Contact
    const contact = [...doc.header.contact, ...doc.header.links].join(`  ${cfg.header.contactSeparator.trim() || '|'}  `);
    if (contact) {
      setFont(cfg.typography.bodyFont, 'normal', cfg.typography.smallSize ?? 8.5);
      setColor(cfg.colors.muted ?? '#666666');
      const lines = pdf.splitTextToSize(contact, contentWidth);
      pdf.text(lines, nameX, y, { align: nameAlign });
      y += lines.length * 3.8 + 2;
    }

    // Header divider
    if (cfg.header.style === 'centered' && cfg.accent.type === 'none') {
      setDrawColor('#c8c8c8');
      pdf.setLineWidth(0.18);
      pdf.line(mLeft, y, 210 - margin, y);
      y += 5;
    } else {
      y += 3;
    }
  };

  // --- Vertical accent bar ---
  const drawAccentBar = () => {
    if (cfg.accent.type === 'vertical-bar' && cfg.accent.barWidthCm) {
      setFillColor(cfg.colors.accent);
      pdf.rect(0, 0, cfg.accent.barWidthCm * 10, 297, 'F');
    }
  };

  // --- Sidebar background ---
  const drawSidebarBg = () => {
    if (isTwoCol && cfg.colors.sidebarBg) {
      setFillColor(cfg.colors.sidebarBg);
      pdf.rect(sideLeft - 3, 0, sideW + 6, 297, 'F');
    }
  };

  // --- Render ---
  drawAccentBar();
  drawSidebarBg();
  writeHeader();

  // Summary
  if (doc.summary) {
    const summaryLines = pdf.splitTextToSize(doc.summary, isTwoCol ? mainW : contentWidth);
    ensureSpace(10 + summaryLines.length * 4);
    writeSectionTitle('Professional Summary', mainLeft, mainW);
    setFont(cfg.typography.bodyFont, 'normal', cfg.typography.bodySize);
    setColor(cfg.colors.text);
    pdf.text(summaryLines, mainLeft, y);
    y += summaryLines.length * 4 + 3;
  }

  if (isTwoCol) {
    // Two-column: main column sections
    const sidebarKeys = new Set(cfg.sections.sidebarSections ?? []);
    const mainSections = allSections.filter((s) => !sidebarKeys.has(s.key));
    const sideSections = allSections.filter((s) => sidebarKeys.has(s.key));

    const mainStartY = y;
    mainSections.forEach((section) => {
      ensureSpace(8);
      writeSectionTitle(section.title, mainLeft, mainW);
      section.entries.forEach((e) => writeEntry(e, mainLeft, mainW));
    });

    // Render sidebar sections
    let sideY = mainStartY;
    sideSections.forEach((section) => {
      if (sideY + 10 > bottom) return; // simple overflow guard
      setColor(cfg.colors.accent);
      setFont(cfg.typography.headingFont, 'bold', 9);
      pdf.text(section.title.toUpperCase(), sideLeft, sideY);
      sideY += 5;
      section.entries.forEach((entry) => {
        const title = entryTitleForExport(entry);
        setColor(cfg.colors.text);
        setFont(cfg.typography.bodyFont, 'bold', cfg.typography.bodySize);
        pdf.text(title, sideLeft, sideY);
        sideY += 4;
        const subtitle = entrySubtitleForExport(entry);
        if (subtitle) {
          setFont(cfg.typography.bodyFont, 'normal', cfg.typography.smallSize ?? 8.5);
          setColor(cfg.colors.muted ?? '#666666');
          pdf.text(subtitle, sideLeft, sideY);
          sideY += 3.5;
        }
        entry.details.forEach((detail) => {
          setColor(cfg.colors.text);
          setFont(cfg.typography.bodyFont, 'normal', cfg.typography.bodySize);
          const lines = pdf.splitTextToSize(detail, sideW - 3);
          pdf.text(lines, sideLeft, sideY);
          sideY += lines.length * 3.8 + 1;
        });
        sideY += 3;
      });
      sideY += 3;
    });
  } else {
    // Single column
    allSections.forEach((section) => {
      ensureSpace(8);
      writeSectionTitle(section.title, mLeft, contentWidth);
      section.entries.forEach((e) => writeEntry(e, mLeft, contentWidth));
    });
  }

  addFooter();
  pdf.save(`${mode === 'cv' ? 'professional_cv' : 'professional_resume'}.pdf`);
}

// ---------------------------------------------------------------------------
// DOCX Rendering Engine — config-driven
// ---------------------------------------------------------------------------

export async function downloadResumeDocx(doc: ResumeDocument, mode: 'resume' | 'cv', settings: ResumeSettings): Promise<void> {
  const cfg = getConfig(settings);
  const allSections = resumeSections(doc, mode, settings.length);
  const children: Paragraph[] = [];

  const accentColor = cfg.colors.accent.replace('#', '');
  const headingColor = (cfg.colors.headingColor ?? cfg.colors.accent).replace('#', '');
  const textColor = cfg.colors.text.replace('#', '');
  const mutedColor = (cfg.colors.muted ?? '#666666').replace('#', '');

  const headingFontName = cfg.typography.headingFont === 'serif' ? 'Times New Roman' : cfg.typography.headingFont === 'monospace' ? 'Courier New' : 'Calibri';
  const bodyFontName = cfg.typography.bodyFont === 'serif' ? 'Times New Roman' : cfg.typography.bodyFont === 'monospace' ? 'Courier New' : 'Calibri';

  const isTwoCol = cfg.layout.type !== 'single' && cfg.layout.sidebarWidthPercent > 0;
  const sidebarKeys = new Set(cfg.sections.sidebarSections ?? []);

  const makeHeading = (text: string, level: typeof HeadingLevel.HEADING_1 | typeof HeadingLevel.TITLE = HeadingLevel.HEADING_1, color: string = headingColor) => {
    const isUpper = cfg.sections.headingStyle === 'uppercase-rule' || cfg.sections.headingStyle === 'uppercase' || cfg.sections.headingStyle === 'small-caps';
    return new Paragraph({
      children: [new TextRun({
        text: isUpper ? text.toUpperCase() : text,
        bold: cfg.typography.headingWeight === 'bold' || cfg.sections.headingStyle === 'bold-color',
        font: headingFontName,
        size: Math.round(cfg.typography.headingSize * 2),
        color,
      })],
      heading: level,
      keepNext: true,
      spacing: { before: cfg.spacing.sectionBeforePt * 10, after: cfg.spacing.sectionAfterPt * 10 },
      border: cfg.sections.divider === 'thin-rule' ? {
        bottom: { style: BorderStyle.SINGLE, size: 1, color: mutedColor },
      } : undefined,
    });
  };

  // Header
  const nameAlign = cfg.header.style === 'centered' ? AlignmentType.CENTER : AlignmentType.LEFT;
  if (doc.header.name) {
    children.push(new Paragraph({
      children: [new TextRun({
        text: doc.header.name,
        bold: cfg.typography.nameWeight === 'bold' || cfg.typography.nameWeight === 'black',
        font: headingFontName,
        size: Math.round(cfg.typography.nameSize * 2),
        color: (cfg.accent.type === 'underline' || cfg.accent.type === 'color-text') ? accentColor : textColor,
      })],
      alignment: nameAlign,
      spacing: { after: 80 },
    }));
  }
  if (cfg.header.showTitle && doc.header.targetTitle) {
    children.push(new Paragraph({
      children: [new TextRun({ text: doc.header.targetTitle, font: bodyFontName, size: 22, color: accentColor })],
      alignment: nameAlign,
      spacing: { after: 80 },
    }));
  }
  const contactText = [...doc.header.contact, ...doc.header.links].join(`  ${cfg.header.contactSeparator.trim() || '|'}  `);
  if (contactText) {
    children.push(new Paragraph({
      children: [new TextRun({ text: contactText, font: bodyFontName, size: 17, color: mutedColor })],
      alignment: nameAlign,
      spacing: { after: 180 },
    }));
  }

  // Summary
  if (doc.summary) {
    children.push(makeHeading('Professional Summary'));
    children.push(new Paragraph({
      children: [new TextRun({ text: doc.summary, font: bodyFontName, size: Math.round(cfg.typography.bodySize * 2), color: textColor })],
      spacing: { after: 120 },
      keepNext: true,
    }));
  }

  // Helper to create an entry paragraph
  const makeEntryParagraph = (entry: ResumeSectionEntry) => {
    const heading = entryTitleForExport(entry);
    const meta = entrySubtitleForExport(entry);
    const dates = entryDatesForExport(entry);
    return new Paragraph({
      children: [
        new TextRun({ text: heading, bold: true, font: bodyFontName, size: Math.round(cfg.typography.bodySize * 2), color: textColor }),
        new TextRun({ text: meta ? ` — ${meta}` : '', font: bodyFontName, size: Math.round(cfg.typography.bodySize * 2), color: mutedColor }),
        new TextRun({ text: dates ? `\t${dates}` : '', font: bodyFontName, size: Math.round((cfg.typography.smallSize ?? 8.5) * 2), color: mutedColor }),
      ],
      keepNext: entry.details.length > 0,
      spacing: { after: 30 },
      tabStops: dates ? [{ type: 'right', position: 9000 }] : undefined,
    });
  };

  const makeDetailParagraph = (detail: string, index: number, total: number) => new Paragraph({
    text: detail,
    bullet: cfg.sections.bulletStyle !== 'none' ? { level: 0 } : undefined,
    keepNext: index < total - 1,
    spacing: { after: 20 },
  });

  if (isTwoCol) {
    // Two-column DOCX: use a borderless table for sidebar + main
    const mainSections = allSections.filter((s) => !sidebarKeys.has(s.key));
    const sideSections = allSections.filter((s) => sidebarKeys.has(s.key));

    // Render main column content
    const mainChildren: Paragraph[] = [];
    mainSections.forEach((section) => {
      mainChildren.push(makeHeading(section.title));
      section.entries.forEach((entry) => {
        mainChildren.push(makeEntryParagraph(entry));
        entry.details.filter(Boolean).forEach((d, i) => mainChildren.push(makeDetailParagraph(d, i, entry.details.length)));
      });
    });

    // Render sidebar content
    const sideChildren: Paragraph[] = [];
    sideSections.forEach((section) => {
      sideChildren.push(new Paragraph({
        children: [new TextRun({
          text: section.title.toUpperCase(),
          bold: true,
          font: headingFontName,
          size: Math.round(cfg.typography.headingSize * 2),
          color: accentColor,
        })],
        keepNext: true,
        spacing: { before: 80, after: 60 },
      }));
      section.entries.forEach((entry) => {
        const title = entryTitleForExport(entry);
        sideChildren.push(new Paragraph({
          children: [new TextRun({ text: title, bold: true, font: bodyFontName, size: Math.round(cfg.typography.bodySize * 2), color: textColor })],
          spacing: { after: 20 },
        }));
        const subtitle = entrySubtitleForExport(entry);
        if (subtitle) {
          sideChildren.push(new Paragraph({
            children: [new TextRun({ text: subtitle, font: bodyFontName, size: Math.round((cfg.typography.smallSize ?? 8.5) * 2), color: mutedColor })],
            spacing: { after: 20 },
          }));
        }
        entry.details.forEach((d) => {
          sideChildren.push(new Paragraph({
            children: [new TextRun({ text: d, font: bodyFontName, size: Math.round(cfg.typography.bodySize * 2), color: textColor })],
            spacing: { after: 20 },
          }));
        });
      });
    });

    const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
    const sidePercent = cfg.layout.sidebarWidthPercent;
    const mainPercent = 100 - sidePercent;

    const sidebarCell = cfg.layout.type === 'two-column-right'
      ? new TableCell({
          children: sideChildren,
          width: { size: sidePercent * 50, type: WidthType.DXA },
          borders: noBorders,
          shading: cfg.colors.sidebarBg ? { type: ShadingType.CLEAR, fill: cfg.colors.sidebarBg.replace('#', '') } : undefined,
        })
      : null;

    const mainCell = new TableCell({
      children: mainChildren,
      width: { size: mainPercent * 50, type: WidthType.DXA },
      borders: noBorders,
    });

    const sideCellLeft = cfg.layout.type === 'two-column-left'
      ? new TableCell({
          children: sideChildren,
          width: { size: sidePercent * 50, type: WidthType.DXA },
          borders: noBorders,
          shading: cfg.colors.sidebarBg ? { type: ShadingType.CLEAR, fill: cfg.colors.sidebarBg.replace('#', '') } : undefined,
        })
      : null;

    const cells = cfg.layout.type === 'two-column-left'
      ? [sideCellLeft!, mainCell]
      : [mainCell, sidebarCell!];

    children.push(new Paragraph({ text: '', spacing: { after: 60 } }));
    children.push(
      // DOCX expects Table as a child — cast to satisfy types
      new Table({
        rows: [new TableRow({ children: cells })],
        width: { size: 100, type: WidthType.PERCENTAGE },
      }) as unknown as Paragraph,
    );
  } else {
    // Single column
    allSections.forEach((section) => {
      children.push(makeHeading(section.title));
      section.entries.forEach((entry) => {
        children.push(makeEntryParagraph(entry));
        entry.details.filter(Boolean).forEach((d, i) => children.push(makeDetailParagraph(d, i, entry.details.length)));
      });
    });
  }

  const marginTwips = Math.round(cfg.layout.marginCm * 567);
  const blob = await Packer.toBlob(new Document({
    sections: [{
      properties: { page: { margin: { top: marginTwips, right: marginTwips, bottom: marginTwips, left: marginTwips } } },
      children,
    }],
  }));
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${mode === 'cv' ? 'professional_cv' : 'professional_resume'}.docx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
