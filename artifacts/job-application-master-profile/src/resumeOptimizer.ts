import type { MasterProfile } from './masterProfile';
import type {
  ResumeDocument,
  ResumeEntry,
  ResumeExperience,
  ResumeSectionEntry,
  ResumeSectionKey,
  ResumeSettings,
} from './resumeDocument';

export type RelevanceTermGroup = {
  keywords: string[];
  skills: string[];
  responsibilities: string[];
  qualifications: string[];
  tools: string[];
  domainTerms: string[];
};

export type RelevanceScore = {
  key: ResumeSectionKey;
  index: number;
  score: number;
  matchedTerms: string[];
  evidenceStrength: number;
  completeness: number;
};

const STOP_WORDS = new Set([
  'about','after','again','also','and','are','been','being','but','by','can','for','from','have','has','into','is','it','its','job','more','of','on','or','our','role','that','the','their','this','to','using','with','you','your','will','work','working','years','within','a','an','as','at','be','in','we','who','what','how','where','when','which','should','must','required','requirements','responsible','responsibilities','including','preferred','candidate','team','company','position','strong','ability','knowledge','experience','skills','skill',
]);

const KNOWN_SKILLS = [
  'agile','analytics','api','aws','azure','budgeting','coaching','css','data analysis','data science','design','excel','figma','finance','forecasting','git','governance','html','javascript','leadership','marketing','node','operations','planning','power bi','problem solving','program management','project management','python','react','research','risk management','salesforce','scrum','sql','stakeholder management','strategy','testing','typescript','user research','vendor management','communication','negotiation','forecasting','financial analysis','product management','business analysis',
];
const KNOWN_TOOLS = ['adobe','asana','aws','azure','excel','figma','git','google analytics','jira','looker','microsoft office','notion','power bi','salesforce','sap','slack','sql','tableau','trello','wordpress','docker','kubernetes','github','gitlab'];
const KNOWN_QUALIFICATIONS = ['bachelor','bachelors','certification','certified','degree','diploma','master','masters','mba','phd','qualification','license','licence'];
const ACTION_WORDS = new Set(['built','created','decreased','delivered','designed','developed','directed','drove','enabled','established','generated','improved','increased','launched','led','managed','mentored','optimised','optimized','owned','reduced','resolved','shaped','streamlined','supported','transformed','analysed','analyzed','coordinated','implemented','automated','maintained','migrated','negotiated','researched','presented','planned','executed']);
const RESPONSIBILITY_WORDS = /\b(?:responsible|lead|led|manage|managed|build|built|deliver|delivered|develop|developed|own|owned|drive|drove|support|supported|coordinate|coordinated|oversee|oversaw|design|designed|implement|implemented|create|created|analyse|analyze|maintain|maintained|automate|automated|research|researched|plan|planned|execute|executed)\b/i;

function normalise(value: string): string { return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}%+#.&/-]+/gu, ' ').replace(/\s+/g, ' ').trim(); }
function words(value: string): string[] { return normalise(value).split(' ').map((w) => w.replace(/^[./-]+|[./-]+$/g, '')).filter((w) => w.length > 2 && !STOP_WORDS.has(w)); }
function unique(values: string[]): string[] { return Array.from(new Set(values.map(normalise).filter(Boolean))); }
function phraseMatches(text: string, term: string): boolean {
  const haystack = normalise(text); const target = normalise(term); if (!target) return false;
  if (haystack.includes(target)) return true;
  const targetWords = words(target);
  return targetWords.length > 0 && targetWords.every((word) => haystack.includes(word));
}
function extractSentences(text: string): string[] { return text.split(/\r?\n|[.!?;:]+/).map((s) => s.trim()).filter(Boolean); }

/** Conservative JD analysis. Every extracted term comes from the supplied JD. */
export function extractJobDescriptionTerms(jobDescription: string): RelevanceTermGroup {
  const source = jobDescription.trim();
  if (!source) return { keywords: [], skills: [], responsibilities: [], qualifications: [], tools: [], domainTerms: [] };
  const sentences = extractSentences(source);
  const allWords = words(source);
  const skills = unique(KNOWN_SKILLS.filter((term) => phraseMatches(source, term)));
  const tools = unique(KNOWN_TOOLS.filter((term) => phraseMatches(source, term)));
  const qualifications = unique(KNOWN_QUALIFICATIONS.filter((term) => phraseMatches(source, term)));
  const responsibilityPhrases = unique(sentences
    .filter((s) => RESPONSIBILITY_WORDS.test(s))
    .flatMap((s) => words(s).filter((word) => word.length >= 4))
    .slice(0, 50));
  const domainTerms = unique(sentences
    .flatMap((s) => words(s).filter((word) => word.length >= 5))
    .filter((word) => !skills.includes(word) && !tools.includes(word) && !qualifications.includes(word))
    .slice(0, 50));
  const keywords = unique([...skills, ...tools, ...qualifications, ...responsibilityPhrases, ...domainTerms]);
  return { keywords, skills, responsibilities: responsibilityPhrases, qualifications, tools, domainTerms };
}

