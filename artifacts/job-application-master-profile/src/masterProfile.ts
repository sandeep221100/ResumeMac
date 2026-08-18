/**
 * The questionnaire remains a user-facing input format. This file is the
 * normalized data layer between those answers and every resume consumer.
 *
 * Raw answers intentionally stay keyed by questionnaire id so existing
 * localStorage data and CSV exports remain compatible.
 */

export type MasterProfileAnswerMap = Record<number, string>;

export type QuestionSemanticMapping = {
  questionId: number;
  semanticField: string;
  masterProfileField: string;
};

type MappingDefinition = readonly [number[], string, string];

const mapping = (...definitions: MappingDefinition[]): QuestionSemanticMapping[] =>
  definitions.flatMap(([questionIds, semanticField, masterProfileField]) =>
    questionIds.map((questionId) => ({ questionId, semanticField, masterProfileField })),
  );

/**
 * The explicit mapping registry documents the contract:
 * questionnaire question -> stable semantic meaning -> normalized profile path.
 *
 * A few questions are gates rather than resume content. They still have a
 * mapping so their meaning is not lost when the questionnaire evolves.
 */
export const QUESTION_SEMANTIC_MAPPINGS: QuestionSemanticMapping[] = mapping(
  [[1], 'contact.fullName', 'contact.fullName'],
  [[2], 'contact.resumeName', 'contact.resumeName'],
  [[3], 'contact.email', 'contact.email'],
  [[4], 'contact.phone', 'contact.phone'],
  [[5], 'contact.location', 'contact.location'],
  [[6], 'contact.linkedinUrl', 'contact.linkedinUrl'],
  [[7], 'contact.portfolioUrl', 'contact.portfolioUrl'],
  [[8], 'professionalIdentity.targetRole', 'professionalIdentity.targetRole'],
  [[9], 'professionalIdentity.alternativeRole', 'professionalIdentity.alternativeRole'],
  [[10], 'professionalIdentity.headline', 'professionalIdentity.headline'],
  [[11], 'experience.current.exists', 'experience[]'],
  [[12], 'experience.current.title', 'experience[].title'],
  [[13], 'experience.current.employer', 'experience[].employer'],
  [[14], 'experience.current.location', 'experience[].location'],
  [[15], 'experience.current.startDate', 'experience[].startDate'],
  [[16], 'experience.current.endDate', 'experience[].endDate'],
  [[17], 'experience.current.responsibilities', 'experience[].responsibilities[]'],
  [[18], 'experience.current.achievements', 'experience[].achievements[]'],
  [[19], 'experience.current.results', 'experience[].results[]'],
  [[20], 'experience.current.tools', 'experience[].tools[]'],
  [[21], 'experience.previous.exists', 'experience[]'],
  [[22], 'experience.previous.employer', 'experience[].employer'],
  [[23], 'experience.previous.title', 'experience[].title'],
  [[24], 'experience.previous.location', 'experience[].location'],
  [[25], 'experience.previous.period', 'experience[].sourceDetails'],
  [[26], 'experience.previous.responsibilities', 'experience[].responsibilities[]'],
  [[27], 'experience.previous.achievements', 'experience[].achievements[]'],
  [[28], 'experience.previous.results', 'experience[].results[]'],
  [[29], 'experience.previous.tools', 'experience[].tools[]'],
  [[30], 'experience.additional.exists', 'experience[]'],
  [[31], 'education.primary.qualification', 'education[].qualification'],
  [[32], 'education.primary.subject', 'education[].subject'],
  [[33], 'education.primary.institution', 'education[].institution'],
  [[34], 'education.primary.location', 'education[].location'],
  [[35], 'education.primary.startDate', 'education[].startDate'],
  [[36], 'education.primary.endDate', 'education[].endDate'],
  [[37], 'education.primary.result', 'education[].result'],
  [[38], 'education.primary.honours', 'education[].honours'],
  [[39], 'education.additional.exists', 'education[]'],
  [[40], 'education.additional.details', 'education[].details[]'],
  [[41], 'skills.professional', 'skills.professional[]'],
  [[42], 'skills.tools', 'skills.tools[]'],
  [[43], 'projects.featured.exists', 'projects[]'],
  [[44], 'projects.featured.nameAndPurpose', 'projects[].name'],
  [[45], 'projects.featured.contribution', 'projects[].contribution[]'],
  [[46], 'projects.featured.tools', 'projects[].tools[]'],
  [[47], 'projects.featured.result', 'projects[].result'],
  [[48], 'projects.additional.exists', 'projects[]'],
  [[49], 'achievements.featured.exists', 'achievements[]'],
  [[50], 'achievements.featured.details', 'achievements[].achievement'],
  [[51], 'summary.professional', 'summary'],
  [[52], 'professionalIdentity.strongestWork', 'professionalIdentity.strongestWork'],
  [[53], 'professionalIdentity.qualities', 'professionalIdentity.qualities[]'],
  [[54], 'professionalIdentity.nextRole', 'professionalIdentity.nextRole'],
  [[55], 'professionalIdentity.industries', 'professionalIdentity.industries'],
  [[56], 'professionalIdentity.preferredProblems', 'professionalIdentity.preferredProblems'],
  [[57], 'professionalIdentity.differentiator', 'professionalIdentity.differentiator'],
  [[58], 'professionalIdentity.valueCreated', 'professionalIdentity.valueCreated'],
  [[59], 'professionalIdentity.careerDirection', 'professionalIdentity.careerDirection'],
  [[60], 'professionalIdentity.employerTakeaway', 'professionalIdentity.employerTakeaway'],
  [[61], 'experience.additional.exists', 'experience[]'],
  [[62], 'experience.additional.sourceDetails', 'experience[].sourceDetails'],
  [[63], 'experience.additional.responsibilities', 'experience[].responsibilities[]'],
  [[64], 'experience.additional.achievements', 'experience[].achievements[]'],
  [[65], 'experience.additional.results', 'experience[].results[]'],
  [[66], 'experience.additional.problemsSolved', 'experience[].problemsSolved[]'],
  [[67], 'experience.additional.leadershipScope', 'experience[].leadershipScope'],
  [[68], 'experience.additional.tools', 'experience[].tools[]'],
  [[69], 'experience.additional.departureContext', 'experience[].departureContext'],
  [[70], 'additionalProfessionalInformation.otherExperience', 'additionalProfessionalInformation.otherExperience'],
  [[71], 'certifications.primary.exists', 'certifications[]'],
  [[72], 'certifications.primary.name', 'certifications[].name'],
  [[73], 'certifications.primary.issuer', 'certifications[].issuer'],
  [[74], 'certifications.primary.obtainedDate', 'certifications[].obtainedDate'],
  [[75], 'certifications.primary.expiryDate', 'certifications[].expiryDate'],
  [[76], 'certifications.primary.credentialNumber', 'certifications[].credentialNumber'],
  [[77], 'certifications.primary.active', 'certifications[].active'],
  [[78], 'additionalProfessionalInformation.training', 'additionalProfessionalInformation.training'],
  [[79], 'certifications.additional.exists', 'certifications[]'],
  [[80], 'certifications.primary.relevance', 'certifications[].details[]'],
  [[81], 'skills.technical', 'skills.technical[]'],
  [[82], 'skills.businessAndDomain', 'skills.businessAndDomain[]'],
  [[83], 'skills.analytical', 'skills.analytical[]'],
  [[84], 'skills.communicationAndLeadership', 'skills.communicationAndLeadership[]'],
  [[85], 'skills.toolsAndProficiency', 'skills.tools[]'],
  [[86], 'skills.programmingAndSystems', 'skills.programmingAndSystems[]'],
  [[87], 'languages.language', 'languages[].language'],
  [[88], 'languages.proficiency', 'languages[].proficiency'],
  [[89], 'skills.strongest', 'skills.strongest[]'],
  [[90], 'skills.improving', 'skills.improving[]'],
  [[91], 'projects.additional.exists', 'projects[]'],
  [[92], 'projects.additional.name', 'projects[].name'],
  [[93], 'projects.additional.purpose', 'projects[].purpose'],
  [[94], 'projects.additional.role', 'projects[].role'],
  [[95], 'projects.additional.contribution', 'projects[].contribution[]'],
  [[96], 'projects.additional.tools', 'projects[].tools[]'],
  [[97], 'projects.additional.result', 'projects[].result'],
  [[98], 'projects.additional.audience', 'projects[].audience'],
  [[99], 'projects.additional.url', 'projects[].url'],
  [[100], 'projects.additional.relevance', 'projects[].details[]'],
  [[101], 'achievements.additional.exists', 'achievements[]'],
  [[102], 'achievements.additional.achievement', 'achievements[].achievement'],
  [[103], 'achievements.additional.issuerAndDate', 'achievements[].issuer'],
  [[104], 'achievements.additional.result', 'achievements[].result'],
  [[105], 'publications.exists', 'publications[]'],
  [[106], 'publications.details', 'publications[].title'],
  [[107], 'leadership.exists', 'leadershipVolunteering[]'],
  [[108], 'leadership.details', 'leadershipVolunteering[].role'],
  [[109], 'volunteering.exists', 'leadershipVolunteering[]'],
  [[110], 'additionalProfessionalInformation.additionalAchievements', 'additionalProfessionalInformation.additionalAchievements'],
  [[111], 'jobPreferences.titles', 'nonResume.jobPreferences.titles'],
  [[112], 'jobPreferences.alternativeTitles', 'nonResume.jobPreferences.alternativeTitles'],
  [[113], 'jobPreferences.industries', 'nonResume.jobPreferences.industries'],
  [[114], 'jobPreferences.priorityCompanies', 'nonResume.jobPreferences.priorityCompanies'],
  [[115], 'jobPreferences.avoidedCompaniesOrRoles', 'nonResume.jobPreferences.avoidedCompaniesOrRoles'],
  [[116], 'locationPreferences.locations', 'nonResume.locationPreferences.locations'],
  [[117], 'locationPreferences.relocate', 'nonResume.locationPreferences.relocate'],
  [[118], 'locationPreferences.workArrangement', 'nonResume.locationPreferences.workArrangement'],
  [[119], 'jobPreferences.employmentTypes', 'nonResume.jobPreferences.employmentTypes'],
  [[120], 'salaryPreferences.minimum', 'nonResume.salaryPreferences.minimum'],
  [[121], 'availability.startDate', 'nonResume.availability.startDate'],
  [[122], 'availability.noticePeriod', 'nonResume.availability.noticePeriod'],
  [[123], 'workAuthorization.countries', 'nonResume.workAuthorization.countries'],
  [[124], 'workAuthorization.sponsorship', 'nonResume.workAuthorization.sponsorship'],
  [[125], 'workAuthorization.status', 'nonResume.workAuthorization.status'],
  [[126], 'workAuthorization.expiry', 'nonResume.workAuthorization.expiry'],
  [[127], 'availability.travel', 'nonResume.availability.travel'],
  [[128], 'workAuthorization.restrictions', 'nonResume.workAuthorization.restrictions'],
  [[129], 'workAuthorization.verification', 'nonResume.workAuthorization.verification'],
  [[130], 'availability.additional', 'nonResume.availability.additional'],
  [[131], 'applicationInformation.hasResume', 'nonResume.applicationInformation.hasResume'],
  [[132], 'applicationInformation.hasCoverLetter', 'nonResume.applicationInformation.hasCoverLetter'],
  [[133], 'applicationInformation.hasPortfolio', 'nonResume.applicationInformation.hasPortfolio'],
  [[134], 'applicationInformation.hasReferences', 'nonResume.applicationInformation.hasReferences'],
  [[135], 'applicationInformation.preferredReference', 'nonResume.applicationInformation.preferredReference'],
  [[136], 'applicationInformation.referenceCompany', 'nonResume.applicationInformation.referenceCompany'],
  [[137], 'applicationInformation.referenceContact', 'nonResume.applicationInformation.referenceContact'],
  [[138], 'applicationInformation.opportunitySource', 'nonResume.applicationInformation.opportunitySource'],
  [[139], 'applicationInformation.standardSummary', 'nonResume.applicationInformation.standardSummary'],
  [[140], 'applicationInformation.standardTellMeAboutYourself', 'nonResume.applicationInformation.standardTellMeAboutYourself'],
  [[141], 'automationInformation.titles', 'nonResume.automationInformation.titles'],
  [[142], 'automationInformation.alternativeTitles', 'nonResume.automationInformation.alternativeTitles'],
  [[143], 'automationInformation.priorityCompanies', 'nonResume.automationInformation.priorityCompanies'],
  [[144], 'automationInformation.avoidedCompaniesOrIndustries', 'nonResume.automationInformation.avoidedCompaniesOrIndustries'],
  [[145], 'automationInformation.locations', 'nonResume.automationInformation.locations'],
  [[146], 'automationInformation.minimumSalary', 'nonResume.automationInformation.minimumSalary'],
  [[147], 'automationInformation.employmentTypesAndArrangements', 'nonResume.automationInformation.employmentTypesAndArrangements'],
  [[148], 'automationInformation.experienceYears', 'nonResume.automationInformation.experienceYears'],
  [[149], 'automationInformation.whyInterested', 'nonResume.automationInformation.whyInterested'],
  [[150], 'automationInformation.whyHire', 'nonResume.automationInformation.whyHire'],
  [[151], 'applicationOnlyInformation.dateOfBirth', 'nonResume.applicationOnlyInformation.dateOfBirth'],
  [[152], 'applicationOnlyInformation.nationality', 'nonResume.applicationOnlyInformation.nationality'],
  [[153], 'applicationOnlyInformation.workAuthorizationDocument', 'nonResume.applicationOnlyInformation.workAuthorizationDocument'],
  [[154], 'applicationOnlyInformation.previouslyWorkedForCompany', 'nonResume.applicationOnlyInformation.previouslyWorkedForCompany'],
  [[155], 'applicationOnlyInformation.previouslyApplied', 'nonResume.applicationOnlyInformation.previouslyApplied'],
  [[156], 'applicationOnlyInformation.employmentRestriction', 'nonResume.applicationOnlyInformation.employmentRestriction'],
  [[157], 'applicationOnlyInformation.interviewAccommodation', 'nonResume.applicationOnlyInformation.interviewAccommodation'],
  [[158], 'applicationOnlyInformation.workplaceAccommodation', 'nonResume.applicationOnlyInformation.workplaceAccommodation'],
  [[159], 'applicationOnlyInformation.other', 'nonResume.applicationOnlyInformation.other'],
  [[160], 'applicationOnlyInformation.confirmation', 'nonResume.applicationOnlyInformation.confirmation'],
);

