import { QUESTION_SEMANTIC_MAPPINGS } from './masterProfile';

/**
 * MASTER QUESTIONNAIRE
 * --------------------
 * Single source of truth for questionnaire content and questionnaire rules.
 *
 * IMPORTANT:
 * - Keep this file at the SAME PATH as the existing questionnaire.ts.
 * - It preserves the existing exports used by App.tsx:
 *      questionnaire
 *      categories
 *      roleQuestionnaires
 *      categoriesForRole
 * - It continues to use QUESTION_SEMANTIC_MAPPINGS from ./masterProfile so
 *   existing Master Profile question IDs/semantic fields remain connected.
 * - Do NOT put React components, routes, API calls, AI calls, or resume
 *   rendering in this file. The existing application architecture owns those.
 *
 * FLOW:
 * Career category -> Create/Upload -> Template -> Questionnaire -> Master Profile
 *
 * AI is intentionally a later layer. This file only declares where AI
 * assistance is allowed and what the UI should ask.
 */

export type QuestionnaireQuestion = {
  id: number;
  category: string;
  question: string;

  /** Stable semantic field from Master Profile, when available. */
  semanticField?: string;

  /** UI/input hints. */
  inputType?: QuestionnaireInputType;
  required?: boolean;
  optional?: boolean;
  repeatable?: boolean;
  aiSuggest?: boolean;
  autocomplete?: boolean;
  autocompleteSource?: string;
  allowSkip?: boolean;
  allowNoData?: boolean;
  helpText?: string;
  placeholder?: string;
  options?: string[];

  /** Used by the completion/progress UI. */
  completionGroup?: string;
  importance?: 'required' | 'recommended' | 'optional';
};

export type QuestionnaireInputType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'date'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'tags'
  | 'checkbox';

export type QuestionnaireCategory = {
  name: string;
  questions: QuestionnaireQuestion[];
  id?: string;
  description?: string;
  repeatable?: boolean;
  allowSkip?: boolean;
  allowNoData?: boolean;
  priority?: 'high' | 'medium' | 'low';
};

export type CareerCategoryId =
  | 'students-interns'
  | 'freshers-entry-level'
  | 'experienced-professionals'
  | 'career-switchers-returners'
  | 'freelance-contract';

export const CAREER_CATEGORY_IDS: CareerCategoryId[] = [
  'students-interns',
  'freshers-entry-level',
  'experienced-professionals',
  'career-switchers-returners',
  'freelance-contract',
];

export const careerCategoryLabels: Record<CareerCategoryId, string> = {
  'students-interns': 'Students & Interns',
  'freshers-entry-level': 'Freshers & Entry-Level',
  'experienced-professionals': 'Experienced Professionals',
  'career-switchers-returners': 'Career Switchers & Returners',
  'freelance-contract': 'Freelance & Contract',
};

const categoryLabels: Record<string, string> = {
  contact: 'Contact details',
  professionalIdentity: 'Professional identity',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  achievements: 'Achievements',
  certifications: 'Certifications',
  languages: 'Languages',
  summary: 'Professional summary',
  jobPreferences: 'Job preferences',
  locationPreferences: 'Location preferences',
  availability: 'Availability',
  workAuthorization: 'Work authorization',
  applicationInformation: 'Application information',
  automationInformation: 'Application automation',
  applicationOnlyInformation: 'Additional application information',
  additionalProfessionalInformation: 'Additional professional information',
  leadership: 'Leadership',
  volunteering: 'Volunteering',
  publications: 'Publications',
};

const categoryDescriptions: Record<string, string> = {
  contact: 'The essential information employers need to contact you.',
  professionalIdentity: 'Your target role and professional identity.',
  experience: 'Professional, internship, contract, freelance, or relevant work.',
  education: 'Degrees, qualifications, school, university, and academic details.',
  skills: 'Skills, tools, technologies, and languages you genuinely have.',
  projects: 'Projects that demonstrate relevant ability or results.',
  achievements: 'Awards, recognition, competitions, scholarships, and achievements.',
  certifications: 'Professional certifications and credentials.',
  languages: 'Languages and proficiency.',
  summary: 'A concise introduction tailored to the target role.',
  jobPreferences: 'What you want in your next role.',
  locationPreferences: 'Preferred working locations and work arrangements.',
  availability: 'When you can start or your current availability.',
  workAuthorization: 'Relevant work authorization information.',
  leadership: 'Leadership responsibilities and outcomes.',
  volunteering: 'Volunteer work and community involvement.',
  publications: 'Publications, papers, articles, or research outputs.',
};

