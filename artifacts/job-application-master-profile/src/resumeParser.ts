/**
 * Resume import module — extracts text from uploaded PDF/DOCX files, parses
 * common resume sections, and maps the extracted data into the existing
 * AnswerMap (question-id → string) so the existing questionnaire opens with
 * pre-filled answers.
 *
 * This module is intentionally conservative: it only populates fields that can
 * be confidently identified from the source text. It never invents missing
 * information. The user reviews and edits everything before continuing.
 */

import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
// @ts-expect-error — mammoth.browser.js ships without type declarations
import mammoth from 'mammoth/mammoth.browser';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ParsedExperienceEntry = {
  title: string;
  employer: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
};

export type ParsedEducationEntry = {
  qualification: string;
  subject: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
};

export type ParsedProjectEntry = {
  name: string;
  contribution: string[];
};

export type ParsedCertificationEntry = {
  name: string;
  issuer: string;
};

export type ParsedResume = {
  contact: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl: string;
    portfolioUrl: string;
  };
  targetRole: string;
  headline: string;
  summary: string;
  experience: ParsedExperienceEntry[];
  education: ParsedEducationEntry[];
  skills: string[];
  tools: string[];
  projects: ParsedProjectEntry[];
  certifications: ParsedCertificationEntry[];
  achievements: string[];
};

export type AnswerMap = Record<number, string>;

// ---------------------------------------------------------------------------
// Text extraction
// ---------------------------------------------------------------------------

type PdfTextItem = { str: string; transform: number[]; hasEOL: boolean };

async function extractTextFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const doc = await loadingTask.promise;
  const lines: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items = (content.items as unknown[]).filter(
      (item): item is PdfTextItem => typeof (item as PdfTextItem)?.str === 'string' && Boolean((item as PdfTextItem).str),
    );

    // Sort by Y descending (top→bottom on page), then X ascending (left→right).
    items.sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 2) return yDiff;
      return a.transform[4] - b.transform[4];
    });

    // Group items with similar Y into visual lines.
    let currentY: number | null = null;
    let currentLine: string[] = [];
    for (const item of items) {
      const y = item.transform[5];
      if (currentY !== null && Math.abs(y - currentY) > 2) {
        lines.push(currentLine.join(' '));
        currentLine = [];
      }
      currentY = y;
      currentLine.push(item.str);
    }
    if (currentLine.length) lines.push(currentLine.join(' '));
    lines.push(''); // page break separator
  }

  await doc.cleanup();
  await loadingTask.destroy();
  return lines.join('\n').trim();
}

async function extractTextFromDocx(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value as string;
}

// --- Image OCR (scanned resumes / screenshots) ---

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tif', '.tiff'];

/** Returns true when the given file is a raster image we can run OCR on. */
export function isImageFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext))) return true;
  const type = file.type.toLowerCase();
  return type.startsWith('image/') && !type.includes('svg');
}

/**
 * Runs Tesseract.js OCR on an image file and returns the recognized text.
 * The tesseract.js library is imported dynamically so it (and its WASM core)
 * are only downloaded when a user actually uploads an image.
 */
async function extractTextFromImage(file: File): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(file);
    return data.text ?? '';
  } finally {
    await worker.terminate();
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (name.endsWith('.pdf') || type === 'application/pdf') {
    return extractTextFromPdf(file);
  }
  if (
    name.endsWith('.docx') ||
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractTextFromDocx(file);
  }
  if (isImageFile(file)) {
    return extractTextFromImage(file);
  }
  throw new Error('Unsupported file format. Please upload a PDF, DOCX, or image file.');
}

// ---------------------------------------------------------------------------
// Resume text parser
// ---------------------------------------------------------------------------