const semanticQuestionIds = QUESTION_SEMANTIC_MAPPINGS.reduce((result, item) => {
  const ids = result.get(item.semanticField) ?? [];
  ids.push(item.questionId);
  result.set(item.semanticField, ids);
  return result;
}, new Map<string, number[]>());

export function getQuestionSemanticMapping(questionId: number): QuestionSemanticMapping | undefined {
  return QUESTION_SEMANTIC_MAPPINGS.find((item) => item.questionId === questionId);
}

export type MasterProfileContact = {
  fullName: string;
  resumeName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
};

export type MasterProfileExperience = {
  employer: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  achievements: string[];
  results: string[];
  problemsSolved: string[];
  leadershipScope: string;
  tools: string[];
  departureContext: string;
  sourceDetails: string;
  source: 'current' | 'previous' | 'additional';
};

export type MasterProfileEducation = {
  qualification: string;
  subject: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  result: string;
  honours: string;
  details: string[];
};

export type MasterProfileCertification = {
  name: string;
  issuer: string;
  obtainedDate: string;
  expiryDate: string;
  credentialNumber: string;
  active: string;
  details: string[];
};

export type MasterProfileProject = {
  name: string;
  purpose: string;
  role: string;
  contribution: string[];
  tools: string[];
  result: string;
  audience: string;
  url: string;
  details: string[];
};

