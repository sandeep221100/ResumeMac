import type {
  MasterProfile,
  MasterProfileAchievement,
  MasterProfileEducation,
  MasterProfileExperience,
  MasterProfileLeadershipVolunteering,
  MasterProfilePublication,
} from './masterProfile';
import { optimizeResumeDocument, supportedBullet } from './resumeOptimizer';
import type { TemplateId } from './resumeTemplates';

export type ResumeTemplate = TemplateId;
export type ResumeLength = '1' | '2' | 'full';
export type DateFormat = 'month-year' | 'numeric' | 'year';

export type ResumeSettings = {
  targetTitle: string;
  summary: string;
  length: ResumeLength;
  template: ResumeTemplate;
  dateFormat: DateFormat;
  jobDescription: string;
  selectedSections: ResumeSectionKey[];
};

export type ResumeHeader = {
  name: string;
  targetTitle: string;
  contact: string[];
  links: string[];
};

export type ResumeExperience = {
  employer: string;
  title: string;
  dates: string;
  location: string;
  details: string[];
};

export type ResumeEducation = {
  qualification: string;
  institution: string;
  location: string;
  dates: string;
  details: string[];
};

export type ResumeEntry = {
  title: string;
  subtitle?: string;
  dates?: string;
  details: string[];
  url?: string;
};

export type ResumeAdditionalSection = {
  title: string;
  entries: ResumeEntry[];
};

export type ResumeSectionKey =
  | 'experience'
  | 'skills'
  | 'education'
  | 'certifications'
  | 'projects'
  | 'achievements'
  | 'leadership'
  | 'languages'
  | 'publications'
  | 'additional';

export type ResumeSectionEntry = ResumeEntry | ResumeExperience | ResumeEducation;

export type ResumeSection = {
  key: ResumeSectionKey;
  title: string;
  entries: ResumeSectionEntry[];
};

/** Canonical, resume-only document derived from MasterProfile. */
export type ResumeDocument = {
  header: ResumeHeader;
  summary: string;
  experience: ResumeExperience[];
  skills: ResumeEntry[];
  education: ResumeEducation[];
  certifications: ResumeEntry[];
  projects: ResumeEntry[];
  achievements: ResumeEntry[];
  leadership: ResumeEntry[];
  languages: ResumeEntry[];
  publications: ResumeEntry[];
  additionalSections: ResumeAdditionalSection[];
  sectionOrder: ResumeSectionKey[];
};

const hasText = (value: string): boolean => Boolean(value?.trim());