function entryText(entry: ResumeSectionEntry): string {
  if ('employer' in entry) return [entry.employer, entry.title, entry.location, entry.dates, ...entry.details].filter(Boolean).join(' ');
  if ('qualification' in entry) return [entry.qualification, entry.institution, entry.location, entry.dates, ...entry.details].filter(Boolean).join(' ');
  return [entry.title, entry.subtitle, entry.dates, ...entry.details].filter(Boolean).join(' ');
}
function sectionWeight(key: ResumeSectionKey): number {
  if (key === 'experience') return 1.2; if (key === 'skills' || key === 'projects') return 1.05; if (key === 'education' || key === 'certifications') return 0.9; return 0.72;
}
function recencyScore(entry: ResumeSectionEntry): number {
  const dates = 'dates' in entry ? entry.dates ?? '' : ''; const years = dates.match(/\b(?:19|20)\d{2}\b/g)?.map(Number) ?? [];
  if (!years.length) return 0.45; const age = Math.max(0, new Date().getFullYear() - Math.max(...years)); return Math.max(0.18, 1 - Math.min(age, 15) / 20);
}
function completenessScore(entry: ResumeSectionEntry): number { return Math.min(1, entryText(entry).split(/\s+/).filter(Boolean).length / 28); }
function evidenceScore(entry: ResumeSectionEntry): number {
  const text = entryText(entry); const numbers = (text.match(/\b\d+(?:\.\d+)?%?|\$[\d,.]+[kKmM]?\b/g) ?? []).length;
  return Math.min(1, 0.35 + entry.details.filter(Boolean).length * 0.1 + numbers * 0.15);
}
function matchesForText(text: string, terms: string[]): string[] { return unique(terms.filter((term) => phraseMatches(text, term))); }
function termsForRole(targetRole: string): string[] { return unique([...words(targetRole), ...KNOWN_SKILLS.filter((skill) => phraseMatches(targetRole, skill))]); }

export function analyzeResumeRelevance(doc: ResumeDocument, targetRole: string, jobDescription = ''): RelevanceScore[] {
  const terms = jobDescription.trim() ? extractJobDescriptionTerms(jobDescription) : { keywords: termsForRole(targetRole), skills: [], responsibilities: [], qualifications: [], tools: [], domainTerms: [] };
  const allTerms = unique([...terms.keywords, ...terms.skills, ...terms.responsibilities, ...terms.qualifications, ...terms.tools, ...terms.domainTerms]);
  const roleTerms = termsForRole(targetRole);
  const scores: RelevanceScore[] = [];
  doc.sectionOrder.forEach((key) => {
    const entries = key === 'additional' ? doc.additionalSections.flatMap((s) => s.entries) : doc[key] as ResumeSectionEntry[];
    entries.forEach((entry, index) => {
      const text = entryText(entry); const matchedTerms = matchesForText(text, allTerms); const roleMatches = matchesForText(text, roleTerms);
      const matchRatio = allTerms.length ? Math.min(1, matchedTerms.length / Math.min(allTerms.length, 8)) : 0;
      const roleBoost = Math.min(0.32, roleMatches.length * 0.08);
      const recency = recencyScore(entry); const importance = sectionWeight(key); const evidenceStrength = evidenceScore(entry); const completeness = completenessScore(entry);
      const score = Math.round(Math.min(100, (matchRatio * 52 + roleBoost * 100 + recency * 13 + evidenceStrength * 12 + completeness * 10) * importance));
      scores.push({ key, index, score, matchedTerms, evidenceStrength, completeness });
    });
  });
  return scores.sort((a, b) => b.score - a.score || a.index - b.index);
}