export type MasterProfileAchievement = {
  achievement: string;
  issuer: string;
  date: string;
  result: string;
  details: string[];
};

export type MasterProfilePublication = {
  title: string;
  publicationOrEvent: string;
  date: string;
  contribution: string;
  details: string[];
};

export type MasterProfileLeadershipVolunteering = {
  role: string;
  organisation: string;
  contribution: string[];
  kind: 'leadership' | 'volunteering';
};

export type MasterProfileLanguage = {
  language: string;
  proficiency: string;
};

export type MasterProfileMembership = {
  name: string;
  details: string[];
};

export type MasterProfileSkills = {
  professional: string[];
  technical: string[];
  businessAndDomain: string[];
  analytical: string[];
  communicationAndLeadership: string[];
  tools: string[];
  programmingAndSystems: string[];
  strongest: string[];
  improving: string[];
};

export type MasterProfileNonResumeData = {
  jobPreferences: {
    titles: string;
    alternativeTitles: string;
    industries: string;
    priorityCompanies: string;
    avoidedCompaniesOrRoles: string;
    employmentTypes: string;
  };
  salaryPreferences: {
    minimum: string;
    automationMinimum: string;
  };
  locationPreferences: {
    locations: string;
    relocate: string;
    workArrangement: string;
    automationLocations: string;
  };
  workAuthorization: {
    countries: string;
    sponsorship: string;
    status: string;
    expiry: string;
    restrictions: string;
    verification: string;
  };
  availability: {
    startDate: string;
    noticePeriod: string;
    travel: string;
    additional: string;
  };
  applicationInformation: Record<string, string>;
  automationInformation: Record<string, string>;
  applicationOnlyInformation: Record<string, string>;
};