function humanize(field: string): string {
  return field
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\[\]/g, '')
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase());
}

function semanticSection(semanticField: string): string {
  return semanticField.split('.')[0];
}

function semanticLeaf(semanticField: string): string {
  const parts = semanticField.split('.');
  return parts[parts.length - 1];
}

/**
 * Better user-facing wording for the common fields.
 * Unknown fields safely fall back to a readable question.
 */
const questionText: Record<string, string> = {
  'contact.fullName': 'What is your full name?',
  'contact.email': 'What is your email address?',
  'contact.phone': 'What is your phone number?',
  'contact.location': 'Where are you currently based?',
  'contact.linkedin': 'What is your LinkedIn profile URL?',
  'contact.portfolio': 'What is your portfolio or personal website URL?',
  'contact.github': 'What is your GitHub or code repository URL?',

  'professionalIdentity.targetRole': 'What job or internship role are you applying for?',
  'professionalIdentity.professionalTitle': 'What professional title should appear on your resume?',

  'summary.professionalSummary': 'Tell us briefly about yourself and what you bring to your target role.',
  'summary.careerGoal': 'What are you looking to achieve in your next role?',

  'experience.jobTitle': 'What was your job title or role?',
  'experience.company': 'What was the company or organization?',
  'experience.location': 'Where was this role based?',
  'experience.startDate': 'When did you start this role?',
  'experience.endDate': 'When did this role end?',
  'experience.responsibilities': 'What did you do in this role?',
  'experience.achievements': 'What were your biggest achievements or results?',
  'experience.toolsUsed': 'What tools, technologies, or methods did you use?',

  'education.qualification': 'What degree or qualification did you complete or are you pursuing?',
  'education.institution': 'Which school, college, or university?',
  'education.fieldOfStudy': 'What was your field of study?',
  'education.startDate': 'When did you start?',
  'education.endDate': 'When did you graduate or finish?',
  'education.grade': 'What was your GPA, percentage, or grade?',

  'skills.skills': 'What skills do you have?',
  'skills.technicalSkills': 'What technical skills do you have?',
  'skills.toolsSoftware': 'Which tools or software do you know?',
  'skills.languages': 'Which languages do you speak?',

  'projects.projectName': 'What is the project name?',
  'projects.description': 'What did you build or do?',
  'projects.technologies': 'What technologies or tools did you use?',
  'projects.outcome': 'What was the result or impact?',
  'projects.projectUrl': 'Do you have a link to this project?',

  'certifications.name': 'What is the certification name?',
  'certifications.issuer': 'Which organization issued it?',
  'certifications.issueDate': 'When did you receive it?',
  'certifications.expiryDate': 'When does it expire?',
  'certifications.credentialId': 'What is the credential ID?',
  'certifications.credentialUrl': 'What is the credential URL?',

  'achievements.title': 'What is the achievement or award?',
  'achievements.organization': 'Which organization gave it?',
  'achievements.date': 'When did you receive it?',
  'achievements.description': 'What did you achieve?',

  'jobPreferences.preferredRole': 'What type of role are you looking for?',
  'jobPreferences.employmentType': 'What employment type do you prefer?',
  'locationPreferences.preferredLocation': 'Where would you like to work?',
  'locationPreferences.workMode': 'What work arrangement do you prefer?',
  'availability.startDate': 'When are you available to start?',
  'workAuthorization.status': 'What is your work authorization status?',
};

function defaultQuestion(semanticField: string): string {
  const known = questionText[semanticField];
  if (known) return known;

  const readable = humanize(semanticLeaf(semanticField));
  return `Please provide your ${readable.toLowerCase()}.`;
}

const repeatableSections = new Set([
  'experience',
  'education',
  'projects',
  'certifications',
  'achievements',
  'leadership',
  'volunteering',
  'publications',
]);

const recommendedSections = new Set([
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'achievements',
]);

const requiredFields = new Set([
  'contact.fullName',
  'contact.email',
  'contact.phone',
  'contact.location',
  'professionalIdentity.targetRole',
  'education.qualification',
  'education.institution',
  'skills.skills',
]);