const SECTION_PATTERNS: Array<{ regex: RegExp; section: string }> = [
  { regex: /^\s*(professional\s+)?(summary|objective|profile|about(\s+me)?)\s*[-:|•]?\s*$/i, section: 'summary' },
  { regex: /^\s*(professional\s+|work\s+|employment\s+|career\s+)?(experience|history|employment|background)\s*[-:|•]?\s*$/i, section: 'experience' },
  { regex: /^\s*education(?:\s*(and|&)\s*training)?\s*[-:|•]?\s*$/i, section: 'education' },
  { regex: /^\s*(technical\s+|core\s+|key\s+|relevant\s+)?(skills|competencies|technologies|expertise)\s*[-:|•]?\s*$/i, section: 'skills' },
  { regex: /^\s*(selected\s+|personal\s+|key\s+|notable\s+)?projects?\s*[-:|•]?\s*$/i, section: 'projects' },
  { regex: /^\s*(certifications?|licenses?|certificates?)\s*(and\s+licenses?)?\s*[-:|•]?\s*$/i, section: 'certifications' },
  { regex: /^\s*(achievements?|awards?|honors?|honours?|accomplishments?)\s*[-:|•]?\s*$/i, section: 'achievements' },
];

function detectSection(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 60) return null;
  for (const { regex, section } of SECTION_PATTERNS) {
    if (regex.test(trimmed)) return section;
  }
  return null;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{2,4}[-.\s]?\d{0,4}/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|pub)\/[\w-]+/i;
const GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i;
const URL_RE = /https?:\/\/[^\s<>()]+/i;
const DATE_RANGE_RE = /((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?\.?\s+\d{4})|(?:\d{1,2}\/\d{2,4})|(?:\d{4}))\s*(?:[-–—]|to|until|through)\s*((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?\.?\s+\d{4})|(?:\d{1,2}\/\d{2,4})|(?:\d{4})|(?:present|current|now|ongoing|today))/i;

function parseDateRange(text: string): { start: string; end: string } {
  const match = text.match(DATE_RANGE_RE);
  if (match) {
    return { start: match[1].trim(), end: match[2].trim() };
  }
  return { start: '', end: '' };
}

function isBulletLine(line: string): boolean {
  const trimmed = line.trim();
  return /^[•\-*▪►▸◦‣·]/.test(trimmed) || /^\d+[.)]\s/.test(trimmed);
}

function cleanBullet(line: string): string {
  return line.trim().replace(/^[•\-*▪►▸◦‣·]\s*/, '').replace(/^\d+[.)]\s*/, '').trim();
}