export type MasterProfile = {
  contact: MasterProfileContact;
  professionalIdentity: {
    headline: string;
    targetRole: string;
    alternativeRole: string;
    nextRole: string;
    strongestWork: string;
    qualities: string[];
    industries: string;
    preferredProblems: string;
    differentiator: string;
    valueCreated: string;
    careerDirection: string;
    employerTakeaway: string;
  };
  summary: string;
  experience: MasterProfileExperience[];
  education: MasterProfileEducation[];
  skills: MasterProfileSkills;
  certifications: MasterProfileCertification[];
  projects: MasterProfileProject[];
  achievements: MasterProfileAchievement[];
  publications: MasterProfilePublication[];
  leadershipVolunteering: MasterProfileLeadershipVolunteering[];
  languages: MasterProfileLanguage[];
  memberships: MasterProfileMembership[];
  additionalProfessionalInformation: {
    otherExperience: string;
    training: string;
    additionalAchievements: string;
    standardTellMeAboutYourself: string;
  };
  nonResume: MasterProfileNonResumeData;
};

const answer = (answers: MasterProfileAnswerMap, semanticField: string): string => {
  const ids = semanticQuestionIds.get(semanticField) ?? [];
  return ids.map((id) => answers[id]?.trim() ?? '').find(Boolean) ?? '';
};