/**
 * Some users have no experience/projects/certifications/achievements.
 * These sections can be explicitly resolved with "I don't have this"
 * rather than blocking the user.
 */
export const resolvableEmptySections = [
  'experience',
  'projects',
  'certifications',
  'achievements',
  'leadership',
  'volunteering',
  'publications',
];

export const completionRules = {
  contact: {
    required: [
      'contact.fullName',
      'professionalIdentity.targetRole',
      'contact.email',
      'contact.phone',
      'contact.location',
    ],
    allowSkip: false,
  },
  summary: {
    required: [],
    allowSkip: true,
    aiSuggest: true,
  },
  experience: {
    required: [],
    allowSkip: true,
    allowNoData: true,
    noDataLabel: "I don't have work experience",
    repeatable: true,
  },
  education: {
    required: ['education.qualification', 'education.institution'],
    allowSkip: false,
    repeatable: true,
  },
  skills: {
    required: ['skills.skills'],
    allowSkip: false,
    aiSuggest: true,
  },
  projects: {
    required: [],
    allowSkip: true,
    allowNoData: true,
    noDataLabel: "I don't have projects to add",
    repeatable: true,
  },
  certifications: {
    required: [],
    allowSkip: true,
    allowNoData: true,
    noDataLabel: "I don't have certifications",
    repeatable: true,
  },
  achievements: {
    required: [],
    allowSkip: true,
    allowNoData: true,
    noDataLabel: "I don't have achievements to add",
    repeatable: true,
  },
};

export const questionnaireUI = {
  continueLabel: 'Continue',
  backLabel: 'Back',
  saveLabel: 'Save & Continue',
  addAnotherLabel: 'Add another',
  removeLabel: 'Remove',
  skipLabel: 'Skip for now',
  noDataLabel: "I don't have this",
  reviewLabel: 'Review Resume',
  completeLabel: 'Build My Resume',
  recommendedLabel: 'Recommended',
  aiSuggestionLabel: 'AI Suggestion',
  useSuggestionLabel: 'Use suggestion',
  editSuggestionLabel: 'Edit',
  writeMyselfLabel: "I'll write it myself",
};

/**
 * Target-role autocomplete is intentionally a contract rather than a huge
 * hard-coded job list. The UI should query the project's job-role taxonomy
 * (or later an API) as the user types and still allow a custom role.
 */
export const targetRoleAutocomplete = {
  enabled: true,
  source: 'job_role_taxonomy',
  minimumCharacters: 2,
  showAsUserTypes: true,
  allowCustomRole: true,
  customRoleLabel: 'Use this role',
  debounceMs: 150,
};

/**
 * Convert the existing Master Profile semantic mapping into the same
 * question shape the current application already expects.
 *
 * This is the key compatibility layer: existing question IDs and semantic
 * fields are retained instead of replacing them with unrelated IDs.
 */
function buildQuestion(item: (typeof QUESTION_SEMANTIC_MAPPINGS)[number]): QuestionnaireQuestion {
  const section = semanticSection(item.semanticField);
  const importance =
    requiredFields.has(item.semanticField)
      ? 'required'
      : recommendedSections.has(section)
        ? 'recommended'
        : 'optional';

  const question: QuestionnaireQuestion = {
    id: item.questionId,
    category: categoryLabels[section] ?? humanize(section),
    question: defaultQuestion(item.semanticField),
    semanticField: item.semanticField,
    inputType: 'text',
    required: importance === 'required',
    optional: importance !== 'required',
    repeatable: repeatableSections.has(section),
    aiSuggest:
      section === 'summary' ||
      section === 'skills' ||
      section === 'experience' ||
      section === 'projects' ||
      section === 'achievements',
    allowSkip: importance !== 'required',
    allowNoData: resolvableEmptySections.includes(section),
    completionGroup: section,
    importance,
  };

  if (item.semanticField === 'professionalIdentity.targetRole') {
    question.inputType = 'text';
    question.autocomplete = true;
    question.autocompleteSource = targetRoleAutocomplete.source;
    question.required = true;
    question.optional = false;
    question.helpText =
      'Start typing the job or internship you are applying for. Choose a suggestion or use your own role.';
    question.placeholder = 'e.g. Software Engineer, Data Analyst, Marketing Intern';
  }

  if (section === 'contact') {
    if (item.semanticField.toLowerCase().includes('email')) question.inputType = 'email';
    if (item.semanticField.toLowerCase().includes('phone')) question.inputType = 'phone';
    if (item.semanticField.toLowerCase().includes('url')) question.inputType = 'url';
  }

  if (
    /summary|description|responsibilities|achievements|careerGoal|coursework/i.test(
      item.semanticField,
    )
  ) {
    question.inputType = 'textarea';
  }

  if (/date/i.test(item.semanticField)) {
    question.inputType = 'date';
  }

  return question;
}