function filterEntry(entry: ResumeSectionEntry, jobDescription: string): ResumeSectionEntry | null {
  if (!jobDescription.trim()) return entry;
  const terms = extractJobDescriptionTerms(jobDescription); const allTerms = unique([...terms.skills, ...terms.tools, ...terms.qualifications, ...terms.domainTerms, ...terms.responsibilities]);
  const matched = matchesForText(entryText(entry), allTerms);
  if (!matched.length) return null;
  const matchedDetails = entry.details.filter((detail) => matchesForText(detail, allTerms).length > 0);
  return { ...entry, details: matchedDetails.length ? matchedDetails : entry.details };
}
function optimiseDetail(detail: string): string {
  const clean = detail.trim().replace(/^[•*-]\s*/, '').replace(/\s+/g, ' '); if (!clean) return '';
  const first = clean.split(/\s+/)[0].toLocaleLowerCase().replace(/[^a-z]/g, '');
  if (first === 'responsible' && /^responsible\s+for\b/i.test(clean)) return clean.replace(/^responsible\s+for\s+/i, '').replace(/^./, (c) => c.toUpperCase());
  return clean;
}
function optimiseSectionEntry(entry: ResumeSectionEntry): ResumeSectionEntry {
  return { ...entry, details: entry.details.map(optimiseDetail).filter(Boolean) } as ResumeSectionEntry;
}

function selectEntries(entries: ResumeSectionEntry[], key: ResumeSectionKey, scores: RelevanceScore[], jobDescription: string, limit: number): ResumeSectionEntry[] {
  const ranked = entries.map((entry, index) => ({ entry, index, score: scores.find((s) => s.key === key && s.index === index)?.score ?? 0, selected: filterEntry(entry, jobDescription) })).filter((x) => x.selected);
  ranked.sort((a, b) => b.score - a.score || a.index - b.index);
  return ranked.slice(0, limit).map((x) => optimiseSectionEntry(x.selected as ResumeSectionEntry));
}

function lengthLimits(length: ResumeSettings['length'], key: ResumeSectionKey): number {
  if (length === 'full') return Number.MAX_SAFE_INTEGER;
  if (length === '2') return ({ experience: 6, skills: 8, education: 3, certifications: 3, projects: 4, achievements: 4, leadership: 3, languages: 3, publications: 3, additional: 4 } as Record<ResumeSectionKey, number>)[key];
  return ({ experience: 3, skills: 5, education: 1, certifications: 1, projects: 2, achievements: 2, leadership: 1, languages: 2, publications: 1, additional: 1 } as Record<ResumeSectionKey, number>)[key];
}

/** Content selection + derived wording only. MasterProfile is never mutated. */
export function optimizeResumeDocument(doc: ResumeDocument, profile: MasterProfile, settings: ResumeSettings): ResumeDocument {
  const targetRole = settings.targetTitle.trim() || profile.professionalIdentity.targetRole || profile.professionalIdentity.alternativeRole;
  const scores = analyzeResumeRelevance(doc, targetRole, settings.jobDescription);
  const selected = new Set(settings.selectedSections ?? doc.sectionOrder);
  const result: ResumeDocument = {
    ...doc, header: { ...doc.header, targetTitle: targetRole }, summary: settings.summary.trim() || doc.summary,
    experience: [], skills: [], education: [], certifications: [], projects: [], achievements: [], leadership: [], languages: [], publications: [], additionalSections: [],
    sectionOrder: doc.sectionOrder.filter((key) => selected.has(key)),
  };
  doc.sectionOrder.forEach((key) => {
    if (!selected.has(key)) return;
    if (key === 'additional') {
      result.additionalSections = doc.additionalSections.map((section) => ({ ...section, entries: selectEntries(section.entries, key, scores, settings.jobDescription, lengthLimits(settings.length, key)) as ResumeEntry[] })).filter((section) => section.entries.length);
      return;
    }
    const entries = doc[key] as ResumeSectionEntry[];
    (result[key] as ResumeSectionEntry[]) = selectEntries(entries, key, scores, settings.jobDescription, lengthLimits(settings.length, key));
  });
  return result;
}

export function supportedBullet(actionWhat: string, how: string, result: string): string | null {
  const source = actionWhat.trim(); const firstWord = source.split(/\s+/)[0]?.toLocaleLowerCase().replace(/[^a-z]/g, '') ?? '';
  if (!source || !how.trim() || !result.trim() || !ACTION_WORDS.has(firstWord)) return null;
  const what = source.split(/\s+/).slice(1).join(' ').replace(/[.,;:]+$/, '').trim(); if (!what) return null;
  return `${firstWord.charAt(0).toLocaleUpperCase()}${firstWord.slice(1)} ${what} using ${how.trim()}, resulting in ${result.trim()}`;
}