const list = (text: string): string[] =>
  text
    .split(/\r?\n|[•;]+/)
    .map((item) => item.trim())
    .filter((item): item is string => Boolean(item));

const listFor = (answers: MasterProfileAnswerMap, semanticField: string): string[] => list(answer(answers, semanticField));

const hasAny = (answers: MasterProfileAnswerMap, semanticFields: string[]): boolean =>
  semanticFields.some((field) => Boolean(answer(answers, field)));

const emptyExperience = (source: MasterProfileExperience['source']): MasterProfileExperience => ({
  employer: '',
  title: '',
  location: '',
  startDate: '',
  endDate: '',
  responsibilities: [],
  achievements: [],
  results: [],
  problemsSolved: [],
  leadershipScope: '',
  tools: [],
  departureContext: '',
  sourceDetails: '',
  source,
});

function experience(
  answers: MasterProfileAnswerMap,
  source: MasterProfileExperience['source'],
  semanticPrefix: string,
  sourceDetailsField?: string,
): MasterProfileExperience | null {
  const entry = emptyExperience(source);
  entry.employer = answer(answers, `${semanticPrefix}.employer`);
  entry.title = answer(answers, `${semanticPrefix}.title`);
  entry.location = answer(answers, `${semanticPrefix}.location`);
  entry.startDate = answer(answers, `${semanticPrefix}.startDate`);
  entry.endDate = answer(answers, `${semanticPrefix}.endDate`);
  entry.sourceDetails = sourceDetailsField ? answer(answers, sourceDetailsField) : answer(answers, `${semanticPrefix}.period`);
  entry.responsibilities = listFor(answers, `${semanticPrefix}.responsibilities`);
  entry.achievements = listFor(answers, `${semanticPrefix}.achievements`);
  entry.results = listFor(answers, `${semanticPrefix}.results`);
  entry.problemsSolved = listFor(answers, `${semanticPrefix}.problemsSolved`);
  entry.leadershipScope = answer(answers, `${semanticPrefix}.leadershipScope`);
  entry.tools = listFor(answers, `${semanticPrefix}.tools`);
  entry.departureContext = answer(answers, `${semanticPrefix}.departureContext`);

  const fields = [
    `${semanticPrefix}.employer`,
    `${semanticPrefix}.title`,
    `${semanticPrefix}.location`,
    `${semanticPrefix}.startDate`,
    `${semanticPrefix}.endDate`,
    `${semanticPrefix}.period`,
    `${semanticPrefix}.sourceDetails`,
    `${semanticPrefix}.responsibilities`,
    `${semanticPrefix}.achievements`,
    `${semanticPrefix}.results`,
    `${semanticPrefix}.problemsSolved`,
    `${semanticPrefix}.leadershipScope`,
    `${semanticPrefix}.tools`,
    `${semanticPrefix}.departureContext`,
  ];
  return hasAny(answers, fields) ? entry : null;
}