/**
 * Existing flat questionnaire export.
 * Keep this export because the current app already consumes it.
 */
export const questionnaire: QuestionnaireQuestion[] = QUESTION_SEMANTIC_MAPPINGS.map(
  buildQuestion,
);

/**
 * Group the same Master Profile questions into user-facing sections.
 */
function buildCategories(): QuestionnaireCategory[] {
  const grouped = new Map<string, QuestionnaireQuestion[]>();

  for (const question of questionnaire) {
    const existing = grouped.get(question.category) ?? [];
    existing.push(question);
    grouped.set(question.category, existing);
  }

  return Array.from(grouped.entries()).map(([name, questions]) => {
    const section = Object.entries(categoryLabels).find(([, label]) => label === name)?.[0] ?? '';

    return {
      id: section,
      name,
      description: categoryDescriptions[section] ?? '',
      questions,
      repeatable: repeatableSections.has(section),
      allowSkip: !requiredSections.has(section),
      allowNoData: resolvableEmptySections.includes(section),
      priority: requiredSections.has(section)
        ? 'high'
        : recommendedSections.has(section)
          ? 'medium'
          : 'low',
    };
  });
}

const requiredSections = new Set(['contact', 'professionalIdentity', 'education', 'skills']);

export const categories: QuestionnaireCategory[] = buildCategories();

/**
 * Category order shown to the user.
 *
 * The exact fields still come from Master Profile. This order controls the
 * guided experience without changing the underlying profile architecture.
 */
export const sectionOrderByCareerCategory: Record<CareerCategoryId, string[]> = {
  'students-interns': [
    'Contact details',
    'Professional identity',
    'Professional summary',
    'Education',
    'Experience',
    'Projects',
    'Skills',
    'Certifications',
    'Achievements',
    'Languages',
    'Additional professional information',
  ],
  'freshers-entry-level': [
    'Contact details',
    'Professional identity',
    'Professional summary',
    'Education',
    'Experience',
    'Projects',
    'Skills',
    'Certifications',
    'Achievements',
    'Languages',
    'Additional professional information',
  ],
  'experienced-professionals': [
    'Contact details',
    'Professional identity',
    'Professional summary',
    'Experience',
    'Skills',
    'Education',
    'Certifications',
    'Projects',
    'Achievements',
    'Leadership',
    'Languages',
    'Additional professional information',
  ],
  'career-switchers-returners': [
    'Contact details',
    'Professional identity',
    'Professional summary',
    'Skills',
    'Experience',
    'Projects',
    'Education',
    'Certifications',
    'Achievements',
    'Languages',
    'Additional professional information',
  ],
  'freelance-contract': [
    'Contact details',
    'Professional identity',
    'Professional summary',
    'Experience',
    'Projects',
    'Skills',
    'Education',
    'Certifications',
    'Achievements',
    'Languages',
    'Additional professional information',
  ],
};

export const categoryPriorities: Record<
  CareerCategoryId,
  {
    prioritySections: string[];
    recommendedSections: string[];
  }
> = {
  'students-interns': {
    prioritySections: ['Education', 'Projects', 'Skills', 'Experience'],
    recommendedSections: ['Projects', 'Certifications', 'Achievements'],
  },
  'freshers-entry-level': {
    prioritySections: ['Education', 'Projects', 'Skills', 'Experience'],
    recommendedSections: ['Projects', 'Certifications', 'Achievements'],
  },
  'experienced-professionals': {
    prioritySections: ['Professional summary', 'Experience', 'Skills', 'Achievements'],
    recommendedSections: ['Certifications', 'Projects', 'Leadership'],
  },
  'career-switchers-returners': {
    prioritySections: ['Professional summary', 'Skills', 'Experience', 'Projects'],
    recommendedSections: ['Projects', 'Certifications', 'Achievements'],
  },
  'freelance-contract': {
    prioritySections: ['Professional summary', 'Experience', 'Projects', 'Skills'],
    recommendedSections: ['Projects', 'Certifications', 'Achievements'],
  },
};

