import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Download,
  FileText,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  categories as defaultCategories,
  categoriesForRole,
  resumeCategoryCount,
  type QuestionnaireQuestion,
  questionnaire,
} from './questionnaire';
import Landing from './Landing';
import RoleSelect, { roleLabel, type RoleId } from './RoleSelect';
import ResumeImport from './ResumeImport';
import ResumeBuilder from './ResumeBuilder';
import TemplateGallery from './pages/TemplateGallery';
import type { TemplateId } from './resumeTemplates';
import { defaultResumeSettings, downloadResumeDocx, downloadResumePdf, mapResume } from './resumeMapper';
import { masterProfileFromAnswers, normalizeAnswerMap, type MasterProfile } from './masterProfile';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { createResume, updateResume, getResume } from './lib/api';

type AnswerMap = Record<number, string>;
type SaveState = 'saved' | 'saving';
type JobSearchOptIn = 'yes' | 'no' | null;
type Draft = {
  answers: AnswerMap;
  categoryIndex: number;
  masterProfile?: MasterProfile;
  version?: number;
  selectedRole?: string | null;
  jobSearchOptIn?: JobSearchOptIn;
  resumeId?: string | null;
};

const STORAGE_KEY = 'job-application-master-profile-v1';
const SERVER_SAVE_DEBOUNCE = 800;

const conditionalGroups: Array<{ parentId: number; childIds: number[] }> = [
  { parentId: 11, childIds: [12, 13, 14, 15, 16, 17, 18, 19, 20] },
  { parentId: 21, childIds: [22, 23, 24, 25, 26, 27, 28, 29, 30] },
  { parentId: 39, childIds: [40] },
  { parentId: 43, childIds: [44, 45, 46, 47, 48] },
  { parentId: 49, childIds: [50] },
  { parentId: 61, childIds: [62, 63, 64, 65, 66, 67, 68, 69] },
  { parentId: 71, childIds: [72, 73, 74, 75, 76, 77, 78, 79, 80] },
  { parentId: 91, childIds: [92, 93, 94, 95, 96, 97, 98, 99, 100] },
  { parentId: 101, childIds: [102, 103, 104] },
  { parentId: 105, childIds: [106] },
  { parentId: 107, childIds: [108] },
  { parentId: 134, childIds: [135, 136, 137] },
];

const yesNoQuestionIds = new Set([
  11, 21, 30, 38, 39, 43, 48, 49, 61, 67, 70, 71, 77, 78, 79, 91, 101, 105, 107, 109,
  117, 124, 127, 128, 129, 131, 132, 133, 134, 154, 155, 156, 157, 158, 160,
]);

function loadDraft(): Draft {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { answers: {}, categoryIndex: 0 };
    const parsed = JSON.parse(stored) as Partial<Draft>;
    // v1 stored only the question-id answer map. Normalize both v1 and the
    // current envelope without removing the legacy answers.
    const answers = normalizeAnswerMap(parsed.answers ?? parsed);
    return {
      answers,
      categoryIndex:
        typeof parsed.categoryIndex === 'number'
          ? Math.min(Math.max(parsed.categoryIndex, 0), Math.max(defaultCategories.length - 1, 0))
          : 0,
      selectedRole: typeof parsed.selectedRole === 'string' ? parsed.selectedRole : null,
      jobSearchOptIn: parsed.jobSearchOptIn === 'yes' || parsed.jobSearchOptIn === 'no' ? parsed.jobSearchOptIn : null,
      resumeId: typeof parsed.resumeId === 'string' ? parsed.resumeId : null,
    };
  } catch {
    return { answers: {}, categoryIndex: 0 };
  }
}

function isYesNoQuestion(question: QuestionnaireQuestion): boolean {
  return yesNoQuestionIds.has(question.id);
}

function fieldType(question: QuestionnaireQuestion): 'text' | 'email' | 'url' | 'date' | 'number' {
  const text = question.question.toLowerCase();
  if (text.includes('email')) return 'email';
  if (text.includes('url') || text.includes('website') || text.includes('linkedin') || text.includes('github') || text.includes('doi')) return 'url';
  if (text.includes('date') || text.includes('when was') || text.includes('when did') || text.includes('when does') || text.includes('when did')) return 'date';
  if (
    text.includes('how many') ||
    text.includes('how large') ||
    text.includes('what percentage') ||
    text.includes('salary') ||
    text.includes('compensation') ||
    text.includes('gpa') ||
    text.includes('score') ||
    text.includes('years of') ||
    text.includes('percentage of travel')
  ) return 'number';
  return 'text';
}