function formatDate(raw: string, format: DateFormat): string {
  if (!raw) return '';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  if (format === 'year') return String(parsed.getFullYear());
  if (format === 'numeric') return `${String(parsed.getMonth() + 1).padStart(2, '0')}/${parsed.getFullYear()}`;
  return parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatDateRange(start: string, end: string, format: DateFormat): string {
  const left = formatDate(start, format);
  const right = formatDate(end, format);
  if (!left && !right) return '';
  return left ? `${left} – ${right || 'Present'}` : right;
}

function hasExperienceContent(entry: MasterProfileExperience): boolean {
  return [
    entry.employer, entry.title, entry.location, entry.startDate, entry.endDate,
    entry.sourceDetails, entry.leadershipScope,
    ...entry.responsibilities, ...entry.achievements, ...entry.results,
    ...entry.problemsSolved, ...entry.tools,
  ].some(hasText);
}

function mapExperience(entry: MasterProfileExperience, dateFormat: DateFormat): ResumeExperience {
  const sourceDetails = entry.responsibilities.map((responsibility, index) => supportedBullet(
    responsibility,
    entry.tools[index] ?? entry.tools[0] ?? '',
    entry.results[index] ?? entry.results[0] ?? '',
  ) ?? responsibility);
  const details = [
    ...sourceDetails,
    ...entry.achievements,
    ...entry.results,
    ...entry.problemsSolved,
    entry.leadershipScope,
    entry.sourceDetails,
    ...entry.tools,
  ].filter(hasText);
  return {
    employer: entry.employer,
    title: entry.title,
    dates: formatDateRange(entry.startDate, entry.endDate, dateFormat),
    location: entry.location,
    details: Array.from(new Set(details)),
  };
}

function mapEducation(entry: MasterProfileEducation, dateFormat: DateFormat): ResumeEducation {
  return {
    qualification: entry.qualification,
    institution: entry.institution,
    location: entry.location,
    dates: formatDateRange(entry.startDate, entry.endDate, dateFormat),
    details: [entry.subject, entry.result, entry.honours, ...entry.details].filter(hasText),
  };
}

function mapAchievement(entry: MasterProfileAchievement, dateFormat: DateFormat): ResumeEntry {
  return {
    title: entry.achievement,
    subtitle: entry.issuer,
    dates: formatDate(entry.date, dateFormat),
    details: [entry.result, ...entry.details].filter(hasText),
  };
}

function mapPublication(entry: MasterProfilePublication, dateFormat: DateFormat): ResumeEntry {
  return {
    title: entry.title,
    subtitle: entry.publicationOrEvent,
    dates: formatDate(entry.date, dateFormat),
    details: [entry.contribution, ...entry.details].filter(hasText),
  };
}

function mapLeadership(entry: MasterProfileLeadershipVolunteering): ResumeEntry {
  return {
    title: entry.role,
    subtitle: entry.organisation || (entry.kind === 'volunteering' ? 'Volunteering' : 'Leadership'),
    details: entry.contribution.filter(hasText),
  };
}

function mapAdditionalSections(profile: MasterProfile): ResumeAdditionalSection[] {
  const sections: ResumeAdditionalSection[] = [];
  const add = (title: string, entries: ResumeEntry[]) => {
    const useful = entries.filter((entry) => hasText(entry.title) || hasText(entry.subtitle ?? '') || entry.details.some(hasText));
    if (useful.length) sections.push({ title, entries: useful });
  };

  add('Professional Memberships', profile.memberships.map((entry) => ({
    title: entry.name,
    details: entry.details.filter(hasText),
  })));
  add('Professional Training', profile.additionalProfessionalInformation.training
    ? [{ title: profile.additionalProfessionalInformation.training, details: [] }]
    : []);
  add('Additional Professional Experience', profile.additionalProfessionalInformation.otherExperience
    ? [{ title: profile.additionalProfessionalInformation.otherExperience, details: [] }]
    : []);
  add('Additional Achievements', profile.additionalProfessionalInformation.additionalAchievements
    ? [{ title: profile.additionalProfessionalInformation.additionalAchievements, details: [] }]
    : []);
  return sections;
}

export function defaultResumeSettings(profile: MasterProfile): ResumeSettings {
  return {
    targetTitle: profile.professionalIdentity.targetRole || profile.professionalIdentity.alternativeRole,
    summary: profile.summary,
    length: '2',
    template: 'ats-classic',
    dateFormat: 'month-year',
    jobDescription: '',
    selectedSections: ['experience', 'skills', 'education', 'certifications', 'projects', 'achievements', 'leadership', 'languages', 'publications', 'additional'],
  };
}

/** Pure MasterProfile -> ResumeDocument projection. Never mutates profile. */
export function mapMasterProfileToResumeDocument(profile: MasterProfile, settings: ResumeSettings): ResumeDocument {
  const experience = profile.experience.filter(hasExperienceContent).map((entry) => mapExperience(entry, settings.dateFormat));
  const education = profile.education
    .filter((entry) => [entry.qualification, entry.subject, entry.institution, entry.location, entry.startDate, entry.endDate, entry.result, entry.honours, ...entry.details].some(hasText))
    .map((entry) => mapEducation(entry, settings.dateFormat));
  const certifications: ResumeEntry[] = profile.certifications
    .filter((entry) => [entry.name, entry.issuer, entry.obtainedDate, entry.expiryDate, entry.credentialNumber, entry.active, ...entry.details].some(hasText))
    .map((entry) => ({
      title: entry.name,
      subtitle: entry.issuer,
      dates: formatDateRange(entry.obtainedDate, entry.expiryDate, settings.dateFormat),
      details: [entry.credentialNumber, entry.active, ...entry.details].filter(hasText),
    }));

  const skillGroups: Array<[string, string[]]> = [
    ['Professional skills', profile.skills.professional],
    ['Technical skills', profile.skills.technical],
    ['Business & domain skills', profile.skills.businessAndDomain],
    ['Analytical skills', profile.skills.analytical],
    ['Communication & leadership', profile.skills.communicationAndLeadership],
    ['Tools & software', profile.skills.tools],
    ['Programming & systems', profile.skills.programmingAndSystems],
    ['Strongest skills', profile.skills.strongest],
    ['Skills being improved', profile.skills.improving],
  ];
  const skills: ResumeEntry[] = skillGroups
    .map(([title, values]) => ({ title, details: [values.filter(hasText).join(', ')].filter(hasText) }))
    .filter((entry) => entry.details.length > 0);

  const projects: ResumeEntry[] = profile.projects
    .filter((entry) => [entry.name, entry.purpose, entry.role, entry.result, entry.audience, entry.url, ...entry.contribution, ...entry.tools, ...entry.details].some(hasText))
    .map((entry) => ({
      title: entry.name,
      subtitle: [entry.role, entry.purpose].filter(hasText).join(' · '),
      details: [...entry.contribution, entry.result, entry.audience, ...entry.tools, ...entry.details].filter(hasText),
      url: entry.url || undefined,
    }));
  const achievements = profile.achievements
    .filter((entry) => [entry.achievement, entry.issuer, entry.date, entry.result, ...entry.details].some(hasText))
    .map((entry) => mapAchievement(entry, settings.dateFormat));
  const leadership = profile.leadershipVolunteering
    .filter((entry) => [entry.role, entry.organisation, ...entry.contribution].some(hasText))
    .map(mapLeadership);
  const languages: ResumeEntry[] = profile.languages
    .filter((entry) => [entry.language, entry.proficiency].some(hasText))
    .map((entry) => ({ title: entry.language, subtitle: entry.proficiency, details: [] }));
  const publications = profile.publications
    .filter((entry) => [entry.title, entry.publicationOrEvent, entry.date, entry.contribution, ...entry.details].some(hasText))
    .map((entry) => mapPublication(entry, settings.dateFormat));

  const additionalSections = mapAdditionalSections(profile);
  const experienced = experience.length > 0;

  const document: ResumeDocument = {
    header: {
      name: profile.contact.resumeName || profile.contact.fullName,
      targetTitle: settings.targetTitle || profile.professionalIdentity.targetRole || profile.professionalIdentity.alternativeRole,
      contact: [profile.contact.email, profile.contact.phone, profile.contact.location].filter(hasText),
      links: [profile.contact.linkedinUrl, profile.contact.portfolioUrl].filter(hasText),
    },
    summary: settings.summary || profile.summary || profile.professionalIdentity.headline,
    experience,
    skills,
    education,
    certifications,
    projects,
    achievements,
    leadership,
    languages,
    publications,
    additionalSections,
    sectionOrder: experienced
      ? ['experience', 'skills', 'education', 'certifications', 'projects', 'achievements', 'leadership', 'languages', 'publications', 'additional']
      : ['education', 'skills', 'projects', 'experience', 'certifications', 'achievements', 'leadership', 'languages', 'publications', 'additional'],
  };
  return optimizeResumeDocument(document, profile, settings);
}

const sectionTitles: Record<ResumeSectionKey, string> = {
  experience: 'Professional Experience',
  skills: 'Skills',
  education: 'Education',
  certifications: 'Certifications & Qualifications',
  projects: 'Projects',
  achievements: 'Achievements & Awards',
  leadership: 'Leadership & Volunteering',
  languages: 'Languages',
  publications: 'Publications & Research',
  additional: 'Additional',
};

export const resumeSectionOptions: Array<{ key: ResumeSectionKey; label: string }> = ([
  'experience',
  'skills',
  'education',
  'certifications',
  'projects',
  'achievements',
  'leadership',
  'languages',
  'publications',
  'additional',
] as ResumeSectionKey[]).map((key) => ({ key, label: sectionTitles[key] }));

export function resumeSections(doc: ResumeDocument, mode: 'resume' | 'cv', length: ResumeLength): ResumeSection[] {
  const includeExtended = mode === 'cv' || length === 'full';
  const extended = new Set<ResumeSectionKey>(['leadership', 'languages', 'publications', 'additional']);
  const sections: ResumeSection[] = [];
  for (const key of doc.sectionOrder) {
    if (!includeExtended && extended.has(key)) continue;
    if (key === 'additional') {
      for (const section of doc.additionalSections) {
        if (section.entries.length) sections.push({ key, title: section.title, entries: section.entries });
      }
      continue;
    }
    const entries = doc[key] as ResumeSectionEntry[];
    if (entries.length) sections.push({ key, title: sectionTitles[key], entries });
  }
  // Length is handled by the optimisation/content-selection layer at entry level.
  // Formatting only decides which selected sections are renderable in the chosen mode.
  return sections;
}

export function resumeEntryDisplayValues(entry: ResumeSectionEntry): string[] {
  if ('employer' in entry) {
    return [entry.employer, entry.title, entry.dates, ...entry.details].filter(Boolean);
  }
  if ('qualification' in entry) {
    return [entry.qualification, entry.institution, entry.location, entry.dates, ...entry.details].filter(Boolean);
  }
  return [entry.title, entry.subtitle ?? '', entry.dates ?? '', ...entry.details].filter(Boolean);
}