/**
 * Each career category uses the SAME Master Profile question definitions.
 * Only the order/priorities differ.
 *
 * This prevents duplicate data structures and keeps the project architecture
 * stable. The UI can reorder `categories` using sectionOrderByCareerCategory.
 */
export const roleQuestionnaires: Record<CareerCategoryId, QuestionnaireCategory[]> = {
  'students-interns': categories,
  'freshers-entry-level': categories,
  'experienced-professionals': categories,
  'career-switchers-returners': categories,
  'freelance-contract': categories,
};

/**
 * Existing App.tsx compatibility function.
 */
export function categoriesForRole(
  roleId: string | null | undefined,
): QuestionnaireCategory[] {
  if (roleId && roleQuestionnaires[roleId as CareerCategoryId]) {
    return orderedCategoriesForRole(roleId);
  }
  return categories;
}

/**
 * New helper for guided ordering. Returns categories in the priority
 * order defined for each career category.
 */
export function orderedCategoriesForRole(
  roleId: string | null | undefined,
): QuestionnaireCategory[] {
  const normalized =
    roleId && roleQuestionnaires[roleId as CareerCategoryId]
      ? (roleId as CareerCategoryId)
      : 'students-interns';

  const order = sectionOrderByCareerCategory[normalized];
  const byName = new Map(categories.map((category) => [category.name, category]));

  return order
    .map((name) => byName.get(name))
    .filter((category): category is QuestionnaireCategory => Boolean(category));
}

/**
 * Backward-compatible helper used by App.tsx to know where the
 * "resume complete" checkpoint sits. All categories from this questionnaire
 * are resume categories (no separate job-search section in v2).
 */
export function resumeCategoryCount(roleId: string | null | undefined): number {
  return categoriesForRole(roleId).length;
}

/**
 * Helpers for the progress/completion UI.
 */
export function isRequiredQuestion(question: QuestionnaireQuestion): boolean {
  return question.importance === 'required' || question.required === true;
}

export function isRepeatableQuestion(question: QuestionnaireQuestion): boolean {
  return question.repeatable === true;
}

export function canResolveWithoutData(categoryName: string): boolean {
  const section = Object.entries(categoryLabels).find(([, label]) => label === categoryName)?.[0];
  return section ? resolvableEmptySections.includes(section) : false;
}

/**
 * AI INTEGRATION CONTRACT
 * -----------------------
 * This file does not call an AI service.
 *
 * After targetRole is selected, the future AI layer can use:
 *   targetRole + careerCategory + confirmed Master Profile data
 *
 * It may:
 *   - draft a summary from verified facts
 *   - suggest relevant skills for the selected role
 *   - improve wording of real experience/projects/achievements
 *   - identify relevant sections
 *   - identify missing information
 *
 * It must NOT:
 *   - invent experience
 *   - invent education or qualifications
 *   - invent certifications
 *   - invent projects
 *   - invent achievements
 *   - silently add skills the user did not confirm
 *
 * All AI suggestions should require user confirmation before becoming
 * Master Profile data.
 */
export const AI_QUESTIONNAIRE_RULES = {
  enabledByDefault: false,
  activateAfterTargetRole: true,
  requireUserConfirmation: true,
  neverInventFacts: true,
  suggestionTypes: [
    'professional-summary',
    'relevant-skills',
    'experience-wording',
    'project-wording',
    'achievement-wording',
    'relevant-section-priority',
  ],
};

/**
 * Final completion contract.
 *
 * A user should not be able to build the final resume until all required
 * information is present and optional/resolvable sections have either been
 * completed, skipped, or explicitly resolved as "I don't have this".
 */
export const resumeCompletionRules = {
  requiredSections: [
    'Contact details',
    'Professional identity',
    'Education',
    'Skills',
  ],
  resolvableSections: [
    'Experience',
    'Projects',
    'Certifications',
    'Achievements',
    'Leadership',
    'Volunteering',
    'Publications',
  ],
  optionalSections: [
    'Languages',
    'Additional professional information',
    'Job preferences',
    'Location preferences',
    'Availability',
    'Work authorization',
  ],
  requireTargetRole: true,
  requireUserReviewBeforeBuild: true,
};

export const QUESTIONNAIRE_VERSION = '2.0.0';