function education(answers: MasterProfileAnswerMap): MasterProfileEducation[] {
  const entries: MasterProfileEducation[] = [];
  if (hasAny(answers, [
    'education.primary.qualification',
    'education.primary.subject',
    'education.primary.institution',
    'education.primary.location',
    'education.primary.startDate',
    'education.primary.endDate',
    'education.primary.result',
    'education.primary.honours',
  ])) {
    entries.push({
      qualification: answer(answers, 'education.primary.qualification'),
      subject: answer(answers, 'education.primary.subject'),
      institution: answer(answers, 'education.primary.institution'),
      location: answer(answers, 'education.primary.location'),
      startDate: answer(answers, 'education.primary.startDate'),
      endDate: answer(answers, 'education.primary.endDate'),
      result: answer(answers, 'education.primary.result'),
      honours: answer(answers, 'education.primary.honours'),
      details: [],
    });
  }
  const additional = listFor(answers, 'education.additional.details');
  additional.forEach((details) => entries.push({
    qualification: details,
    subject: '',
    institution: '',
    location: '',
    startDate: '',
    endDate: '',
    result: '',
    honours: '',
    details: [details],
  }));
  return entries;
}

function certifications(answers: MasterProfileAnswerMap): MasterProfileCertification[] {
  const names = listFor(answers, 'certifications.primary.name');
  if (!hasAny(answers, [
    'certifications.primary.name',
    'certifications.primary.issuer',
    'certifications.primary.obtainedDate',
    'certifications.primary.expiryDate',
    'certifications.primary.credentialNumber',
    'certifications.primary.active',
    'certifications.primary.relevance',
  ])) return [];

  const count = Math.max(names.length, 1);
  return Array.from({ length: count }, (_, index) => ({
    name: names[index] ?? answer(answers, 'certifications.primary.name'),
    issuer: answer(answers, 'certifications.primary.issuer'),
    obtainedDate: answer(answers, 'certifications.primary.obtainedDate'),
    expiryDate: answer(answers, 'certifications.primary.expiryDate'),
    credentialNumber: answer(answers, 'certifications.primary.credentialNumber'),
    active: answer(answers, 'certifications.primary.active'),
    details: listFor(answers, 'certifications.primary.relevance'),
  }));
}

function projects(answers: MasterProfileAnswerMap): MasterProfileProject[] {
  const entries: MasterProfileProject[] = [];
  if (hasAny(answers, ['projects.featured.nameAndPurpose', 'projects.featured.contribution', 'projects.featured.tools', 'projects.featured.result'])) {
    entries.push({
      name: answer(answers, 'projects.featured.nameAndPurpose'),
      purpose: answer(answers, 'projects.featured.nameAndPurpose'),
      role: '',
      contribution: listFor(answers, 'projects.featured.contribution'),
      tools: listFor(answers, 'projects.featured.tools'),
      result: answer(answers, 'projects.featured.result'),
      audience: '',
      url: '',
      details: [],
    });
  }
  if (hasAny(answers, ['projects.additional.name', 'projects.additional.purpose', 'projects.additional.role', 'projects.additional.contribution', 'projects.additional.tools', 'projects.additional.result', 'projects.additional.audience', 'projects.additional.url', 'projects.additional.relevance'])) {
    entries.push({
      name: answer(answers, 'projects.additional.name'),
      purpose: answer(answers, 'projects.additional.purpose'),
      role: answer(answers, 'projects.additional.role'),
      contribution: listFor(answers, 'projects.additional.contribution'),
      tools: listFor(answers, 'projects.additional.tools'),
      result: answer(answers, 'projects.additional.result'),
      audience: answer(answers, 'projects.additional.audience'),
      url: answer(answers, 'projects.additional.url'),
      details: listFor(answers, 'projects.additional.relevance'),
    });
  }
  return entries;
}

function achievements(answers: MasterProfileAnswerMap): MasterProfileAchievement[] {
  const entries: MasterProfileAchievement[] = [];
  if (answer(answers, 'achievements.featured.details')) {
    entries.push({
      achievement: answer(answers, 'achievements.featured.details'),
      issuer: '',
      date: '',
      result: '',
      details: [],
    });
  }
  if (hasAny(answers, ['achievements.additional.achievement', 'achievements.additional.issuerAndDate', 'achievements.additional.result'])) {
    entries.push({
      achievement: answer(answers, 'achievements.additional.achievement'),
      issuer: answer(answers, 'achievements.additional.issuerAndDate'),
      date: '',
      result: answer(answers, 'achievements.additional.result'),
      details: [],
    });
  }
  return entries;
}

function publications(answers: MasterProfileAnswerMap): MasterProfilePublication[] {
  const details = answer(answers, 'publications.details');
  return details ? [{ title: details, publicationOrEvent: '', date: '', contribution: details, details: [] }] : [];
}