function isLongAnswer(question: QuestionnaireQuestion): boolean {
  const text = question.question.toLowerCase();
  return (
    question.question.length > 75 ||
    /responsibilit|achievement|project|skill|experience|information|example|goal|qualification|coursework|topic|purpose|outcome|result|challenge|evidence|summary|objective|answer|work samples|case stud|additional|professional work|interests/.test(text)
  );
}

function isCaseSensitive(question: QuestionnaireQuestion): boolean {
  const text = question.question.toLowerCase();
  return (
    text.includes('email') ||
    text.includes('url') ||
    text.includes('website') ||
    text.includes('linkedin') ||
    text.includes('github') ||
    text.includes('doi') ||
    text.includes('file') ||
    text.includes('path') ||
    text.includes('password') ||
    text.includes('identifier') ||
    text.includes('number') ||
    text.includes('candidate id') ||
    text.includes('reference') && text.includes('phone')
  );
}

function visibleForQuestion(id: number, answers: AnswerMap): boolean {
  const group = conditionalGroups.find((item) => item.childIds.includes(id));
  return !group || answers[group.parentId] === 'YES';
}

function answersWithValue(previous: AnswerMap, questionId: number, value: string): AnswerMap {
  return { ...previous, [questionId]: value };
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function downloadCsv(answers: AnswerMap): void {
  const rows = [
    ['question_id', 'category', 'question', 'answer'],
    ...questionnaire
      .filter((item) => Boolean(answers[item.id]?.trim()))
      .map((item) => [
        String(item.id),
        item.category,
        item.question,
        answers[item.id] ?? '',
      ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'job_application_master_profile.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function QuestionCard({
  question,
  answer,
  onChange,
  onAdvance,
  index,
}: {
  question: QuestionnaireQuestion;
  answer: string;
  onChange: (value: string) => void;
  onAdvance: (questionId: number, value?: string) => void;
  index: number;
}) {
  const yesNo = isYesNoQuestion(question);
  const type = fieldType(question);
  const longAnswer = isLongAnswer(question);
  const caseSensitive = isCaseSensitive(question);
  const inputId = `question-${question.id}`;

  return (
    <div className="question-row" style={{ animationDelay: `${Math.min(index * 24, 260)}ms` }}>
      <div className="question-meta">
        <span className="question-number" aria-hidden="true">{question.id}</span>
        <label className="question-label" htmlFor={yesNo ? undefined : inputId}>
          {question.question}
          <span className="question-optional">Optional — leave blank if it does not apply</span>
        </label>
      </div>

      {yesNo ? (
        <>
          <div className="yes-no-group" role="group" aria-label={question.question}>
            <button
              type="button"
              className={`yes-no-button ${answer === 'YES' ? 'selected' : ''}`}
              aria-pressed={answer === 'YES'}
              data-testid={`button-yes-question-${question.id}`}
              onClick={() => onChange('YES')}
            >
              YES
            </button>
            <button
              type="button"
              className={`yes-no-button ${answer === 'NO' ? 'selected' : ''}`}
              aria-pressed={answer === 'NO'}
              data-testid={`button-no-question-${question.id}`}
              onClick={() => onAdvance(question.id, 'NO')}
            >
              NO
            </button>
          </div>
          {answer === 'YES' ? (
            <div className="conditional-note">
              <Check size={14} strokeWidth={2.5} aria-hidden="true" />
              Related details are available below when applicable.
            </div>
          ) : null}
        </>
      ) : longAnswer ? (
        <textarea
          id={inputId}
          className={`answer-control ${caseSensitive ? 'text-exception' : 'text-default'}`}
          value={answer}
          rows={3}
          autoComplete="on"
          data-testid={`input-question-${question.id}`}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          className={`answer-control ${caseSensitive ? 'text-exception' : 'text-default'}`}
          value={answer}
          enterKeyHint="next"
          autoComplete={type === 'email' ? 'email' : 'on'}
          data-testid={`input-question-${question.id}`}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onAdvance(question.id, event.currentTarget.value);
            }
          }}
        />
      )}
    </div>
  );
}