function splitBySeparator(text: string): string[] {
  return text
    .split(/[|,•;·]|\s{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function looksLikeLocation(text: string): boolean {
  // "City, ST" or "City, State" or "City, Country" — short, has a comma
  const parts = text.split(',');
  return parts.length >= 2 && parts.length <= 3 && text.length < 50 && /^[A-Z]/.test(text.trim());
}

function looksLikeJobTitle(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 80) return false;
  // Common title words — not a perfect detector but good enough for heuristics
  const titleWords = /\b(senior|junior|lead|principal|staff|chief|head|director|manager|engineer|developer|designer|analyst|architect|consultant|specialist|administrator|coordinator|officer|intern|assistant|associate|developer|programmer|scientist|strategist|advocate|recruiter|writer|editor|product|project|program|software|data|fullstack|full-stack|front-?end|back-?end|devops|security|cloud|systems?|business|marketing|sales|operations?|finance|accountant|teacher|professor|researcher|trainer|supervisor|technician|administrator|clerk|representative|executive)\b/i;
  return titleWords.test(trimmed);
}

function parseExperienceEntries(sectionLines: string[]): ParsedExperienceEntry[] {
  const entries: ParsedExperienceEntry[] = [];
  let current: ParsedExperienceEntry | null = null;
  let headerLines: string[] = [];

  const flushEntry = () => {
    if (!current && headerLines.length === 0) return;
    if (!current) {
      current = { title: '', employer: '', location: '', startDate: '', endDate: '', responsibilities: [] };
    }

    // Parse the collected header lines to extract title, employer, location, dates.
    for (const line of headerLines) {
      if (!current.startDate && !current.endDate) {
        const dates = parseDateRange(line);
        if (dates.start || dates.end) {
          current.startDate = dates.start;
          current.endDate = dates.end;
          const remainder = line.replace(DATE_RANGE_RE, '').replace(/[-–|•,\s]+$/, '').trim();
          if (remainder && !current.employer && !current.title) {
            const parts = splitBySeparator(remainder);
            for (const part of parts) {
              if (looksLikeLocation(part) && !current.location) current.location = part;
              else if (!current.employer) current.employer = part;
              else if (!current.title) current.title = part;
            }
          }
          continue;
        }
      }
      if (!current.location && looksLikeLocation(line)) {
        current.location = line;
        continue;
      }
      if (!current.title && looksLikeJobTitle(line)) {
        current.title = line;
        continue;
      }
      if (!current.employer) {
        // Company name — often the first header line or a proper noun phrase.
        current.employer = line;
        continue;
      }
      // Additional header line — try to fill missing fields.
      if (!current.title) current.title = line;
    }

    if (current.title || current.employer || current.responsibilities.length > 0) {
      entries.push(current);
    }
    current = null;
    headerLines = [];
  };

  for (const line of sectionLines) {
    if (isBulletLine(line)) {
      if (!current) {
        current = { title: '', employer: '', location: '', startDate: '', endDate: '', responsibilities: [] };
      }
      const cleaned = cleanBullet(line);
      if (cleaned) current.responsibilities.push(cleaned);
      continue;
    }

    // Non-bullet line — decide if it starts a new entry or continues the header.
    const hasDates = DATE_RANGE_RE.test(line);
    const looksLikeTitle = looksLikeJobTitle(line);

    if (current && current.responsibilities.length > 0 && (hasDates || looksLikeTitle)) {
      // This line likely starts a new entry.
      flushEntry();
    }

    if (!current) {
      current = { title: '', employer: '', location: '', startDate: '', endDate: '', responsibilities: [] };
    }
    headerLines.push(line);
  }
  flushEntry();

  return entries;
}

function parseEducationEntries(sectionLines: string[]): ParsedEducationEntry[] {
  const entries: ParsedEducationEntry[] = [];
  let current: ParsedEducationEntry | null = null;
  let headerLines: string[] = [];

  const flushEntry = () => {
    if (!current && headerLines.length === 0) return;
    if (!current) {
      current = { qualification: '', subject: '', institution: '', location: '', startDate: '', endDate: '' };
    }

    for (const line of headerLines) {
      if (!current.startDate && !current.endDate) {
        const dates = parseDateRange(line);
        if (dates.start || dates.end) {
          current.startDate = dates.start;
          current.endDate = dates.end;
          continue;
        }
      }
      if (!current.location && looksLikeLocation(line)) {
        current.location = line;
        continue;
      }
      // First line is typically the degree/qualification, second is institution.
      if (!current.qualification) {
        // Try to split "B.S. Computer Science" into qualification + subject.
        const degreeMatch = line.match(/^(B\.?S\.?|B\.?A\.?|B\.?Eng\.?|B\.?Tech\.?|M\.?S\.?|M\.?A\.?|M\.?Eng\.?|M\.?Tech\.?|M\.?B\.?A\.?|Ph\.?D\.?|Associate'?s?|Diploma|Certificate|High School)\b\.?\s*(.*)$/i);
        if (degreeMatch) {
          current.qualification = degreeMatch[1].replace(/\./g, '').trim();
          if (degreeMatch[2]) current.subject = degreeMatch[2].trim();
        } else {
          current.qualification = line;
        }
        continue;
      }
      if (!current.institution) {
        current.institution = line;
        continue;
      }
    }

    if (current.qualification || current.institution) {
      entries.push(current);
    }
    current = null;
    headerLines = [];
  };

  for (const line of sectionLines) {
    if (isBulletLine(line)) {
      // Education entries rarely have bullets, but handle gracefully.
      if (!current) {
        current = { qualification: '', subject: '', institution: '', location: '', startDate: '', endDate: '' };
      }
      continue;
    }

    const hasDates = DATE_RANGE_RE.test(line);
    if (current && (current.qualification || current.institution) && hasDates) {
      flushEntry();
    }

    if (!current) {
      current = { qualification: '', subject: '', institution: '', location: '', startDate: '', endDate: '' };
    }
    headerLines.push(line);
  }
  flushEntry();

  return entries;
}

function parseProjectEntries(sectionLines: string[]): ParsedProjectEntry[] {
  const entries: ParsedProjectEntry[] = [];
  let current: ParsedProjectEntry | null = null;

  for (const line of sectionLines) {
    if (isBulletLine(line)) {
      if (!current) {
        current = { name: '', contribution: [] };
      }
      const cleaned = cleanBullet(line);
      if (cleaned) current.contribution.push(cleaned);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    // A non-bullet line starts a new project (or continues if no bullets yet).
    if (current && current.contribution.length > 0) {
      entries.push(current);
      current = null;
    }
    if (!current) {
      current = { name: '', contribution: [] };
    }
    if (!current.name) {
      current.name = trimmed;
    }
  }
  if (current && (current.name || current.contribution.length > 0)) {
    entries.push(current);
  }

  return entries;
}

function parseCertificationEntries(sectionLines: string[]): ParsedCertificationEntry[] {
  const entries: ParsedCertificationEntry[] = [];
  let current: ParsedCertificationEntry | null = null;

  for (const line of sectionLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isBulletLine(line)) {
      if (!current) {
        current = { name: '', issuer: '' };
      }
      if (!current.name) current.name = cleanBullet(line);
      continue;
    }

    // Each non-bullet line is typically a new certification entry or a continuation.
    if (current && current.name) {
      // Check if this line looks like an issuer/date line.
      if (!current.issuer && (trimmed.includes('|') || DATE_RANGE_RE.test(trimmed) || trimmed.length < 80)) {
        const parts = splitBySeparator(trimmed);
        // First part that isn't a date is the issuer.
        for (const part of parts) {
          if (!DATE_RANGE_RE.test(part)) {
            current.issuer = part;
            break;
          }
        }
        entries.push(current);
        current = null;
        continue;
      }
      // Otherwise, push current and start a new one.
      entries.push(current);
      current = null;
    }

    if (!current) {
      current = { name: '', issuer: '' };
    }
    current.name = trimmed;
  }
  if (current && current.name) {
    entries.push(current);
  }

  return entries;
}

function parseSkillsList(sectionLines: string[]): { skills: string[]; tools: string[] } {
  const allText = sectionLines.join(' ');
  // Split by common delimiters.
  const items = allText
    .split(/[•;,\n]|\s{2,}/)
    .map((item) => item.trim().replace(/^[-•·]\s*/, ''))
    .filter(Boolean);

  // Heuristic: separate "soft/professional" skills from "tools/technologies".
  const toolKeywords = /\b(react|vue|angular|node|python|java|javascript|typescript|c\+\+|c#|go|ruby|rails|django|flask|spring|docker|kubernetes|aws|azure|gcp|terraform|jenkins|git|sql|mongodb|postgres|mysql|redis|kafka|graphql|rest|grpc|html|css|sass|webpack|vite|jest|cypress| selenium|linux|bash|powershell|excel|tableau|powerbi|salesforce|jira|confluence|figma|sketch|photoshop|illustrator|indesign)\b/i;

  const skills: string[] = [];
  const tools: string[] = [];
  for (const item of items) {
    if (toolKeywords.test(item)) {
      tools.push(item);
    } else {
      skills.push(item);
    }
  }

  return { skills, tools };
}

export function parseResumeText(text: string): ParsedResume {
  const rawLines = text.split(/\r?\n/);
  const lines = rawLines.map((l) => l.replace(/\s+/g, ' ').trim()).filter((l) => l.length > 0);

  const result: ParsedResume = {
    contact: { fullName: '', email: '', phone: '', location: '', linkedinUrl: '', portfolioUrl: '' },
    targetRole: '',
    headline: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    tools: [],
    projects: [],
    certifications: [],
    achievements: [],
  };

  // --- Phase 1: Split lines into sections ---
  let currentSection: string | null = null;
  const sectionLines: Record<string, string[]> = {};
  const preSectionLines: string[] = [];

  for (const line of lines) {
    const detected = detectSection(line);
    if (detected) {
      currentSection = detected;
      sectionLines[currentSection] = [];
      continue;
    }
    if (currentSection) {
      (sectionLines[currentSection] ??= []).push(line);
    } else {
      preSectionLines.push(line);
    }
  }

  // --- Phase 2: Extract contact info from pre-section lines ---
  const contactBlob = preSectionLines.join('\n');

  const emailMatch = contactBlob.match(EMAIL_RE);
  if (emailMatch) result.contact.email = emailMatch[0];

  const linkedinMatch = contactBlob.match(LINKEDIN_RE);
  if (linkedinMatch) result.contact.linkedinUrl = linkedinMatch[0].replace(/^[./]+/, '');

  const githubMatch = contactBlob.match(GITHUB_RE);
  if (githubMatch) result.contact.portfolioUrl = githubMatch[0];

  if (!result.contact.portfolioUrl) {
    const urlMatch = contactBlob.match(URL_RE);
    if (urlMatch && !urlMatch[0].includes('linkedin.com')) {
      result.contact.portfolioUrl = urlMatch[0];
    }
  }

  // Phone — scan each pre-section line for a phone-like pattern.
  for (const line of preSectionLines) {
    const phoneCandidate = line.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneCandidate && phoneCandidate[0].length >= 7) {
      result.contact.phone = phoneCandidate[0].trim();
      break;
    }
  }

  // Name — the first pre-section line that doesn't contain @, URLs, or phone digits.
  for (const line of preSectionLines) {
    if (EMAIL_RE.test(line) || LINKEDIN_RE.test(line) || GITHUB_RE.test(line) || URL_RE.test(line)) continue;
    if (/\d{3}/.test(line) && line.length < 40) continue; // likely a phone/contact line
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && line.length <= 60) {
      result.contact.fullName = line;
      break;
    }
  }

  // Target role / headline — the line after the name (if it looks like a title).
  const nameIndex = preSectionLines.indexOf(result.contact.fullName);
  if (nameIndex >= 0 && nameIndex + 1 < preSectionLines.length) {
    const candidate = preSectionLines[nameIndex + 1];
    if (!EMAIL_RE.test(candidate) && !LINKEDIN_RE.test(candidate) && !GITHUB_RE.test(candidate) && !URL_RE.test(candidate)) {
      if (looksLikeJobTitle(candidate) || candidate.length < 60) {
        result.targetRole = candidate;
        result.headline = candidate;
      }
    }
  }

  // Location — look for a "City, ST" pattern in the pre-section lines.
  for (const line of preSectionLines) {
    if (looksLikeLocation(line) && !EMAIL_RE.test(line) && !LINKEDIN_RE.test(line) && !GITHUB_RE.test(line)) {
      // Make sure it's not just the name line.
      if (line !== result.contact.fullName) {
        result.contact.location = line.split(/[|•]/)[0].trim();
        break;
      }
    }
  }

  // --- Phase 3: Parse each section ---
  if (sectionLines.summary) {
    result.summary = sectionLines.summary.join('\n').trim();
  }

  if (sectionLines.experience) {
    result.experience = parseExperienceEntries(sectionLines.experience);
  }

  if (sectionLines.education) {
    result.education = parseEducationEntries(sectionLines.education);
  }

  if (sectionLines.skills) {
    const { skills, tools } = parseSkillsList(sectionLines.skills);
    result.skills = skills;
    result.tools = tools;
  }

  if (sectionLines.projects) {
    result.projects = parseProjectEntries(sectionLines.projects);
  }

  if (sectionLines.certifications) {
    result.certifications = parseCertificationEntries(sectionLines.certifications);
  }

  if (sectionLines.achievements) {
    result.achievements = sectionLines.achievements
      .map((line) => cleanBullet(line))
      .filter(Boolean);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Answer map mapping
// ---------------------------------------------------------------------------

export function mapParsedResumeToAnswers(parsed: ParsedResume): AnswerMap {
  const answers: AnswerMap = {};

  // --- Contact ---
  if (parsed.contact.fullName) {
    answers[1] = parsed.contact.fullName;
    answers[2] = parsed.contact.fullName; // Resume name defaults to full name
  }
  if (parsed.contact.email) answers[3] = parsed.contact.email;
  if (parsed.contact.phone) answers[4] = parsed.contact.phone;
  if (parsed.contact.location) answers[5] = parsed.contact.location;
  if (parsed.contact.linkedinUrl) answers[6] = parsed.contact.linkedinUrl;
  if (parsed.contact.portfolioUrl) answers[7] = parsed.contact.portfolioUrl;

  // --- Professional identity ---
  if (parsed.targetRole) answers[8] = parsed.targetRole;
  if (parsed.headline) answers[10] = parsed.headline;

  // --- Summary ---
  if (parsed.summary) answers[51] = parsed.summary;

  // --- Experience (current + previous) ---
  if (parsed.experience.length > 0) {
    const first = parsed.experience[0];
    answers[11] = 'YES'; // Has work experience
    if (first.title) answers[12] = first.title;
    if (first.employer) answers[13] = first.employer;
    if (first.location) answers[14] = first.location;
    if (first.startDate) answers[15] = first.startDate;
    if (first.endDate) answers[16] = first.endDate;
    if (first.responsibilities.length > 0) answers[17] = first.responsibilities.join('\n');

    if (parsed.experience.length > 1) {
      const second = parsed.experience[1];
      answers[21] = 'YES'; // Has previous experience
      if (second.employer) answers[22] = second.employer;
      if (second.title) answers[23] = second.title;
      if (second.startDate || second.endDate) {
        answers[25] = [second.startDate, second.endDate].filter(Boolean).join(' - ');
      }
      if (second.responsibilities.length > 0) answers[26] = second.responsibilities.join('\n');
    }
  }

  // --- Education ---
  if (parsed.education.length > 0) {
    const first = parsed.education[0];
    if (first.qualification) answers[31] = first.qualification;
    if (first.subject) answers[32] = first.subject;
    if (first.institution) answers[33] = first.institution;
    if (first.location) answers[34] = first.location;
    if (first.startDate) answers[35] = first.startDate;
    if (first.endDate) answers[36] = first.endDate;
  }

  // --- Skills ---
  if (parsed.skills.length > 0) answers[41] = parsed.skills.join('\n');
  if (parsed.tools.length > 0) answers[42] = parsed.tools.join('\n');

  // --- Projects ---
  if (parsed.projects.length > 0) {
    const first = parsed.projects[0];
    answers[43] = 'YES'; // Has projects
    if (first.name) answers[44] = first.name;
    if (first.contribution.length > 0) answers[45] = first.contribution.join('\n');
  }

  // --- Achievements ---
  if (parsed.achievements.length > 0) {
    answers[49] = 'YES'; // Has achievements
    answers[50] = parsed.achievements.join('\n');
  }

  // --- Certifications ---
  if (parsed.certifications.length > 0) {
    const first = parsed.certifications[0];
    answers[71] = 'YES'; // Has certifications
    if (first.name) answers[72] = first.name;
    if (first.issuer) answers[73] = first.issuer;
  }

  return answers;
}

// ---------------------------------------------------------------------------
// Field preview helpers (used by the UI to show what was parsed)
// ---------------------------------------------------------------------------

export type ParsedFieldPreview = {
  questionId: number;
  label: string;
  value: string;
};

export function buildParsedPreview(parsed: ParsedResume): ParsedFieldPreview[] {
  const answers = mapParsedResumeToAnswers(parsed);
  const labels: Record<number, string> = {
    1: 'Full Name',
    2: 'Resume Name',
    3: 'Email',
    4: 'Phone',
    5: 'Location',
    6: 'LinkedIn',
    7: 'Portfolio / GitHub',
    8: 'Target Role',
    10: 'Headline',
    11: 'Has Work Experience',
    12: 'Current Job Title',
    13: 'Current Employer',
    14: 'Current Location',
    15: 'Current Start Date',
    16: 'Current End Date',
    17: 'Current Responsibilities',
    21: 'Has Previous Experience',
    22: 'Previous Employer',
    23: 'Previous Job Title',
    25: 'Previous Dates',
    26: 'Previous Responsibilities',
    31: 'Education Qualification',
    32: 'Education Subject',
    33: 'Education Institution',
    34: 'Education Location',
    35: 'Education Start Date',
    36: 'Education End Date',
    41: 'Professional Skills',
    42: 'Tools',
    43: 'Has Projects',
    44: 'Project Name',
    45: 'Project Contribution',
    49: 'Has Achievements',
    50: 'Achievement Details',
    51: 'Professional Summary',
    71: 'Has Certifications',
    72: 'Certification Name',
    73: 'Certification Issuer',
  };

  return Object.entries(answers)
    .map(([id, value]) => {
      const questionId = Number(id);
      return {
        questionId,
        label: labels[questionId] ?? `Question ${questionId}`,
        value,
      };
    })
    .filter((item) => item.value);
}