function leadershipVolunteering(answers: MasterProfileAnswerMap): MasterProfileLeadershipVolunteering[] {
  const entries: MasterProfileLeadershipVolunteering[] = [];
  const leadership = listFor(answers, 'leadership.details');
  leadership.forEach((role) => entries.push({ role, organisation: '', contribution: [role], kind: 'leadership' }));
  if (answer(answers, 'volunteering.exists') === 'YES') {
    entries.push({ role: 'Volunteering or extracurricular experience', organisation: '', contribution: [], kind: 'volunteering' });
  }
  return entries;
}

export function normalizeAnswerMap(input: unknown): MasterProfileAnswerMap {
  if (!input || typeof input !== 'object') return {};
  const normalized: MasterProfileAnswerMap = {};
  Object.entries(input as Record<string, unknown>).forEach(([key, rawValue]) => {
    if (!/^\d+$/.test(key) || rawValue === undefined || rawValue === null) return;
    normalized[Number(key)] = typeof rawValue === 'string' ? rawValue : String(rawValue);
  });
  return normalized;
}

export function masterProfileFromAnswers(answers: MasterProfileAnswerMap): MasterProfile {
  const currentExperience = experience(answers, 'current', 'experience.current');
  const previousExperience = experience(answers, 'previous', 'experience.previous');
  const additionalExperience = experience(answers, 'additional', 'experience.additional', 'experience.additional.sourceDetails');

  return {
    contact: {
      fullName: answer(answers, 'contact.fullName'),
      resumeName: answer(answers, 'contact.resumeName'),
      email: answer(answers, 'contact.email'),
      phone: answer(answers, 'contact.phone'),
      location: answer(answers, 'contact.location'),
      linkedinUrl: answer(answers, 'contact.linkedinUrl'),
      portfolioUrl: answer(answers, 'contact.portfolioUrl'),
    },
    professionalIdentity: {
      headline: answer(answers, 'professionalIdentity.headline'),
      targetRole: answer(answers, 'professionalIdentity.targetRole'),
      alternativeRole: answer(answers, 'professionalIdentity.alternativeRole'),
      nextRole: answer(answers, 'professionalIdentity.nextRole'),
      strongestWork: answer(answers, 'professionalIdentity.strongestWork'),
      qualities: listFor(answers, 'professionalIdentity.qualities'),
      industries: answer(answers, 'professionalIdentity.industries'),
      preferredProblems: answer(answers, 'professionalIdentity.preferredProblems'),
      differentiator: answer(answers, 'professionalIdentity.differentiator'),
      valueCreated: answer(answers, 'professionalIdentity.valueCreated'),
      careerDirection: answer(answers, 'professionalIdentity.careerDirection'),
      employerTakeaway: answer(answers, 'professionalIdentity.employerTakeaway'),
    },
    summary: answer(answers, 'summary.professional'),
    experience: [currentExperience, previousExperience, additionalExperience].filter(
      (entry): entry is MasterProfileExperience => entry !== null,
    ),
    education: education(answers),
    skills: {
      professional: listFor(answers, 'skills.professional'),
      technical: listFor(answers, 'skills.technical'),
      businessAndDomain: listFor(answers, 'skills.businessAndDomain'),
      analytical: listFor(answers, 'skills.analytical'),
      communicationAndLeadership: listFor(answers, 'skills.communicationAndLeadership'),
      tools: [...listFor(answers, 'skills.tools'), ...listFor(answers, 'skills.toolsAndProficiency')],
      programmingAndSystems: listFor(answers, 'skills.programmingAndSystems'),
      strongest: listFor(answers, 'skills.strongest'),
      improving: listFor(answers, 'skills.improving'),
    },
    certifications: certifications(answers),
    projects: projects(answers),
    achievements: achievements(answers),
    publications: publications(answers),
    leadershipVolunteering: leadershipVolunteering(answers),
    languages: listFor(answers, 'languages.language').flatMap((text) => text.split(',').map((language) => language.trim()).filter(Boolean)).map((language, index) => ({
      language,
      proficiency: listFor(answers, 'languages.proficiency')[index] ?? answer(answers, 'languages.proficiency'),
    })),
    memberships: [],
    additionalProfessionalInformation: {
      otherExperience: answer(answers, 'additionalProfessionalInformation.otherExperience'),
      training: answer(answers, 'additionalProfessionalInformation.training'),
      additionalAchievements: answer(answers, 'additionalProfessionalInformation.additionalAchievements'),
      standardTellMeAboutYourself: answer(answers, 'applicationInformation.standardTellMeAboutYourself'),
    },
    nonResume: {
      jobPreferences: {
        titles: answer(answers, 'jobPreferences.titles'),
        alternativeTitles: answer(answers, 'jobPreferences.alternativeTitles'),
        industries: answer(answers, 'jobPreferences.industries'),
        priorityCompanies: answer(answers, 'jobPreferences.priorityCompanies'),
        avoidedCompaniesOrRoles: answer(answers, 'jobPreferences.avoidedCompaniesOrRoles'),
        employmentTypes: answer(answers, 'jobPreferences.employmentTypes'),
      },
      salaryPreferences: {
        minimum: answer(answers, 'salaryPreferences.minimum'),
        automationMinimum: answer(answers, 'automationInformation.minimumSalary'),
      },
      locationPreferences: {
        locations: answer(answers, 'locationPreferences.locations'),
        relocate: answer(answers, 'locationPreferences.relocate'),
        workArrangement: answer(answers, 'locationPreferences.workArrangement'),
        automationLocations: answer(answers, 'automationInformation.locations'),
      },
      workAuthorization: {
        countries: answer(answers, 'workAuthorization.countries'),
        sponsorship: answer(answers, 'workAuthorization.sponsorship'),
        status: answer(answers, 'workAuthorization.status'),
        expiry: answer(answers, 'workAuthorization.expiry'),
        restrictions: answer(answers, 'workAuthorization.restrictions'),
        verification: answer(answers, 'workAuthorization.verification'),
      },
      availability: {
        startDate: answer(answers, 'availability.startDate'),
        noticePeriod: answer(answers, 'availability.noticePeriod'),
        travel: answer(answers, 'availability.travel'),
        additional: answer(answers, 'availability.additional'),
      },
      applicationInformation: {
        hasResume: answer(answers, 'applicationInformation.hasResume'),
        hasCoverLetter: answer(answers, 'applicationInformation.hasCoverLetter'),
        hasPortfolio: answer(answers, 'applicationInformation.hasPortfolio'),
        hasReferences: answer(answers, 'applicationInformation.hasReferences'),
        preferredReference: answer(answers, 'applicationInformation.preferredReference'),
        referenceCompany: answer(answers, 'applicationInformation.referenceCompany'),
        referenceContact: answer(answers, 'applicationInformation.referenceContact'),
        opportunitySource: answer(answers, 'applicationInformation.opportunitySource'),
        standardSummary: answer(answers, 'applicationInformation.standardSummary'),
        standardTellMeAboutYourself: answer(answers, 'applicationInformation.standardTellMeAboutYourself'),
      },
      automationInformation: {
        titles: answer(answers, 'automationInformation.titles'),
        alternativeTitles: answer(answers, 'automationInformation.alternativeTitles'),
        priorityCompanies: answer(answers, 'automationInformation.priorityCompanies'),
        avoidedCompaniesOrIndustries: answer(answers, 'automationInformation.avoidedCompaniesOrIndustries'),
        locations: answer(answers, 'automationInformation.locations'),
        minimumSalary: answer(answers, 'automationInformation.minimumSalary'),
        employmentTypesAndArrangements: answer(answers, 'automationInformation.employmentTypesAndArrangements'),
        experienceYears: answer(answers, 'automationInformation.experienceYears'),
        whyInterested: answer(answers, 'automationInformation.whyInterested'),
        whyHire: answer(answers, 'automationInformation.whyHire'),
      },
      applicationOnlyInformation: {
        dateOfBirth: answer(answers, 'applicationOnlyInformation.dateOfBirth'),
        nationality: answer(answers, 'applicationOnlyInformation.nationality'),
        workAuthorizationDocument: answer(answers, 'applicationOnlyInformation.workAuthorizationDocument'),
        previouslyWorkedForCompany: answer(answers, 'applicationOnlyInformation.previouslyWorkedForCompany'),
        previouslyApplied: answer(answers, 'applicationOnlyInformation.previouslyApplied'),
        employmentRestriction: answer(answers, 'applicationOnlyInformation.employmentRestriction'),
        interviewAccommodation: answer(answers, 'applicationOnlyInformation.interviewAccommodation'),
        workplaceAccommodation: answer(answers, 'applicationOnlyInformation.workplaceAccommodation'),
        other: answer(answers, 'applicationOnlyInformation.other'),
        confirmation: answer(answers, 'applicationOnlyInformation.confirmation'),
      },
    },
  };
}