function ProgressContext({
  categoryIndex,
  categoryCount,
  answeredCount,
  relevantQuestionCount,
  categoryRemaining,
}: {
  categoryIndex: number;
  categoryCount: number;
  answeredCount: number;
  relevantQuestionCount: number;
  categoryRemaining: number;
}) {
  const percentage = relevantQuestionCount === 0 ? 0 : Math.round((answeredCount / relevantQuestionCount) * 100);
  return (
    <div className="progress-context" data-testid="progress-context">
      <div className="progress-topline">
        <span>Category <strong>{categoryIndex + 1} of {categoryCount}</strong></span>
        <span><strong>{answeredCount}</strong> of {relevantQuestionCount} answered <span aria-hidden="true">•</span> <strong>{relevantQuestionCount - answeredCount}</strong> remaining <span aria-hidden="true">•</span> <strong>{percentage}%</strong> overall</span>
      </div>
      <div className="progress-category-remaining">
        {categoryRemaining} questions remaining in this category
      </div>
      <div className="progress-track" aria-label={`${percentage}% overall progress`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function CategoryJumpPanel({
  categories: categoryList,
  categoryIndex,
  answers,
  onMove,
  onClose,
}: {
  categories: typeof defaultCategories;
  categoryIndex: number;
  answers: AnswerMap;
  onMove: (index: number) => void;
  onClose: () => void;
}) {
  const relevantQuestionCount = questionnaire.filter((question) => visibleForQuestion(question.id, answers)).length;
  const answeredCount = questionnaire.filter((question) => visibleForQuestion(question.id, answers) && Boolean(answers[question.id]?.trim())).length;
  return (
    <div className="modal-backdrop pages-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="pages-panel" role="dialog" aria-modal="true" aria-labelledby="pages-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="pages-panel-header">
          <div>
            <div className="eyebrow">Master profile navigation</div>
            <h2 id="pages-title">All pages</h2>
            <p>{categoryIndex + 1} of {categoryList.length} · {relevantQuestionCount === 0 ? 0 : Math.round((answeredCount / relevantQuestionCount) * 100)}% overall</p>
          </div>
          <button type="button" className="page-close" onClick={onClose} aria-label="Close all pages" data-testid="button-close-all-pages"><X size={18} /></button>
        </div>
        <div className="pages-list">
          {categoryList.map((category, index) => {
            const visibleQuestions = category.questions.filter((question) => visibleForQuestion(question.id, answers));
            const answered = visibleQuestions.filter((question) => Boolean(answers[question.id]?.trim())).length;
            const status = answered === visibleQuestions.length && visibleQuestions.length > 0 ? 'complete' : answered > 0 ? 'partial' : 'empty';
            return (
              <button type="button" className={`page-jump ${index === categoryIndex ? 'current' : ''}`} key={category.name} onClick={() => onMove(index)} data-testid={`button-jump-category-${index}`}>
                <span className={`page-status page-status-${status}`} aria-hidden="true">{status === 'complete' ? '✓' : status === 'partial' ? '◐' : '○'}</span>
                <span className="page-jump-copy"><strong>{index + 1}. {category.name}</strong><small>{status === 'complete' ? 'Complete' : status === 'partial' ? 'Partially complete' : 'Not started'} · {answered}/{visibleQuestions.length}</small></span>
                {index === categoryIndex ? <span className="page-current-label">CURRENT</span> : null}
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function JobSearchGate({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="workspace-card" data-testid="panel-job-search-gate">
      <div className="category-header">
        <div className="eyebrow">Resume complete</div>
        <h1 className="category-title">Your resume information is complete.</h1>
        <p className="category-subtitle">
          Do you also want to use this information for automated job applications/search? This adds a short,
          separate set of questions covering things like work authorization, availability, and job preferences —
          it won't change your resume.
        </p>
      </div>
      <div className="nav-actions" style={{ justifyContent: 'flex-start', gap: '12px' }}>
        <button type="button" className="button button-primary" data-testid="button-job-search-yes" onClick={onContinue}>
          Yes, continue <ArrowRight size={15} aria-hidden="true" />
        </button>
        <button type="button" className="button button-secondary" data-testid="button-job-search-no" onClick={onSkip}>
          No, build my resume
        </button>
      </div>
    </div>
  );
}

function ReviewScreen({
  categories: categoryList,
  answers,
  answeredCount,
  relevantQuestionCount,
  onEditCategory,
  onDownload,
  onStartOver,
  onViewResume,
  onOpenAllPages,
  onDownloadPdf,
  onDownloadWord,
}: {
  categories: typeof defaultCategories;
  answers: AnswerMap;
  answeredCount: number;
  relevantQuestionCount: number;
  onEditCategory: (index: number) => void;
  onDownload: () => void;
  onStartOver: () => void;
  onViewResume: () => void;
  onOpenAllPages: () => void;
  onDownloadPdf: () => void;
  onDownloadWord: () => void;
}) {
  const skippedCount = relevantQuestionCount - answeredCount;
  return (
    <div className="workspace-card">
      <div className="review-header">
        <div className="category-header-top">
          <div className="eyebrow">Your profile so far</div>
          <div className="category-header-actions">
            <button type="button" className="button button-secondary" data-testid="button-all-pages-review" onClick={onOpenAllPages}>
              ALL PAGES
            </button>
          </div>
        </div>
        <h1 className="review-title" data-testid="text-review-title">Your master job application profile is complete.</h1>
        <p className="category-subtitle">
          Review your answers by category. You can edit any section, download a reusable copy, or return whenever you are ready.
        </p>
      </div>
      <div className="review-summary">
        <div className="summary-tile">
          <span className="summary-value">{answeredCount}</span>
          <span className="summary-label">answered questions</span>
        </div>
        <div className="summary-tile">
          <span className="summary-value">{skippedCount}</span>
          <span className="summary-label">left to revisit</span>
        </div>
        <div className="summary-tile">
          <span className="summary-value">{relevantQuestionCount === 0 ? 0 : Math.round((answeredCount / relevantQuestionCount) * 100)}%</span>
          <span className="summary-label">profile complete</span>
        </div>
      </div>
      <div className="review-list" id="review-answers">
        {categoryList.map((category, categoryIndex) => {
          const visibleQuestions = category.questions.filter((question) => visibleForQuestion(question.id, answers));
          const categoryAnswered = visibleQuestions.filter((question) => Boolean(answers[question.id]?.trim())).length;
          return (
            <section className="review-category" key={category.name} data-testid={`review-category-${categoryIndex}`}>
              <div className="review-category-top">
                <div>
                  <h2 className="review-category-title">{category.name}</h2>
                  <span className="review-category-count">{categoryAnswered} of {visibleQuestions.length} answered</span>
                </div>
                <button
                  type="button"
                  className="review-edit"
                  data-testid={`button-edit-category-${categoryIndex}`}
                  onClick={() => onEditCategory(categoryIndex)}
                >
                  EDIT CATEGORY
                </button>
              </div>
              <div className="review-answer-list">
                {visibleQuestions.map((question) => (
                  <div className="review-answer" key={question.id}>
                    <div className="review-question">{question.id}. {question.question}</div>
                    <div className={`review-answer-value ${answers[question.id] ? '' : 'empty'}`} data-testid={`text-review-answer-${question.id}`}>
                      {answers[question.id] || 'Not answered'}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <div className="review-actions">
        <button type="button" className="button button-danger" data-testid="button-start-over" onClick={onStartOver}>
          <RotateCcw size={15} aria-hidden="true" /> START OVER
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => document.getElementById('review-answers')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          REVIEW ANSWERS
        </button>
        <button type="button" className="button button-primary" data-testid="button-download-csv" onClick={onDownload}>
          <Download size={15} aria-hidden="true" /> CSV
        </button>
        <button type="button" className="button button-secondary" data-testid="button-download-word-review" onClick={onDownloadWord}>
          <Download size={15} aria-hidden="true" /> WORD
        </button>
        <button type="button" className="button button-secondary" aria-label="Download PDF" title="Download PDF" data-testid="button-download-pdf-review" onClick={onDownloadPdf}>
          <Download size={15} aria-hidden="true" /> PDF
        </button>
        <button type="button" className="button button-primary" data-testid="button-view-resume-review" onClick={onViewResume}>
          VIEW RESUME <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ResetDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <div className="modal-card" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" onMouseDown={(event) => event.stopPropagation()}>
        <h2 id="reset-title">Start over?</h2>
        <p>This will permanently clear the profile saved in this browser. Your downloaded files will not be affected.</p>
        <div className="modal-actions">
          <button type="button" className="button button-secondary" data-testid="button-cancel-reset" onClick={onCancel}>
            <X size={15} aria-hidden="true" /> CANCEL
          </button>
          <button type="button" className="button button-danger" data-testid="button-confirm-reset" onClick={onConfirm}>
            CLEAR PROFILE
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated, logout: authLogout } = useAuth();
  const initialDraft = useMemo(() => loadDraft(), []);
  const [answers, setAnswers] = useState<AnswerMap>(initialDraft.answers);
  const [categoryIndex, setCategoryIndex] = useState(initialDraft.categoryIndex);
  const [selectedRole, setSelectedRole] = useState<string | null>(initialDraft.selectedRole ?? null);
  const [showLanding, setShowLanding] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [showResumeImport, setShowResumeImport] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('ats-classic');
  const [review, setReview] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showJobSearchGate, setShowJobSearchGate] = useState(false);
  const [jobSearchOptIn, setJobSearchOptIn] = useState<JobSearchOptIn>(initialDraft.jobSearchOptIn ?? null);
  const [resumeOriginReview, setResumeOriginReview] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [resetOpen, setResetOpen] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(initialDraft.resumeId ?? null);
  const serverSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const masterProfile = useMemo(() => masterProfileFromAnswers(answers), [answers]);
  // Which question set is active depends on which audience the person picked
  // on the role-selection screen (see roleQuestionnaires in questionnaire.ts).
  const categories = useMemo(() => categoriesForRole(selectedRole), [selectedRole]);
  // Categories up to this index are resume content; anything after is the
  // optional job-search/application questionnaire, gated behind the
  // "resume complete" checkpoint below.
  const resumeCount = useMemo(() => resumeCategoryCount(selectedRole), [selectedRole]);
  const currentCategory = categories[categoryIndex] ?? categories[0];
  const relevantQuestionCount = useMemo(
    () => questionnaire.filter((question) => visibleForQuestion(question.id, answers)).length,
    [answers],
  );
  const answeredCount = useMemo(
    () => questionnaire.filter((question) => visibleForQuestion(question.id, answers) && Boolean(answers[question.id]?.trim())).length,
    [answers],
  );

  useEffect(() => {
    setSaveState('saving');
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          version: 2,
          answers,
          masterProfile,
          categoryIndex,
          selectedRole,
          jobSearchOptIn,
          resumeId: currentResumeId,
        }));
        setSaveState('saved');
      } catch {
        setSaveState('saved');
      }
    }, 320);
    return () => window.clearTimeout(timer);
  }, [answers, categoryIndex, masterProfile, selectedRole, jobSearchOptIn, currentResumeId]);

  // Server-side debounced save when authenticated
  useEffect(() => {
    if (!isAuthenticated || !currentResumeId) return;

    if (serverSaveTimer.current) clearTimeout(serverSaveTimer.current);
    serverSaveTimer.current = setTimeout(() => {
      updateResume(currentResumeId, {
        data: { answers, masterProfile, categoryIndex, selectedRole, jobSearchOptIn, templateId: selectedTemplateId },
        category: selectedRole ?? undefined,
        templateId: selectedTemplateId,
      }).catch(() => { /* server save is best-effort; localStorage is the fallback */ });
    }, SERVER_SAVE_DEBOUNCE);

    return () => {
      if (serverSaveTimer.current) clearTimeout(serverSaveTimer.current);
    };
  }, [answers, categoryIndex, masterProfile, selectedRole, jobSearchOptIn, isAuthenticated, currentResumeId, selectedTemplateId]);

  const updateAnswer = (questionId: number, value: string) => {
    setAnswers((previous) => answersWithValue(previous, questionId, value));
  };

  const moveToCategory = (nextIndex: number) => {
    setCategoryIndex(nextIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // True once `fromIndex` is the last resume category and the user hasn't
  // already answered the job-search opt-in — i.e. this is the moment to show
  // the "resume complete" checkpoint instead of moving straight ahead.
  const isJobSearchGateBoundary = (fromIndex: number) =>
    jobSearchOptIn === null && resumeCount > 0 && resumeCount < categories.length && fromIndex === resumeCount - 1;

  const advancePastCategory = (fromIndex: number) => {
    if (isJobSearchGateBoundary(fromIndex)) {
      setShowJobSearchGate(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (fromIndex === categories.length - 1) {
      setReview(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    moveToCategory(fromIndex + 1);
  };

  const handleNext = () => advancePastCategory(categoryIndex);

  const handleAdvanceQuestion = (questionId: number, value?: string) => {
    const nextAnswers = value === undefined ? answers : answersWithValue(answers, questionId, value);
    if (value !== undefined) {
      setAnswers(nextAnswers);
      setSaveState('saved');
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          version: 2,
          answers: nextAnswers,
          masterProfile: masterProfileFromAnswers(nextAnswers),
          categoryIndex,
          selectedRole,
          jobSearchOptIn,
        }));
      } catch {
        // The normal autosave effect remains the fallback for restricted storage.
      }
    }

    const visibleQuestions = currentCategory.questions.filter((question) => visibleForQuestion(question.id, nextAnswers));
    const currentQuestionIndex = visibleQuestions.findIndex((question) => question.id === questionId);
    const nextQuestion = visibleQuestions[currentQuestionIndex + 1];
    if (nextQuestion) {
      window.requestAnimationFrame(() => document.getElementById(`question-${nextQuestion.id}`)?.focus());
      return;
    }

    if (!isJobSearchGateBoundary(categoryIndex) && categoryIndex < categories.length - 1) {
      const nextCategoryIndex = categoryIndex + 1;
      moveToCategory(nextCategoryIndex);
      window.setTimeout(() => {
        const firstQuestion = categories[nextCategoryIndex].questions.find((question) => visibleForQuestion(question.id, nextAnswers));
        if (firstQuestion) document.getElementById(`question-${firstQuestion.id}`)?.focus();
      }, 0);
      return;
    }

    handleNext();
  };

  const handleBack = () => {
    if (categoryIndex === 0) return;
    moveToCategory(categoryIndex - 1);
  };

  const handleReset = () => {
    setAnswers({});
    setCategoryIndex(0);
    setSelectedRole(null);
    setReview(false);
    setShowResume(false);
    setShowJobSearchGate(false);
    setJobSearchOptIn(null);
    setPagesOpen(false);
    setResetOpen(false);
    setShowResumeImport(false);
    setCurrentResumeId(null);
    localStorage.removeItem(STORAGE_KEY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth-gated "start building" handler
  const handleStartBuilding = useCallback(() => {
    if (isAuthenticated) {
      setShowLanding(false);
      setShowRoleSelect(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowLanding(false);
      setShowLogin(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isAuthenticated]);

  // After login success -> go to role select
  const handleLoginSuccess = useCallback(() => {
    setShowLogin(false);
    setShowRoleSelect(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Create a server-side resume and start the questionnaire
  const handleCreateNewResume = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const role = selectedRole ?? 'students-interns';
        const resume = await createResume({
          name: `Resume - ${roleLabel(role) ?? 'New'} - ${new Date().toLocaleDateString()}`,
          category: role,
          templateId: selectedTemplateId || 'ats-classic',
        });
        setCurrentResumeId(resume.id);
      } catch {
        // If server create fails, continue without server ID (localStorage fallback)
      }
    }
  }, [isAuthenticated, selectedRole, selectedTemplateId]);

  // Load an existing resume from server
  const handleContinueResume = useCallback(async (resumeId: string) => {
    try {
      const resume = await getResume(resumeId);
      const data = resume.data as Record<string, unknown>;
      const loadedAnswers = data.answers ? normalizeAnswerMap(data.answers as Record<number, string>) : {};
      setAnswers(loadedAnswers);
      setCurrentResumeId(resumeId);
      setSelectedRole((data.selectedRole as string) ?? resume.category ?? null);
      setCategoryIndex(typeof data.categoryIndex === 'number' ? data.categoryIndex : 0);
      // Restore template from server data, templateId field, or default
      const loadedTemplate = (data.templateId as string) ?? resume.templateId ?? 'ats-classic';
      setSelectedTemplateId(loadedTemplate);
      try {
        const stored = localStorage.getItem('job-application-resume-settings-v1');
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem('job-application-resume-settings-v1', JSON.stringify({ ...parsed, template: loadedTemplate }));
      } catch { /* ignore */ }
      setShowDashboard(false);
      setShowLanding(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // If loading fails, just navigate to the resume with current state
      setCurrentResumeId(resumeId);
      setShowDashboard(false);
      setShowLanding(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await authLogout();
    setShowDashboard(false);
    setShowLanding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [authLogout]);

  if (showLogin) {
    return (
      <LoginPage
        onSuccess={handleLoginSuccess}
        onBack={() => { setShowLogin(false); setShowLanding(true); }}
      />
    );
  }

  if (showDashboard) {
    return (
      <DashboardPage
        onCreateNew={async () => {
          await handleCreateNewResume();
          setShowDashboard(false);
          setShowRoleSelect(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onContinue={handleContinueResume}
        onLogout={handleLogout}
        onBack={() => { setShowDashboard(false); setShowLanding(true); }}
      />
    );
  }

  if (showLanding) {
    return (
      <Landing
        isAuthenticated={isAuthenticated}
        onStart={handleStartBuilding}
        onLogin={() => { setShowLanding(false); setShowLogin(true); }}
        onDashboard={() => { setShowLanding(false); setShowDashboard(true); }}
      />
    );
  }

  if (showRoleSelect) {
    return (
      <RoleSelect
        selectedRole={selectedRole}
        onSelect={(roleId: RoleId) => {
          setSelectedRole(roleId);
          setCategoryIndex(0);
          setReview(false);
          setShowResume(false);
          setShowJobSearchGate(false);
          setJobSearchOptIn(null);
          setShowRoleSelect(false);
          setShowTemplateGallery(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onBack={() => {
          setShowRoleSelect(false);
          setShowLanding(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  if (showTemplateGallery) {
    return (
      <TemplateGallery
        selectedRole={selectedRole}
        selectedTemplate={selectedTemplateId}
        onSelect={(id: TemplateId) => {
          setSelectedTemplateId(id);
          // Persist the template choice so ResumeBuilder's loadSettings picks it up
          try {
            const stored = localStorage.getItem('job-application-resume-settings-v1');
            const parsed = stored ? JSON.parse(stored) : {};
            localStorage.setItem('job-application-resume-settings-v1', JSON.stringify({ ...parsed, template: id }));
          } catch { /* ignore */ }
          setShowTemplateGallery(false);
          setShowResumeImport(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onBack={() => {
          setShowTemplateGallery(false);
          setShowRoleSelect(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  if (showResumeImport) {
    return (
      <ResumeImport
        roleLabel={roleLabel(selectedRole) ?? 'this category'}
        onCreateNew={async () => {
          await handleCreateNewResume();
          setShowResumeImport(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onUpload={(importedAnswers) => {
          setAnswers((previous) => ({ ...previous, ...importedAnswers }));
          setShowResumeImport(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onBack={() => {
          setShowResumeImport(false);
          setShowTemplateGallery(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <main className="profile-app">
      <div className="app-shell">
        <header className="app-header">
          <button
            type="button"
            className="brand"
            data-testid="brand-profile"
            onClick={() => { setShowLanding(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, font: 'inherit' }}
          >
            <span className="brand-mark" aria-hidden="true">↗</span>
            <span className="brand-copy">
              <span className="brand-name">Resume Redefined</span>
              <span className="brand-kicker">Build once, reuse often</span>
            </span>
          </button>
          <div className="header-status-group">
            {selectedRole ? (
              <span className="role-badge" data-testid="status-selected-role">
                {roleLabel(selectedRole)}
              </span>
            ) : null}
            <div className="privacy-note" data-testid="status-privacy">
              <ShieldCheck size={15} aria-hidden="true" /> Saved only in this browser
            </div>
          </div>
        </header>

        {showResume ? (
          <ResumeBuilder
            profile={masterProfile}
            onBack={() => {
              setShowResume(false);
              if (resumeOriginReview) setReview(true);
              setResumeOriginReview(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAllPages={() => setPagesOpen(true)}
            onDownloadCsv={() => downloadCsv(answers)}
          />
        ) : review ? (
          <ReviewScreen
            categories={categories}
            answers={answers}
            answeredCount={answeredCount}
            relevantQuestionCount={relevantQuestionCount}
            onEditCategory={(index) => {
              setCategoryIndex(index);
              setReview(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDownload={() => downloadCsv(answers)}
            onStartOver={() => setResetOpen(true)}
            onViewResume={() => {
              setResumeOriginReview(true);
              setShowResume(true);
              setReview(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAllPages={() => setPagesOpen(true)}
            onDownloadPdf={() => {
              const settings = defaultResumeSettings(masterProfile);
              void downloadResumePdf(mapResume(masterProfile, settings), 'resume', settings);
            }}
            onDownloadWord={() => {
              const settings = defaultResumeSettings(masterProfile);
              void downloadResumeDocx(mapResume(masterProfile, settings), 'resume', settings);
            }}
          />
        ) : showJobSearchGate ? (
          <JobSearchGate
            onContinue={() => {
              setJobSearchOptIn('yes');
              setShowJobSearchGate(false);
              moveToCategory(categoryIndex + 1);
            }}
            onSkip={() => {
              setJobSearchOptIn('no');
              setShowJobSearchGate(false);
              setResumeOriginReview(false);
              setShowResume(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentCategory ? (
          <div className="workspace-card">
            <ProgressContext
              categoryIndex={categoryIndex}
              categoryCount={categories.length}
              answeredCount={answeredCount}
              relevantQuestionCount={relevantQuestionCount}
              categoryRemaining={currentCategory.questions.filter((question) => visibleForQuestion(question.id, answers) && !answers[question.id]?.trim()).length}
            />
            <header className="category-header">
              <div className="category-header-top">
                <div className="eyebrow">Build once, reuse often</div>
                <div className="category-header-actions">
                  <button type="button" className="button button-secondary" onClick={() => setPagesOpen(true)} data-testid="button-all-pages">
                    <ClipboardList size={14} /> ALL PAGES
                  </button>
                  <button type="button" className="button button-primary" onClick={() => { setResumeOriginReview(false); setShowResume(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} data-testid="button-view-resume">
                    <FileText size={14} aria-hidden="true" /> VIEW RESUME
                  </button>
                </div>
              </div>
              <h1 className="category-title" data-testid="text-category-title">{currentCategory.name}</h1>
              <p className="category-subtitle">Answer all applicable questions. Optional questions may be left blank.</p>
            </header>
            <div className="question-list">
              {currentCategory.questions
                .filter((question) => visibleForQuestion(question.id, answers))
                .map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    answer={answers[question.id] ?? ''}
                    index={index}
                    onChange={(value) => updateAnswer(question.id, value)}
                    onAdvance={handleAdvanceQuestion}
                  />
                ))}
            </div>
            <nav className="navigation-bar" aria-label="Category navigation">
              <div className="save-state" data-testid="status-save">
                {saveState === 'saved' ? <Check size={14} strokeWidth={2.5} aria-hidden="true" /> : null}
                {saveState === 'saved' ? 'Saved locally' : 'Saving changes…'}
              </div>
              <div className="nav-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={categoryIndex === 0}
                  data-testid="button-back"
                  onClick={handleBack}
                >
                  <ArrowLeft size={15} aria-hidden="true" /> BACK
                </button>
                <button type="button" className="button button-primary" data-testid="button-next" onClick={handleNext}>
                  {categoryIndex === categories.length - 1 ? 'REVIEW PROFILE' : 'NEXT CATEGORY'}
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            </nav>
          </div>
        ) : null}

      </div>
      {pagesOpen ? (
        <CategoryJumpPanel
          categories={categories}
          categoryIndex={categoryIndex}
          answers={answers}
          onClose={() => setPagesOpen(false)}
          onMove={(index) => {
            setCategoryIndex(index);
            setReview(false);
            setShowResume(false);
            setPagesOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : null}
      {resetOpen ? <ResetDialog onCancel={() => setResetOpen(false)} onConfirm={handleReset} /> : null}
    </main>
  );
}

export default App;