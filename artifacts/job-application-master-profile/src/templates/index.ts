import { registerTemplate } from '../resumeTemplates';
import { atsSafeTemplates } from './ats-safe';
import { modernProfessionalTemplates } from './modern-professional';
import { industryTemplates } from './industry';
import { careerStageTemplates } from './career-stage';

// Re-export individual category arrays for direct access
export { atsSafeTemplates } from './ats-safe';
export { modernProfessionalTemplates } from './modern-professional';
export { industryTemplates } from './industry';
export { careerStageTemplates } from './career-stage';

/** All 40 template configs in a single flat array. */
export const allTemplateConfigs = [
  ...atsSafeTemplates,
  ...modernProfessionalTemplates,
  ...industryTemplates,
  ...careerStageTemplates,
];

// Register every template into the global registry on import.
allTemplateConfigs.forEach(registerTemplate);
