import { type DragEvent, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FilePlus,
  Loader2,
  Upload,
} from 'lucide-react';

import './styles/resumeImport.css';
import {
  buildParsedPreview,
  extractTextFromFile,
  isImageFile,
  parseResumeText,
  type AnswerMap,
  type ParsedFieldPreview,
} from './resumeParser';

type ImportMode = 'choose' | 'upload';
type ProcessingStatus = 'idle' | 'working' | 'done' | 'error';

function Logo() {
  return (
    <a className="logo" href="#top">
      <b>↗</b>career<span>canvas</span>
    </a>
  );
}

function ResumeImport({
  onCreateNew,
  onUpload,
  onBack,
  roleLabel,
}: {
  onCreateNew: () => void;
  onUpload: (answers: AnswerMap) => void;
  onBack: () => void;
  roleLabel: string;
}) {
  const [mode, setMode] = useState<ImportMode>('choose');
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<ParsedFieldPreview[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isImageUpload, setIsImageUpload] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const name = file.name.toLowerCase();
    const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';
    const isDocx =
      name.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isImage = isImageFile(file);
    if (!isPdf && !isDocx && !isImage) {
      setError('Unsupported file format. Please upload a PDF, DOCX, or image file.');
      setStatus('error');
      setFileName(file.name);
      return;
    }

    setFileName(file.name);
    setStatus('working');
    setError('');
    setPreview([]);
    setIsImageUpload(isImage);

    try {
      const text = await extractTextFromFile(file);
      const parsed = parseResumeText(text);
      const fields = buildParsedPreview(parsed);
      setPreview(fields);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read the resume file.');
      setStatus('error');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void handleFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const handleContinue = () => {
    // Re-parse from the stored preview by reconstructing answers.
    const answers: AnswerMap = {};
    for (const field of preview) {
      answers[field.questionId] = field.value;
    }
    onUpload(answers);
  };

  const handleResetUpload = () => {
    setMode('choose');
    setFileName('');
    setStatus('idle');
    setError('');
    setPreview([]);
    setIsImageUpload(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="resume-import-page graph-canvas">
      <main>
        <nav className="nav container" id="top">
          <Logo />
          <a className="back-link" href="#" onClick={(e) => { e.preventDefault(); onBack(); }} data-testid="link-back-roles">
            &larr; Back to categories
          </a>
        </nav>

        {mode === 'choose' ? (
          <>
            <section className="import-hero container">
              <p className="kicker">&mdash; NEXT STEP</p>
              <h1>How would you like to create your resume?</h1>
              <p className="lead">
                You selected <strong>{roleLabel}</strong>. Start from scratch with our guided questionnaire,
                or upload an existing resume and we&apos;ll pre-fill the answers for you to review.
              </p>
            </section>

            <section className="container">
              <div className="import-option-list" role="list">
                <button
                  type="button"
                  role="listitem"
                  className="import-option-card create"
                  onClick={onCreateNew}
                  data-testid="button-create-new-resume"
                >
                  <span className="import-option-icon">
                    <FilePlus size={22} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="import-option-copy">
                    <b>Create New Resume</b>
                    <small>Start the questionnaire from the beginning and build your profile step by step.</small>
                  </span>
                  <span className="import-option-arrow" aria-hidden="true">&rarr;</span>
                </button>

                <button
                  type="button"
                  role="listitem"
                  className="import-option-card upload"
                  onClick={() => setMode('upload')}
                  data-testid="button-upload-resume"
                >
                  <span className="import-option-icon">
                    <Upload size={22} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="import-option-copy">
                    <b>Upload Existing Resume</b>
                    <small>Upload a PDF, DOCX, or image file. We&apos;ll extract the information and pre-fill the questionnaire for you to review and edit.</small>
                  </span>
                  <span className="import-option-arrow" aria-hidden="true">&rarr;</span>
                </button>
              </div>
              <p className="import-note">
                Both paths use the same questionnaire and the same master profile. Nothing is duplicated or replaced.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="import-hero container">
              <p className="kicker">&mdash; UPLOAD YOUR RESUME</p>
              <h1>Upload an existing resume</h1>
              <p className="lead">
                We&apos;ll extract the text, identify the sections, and map the information into your questionnaire.
                You&apos;ll review and edit everything before continuing.
              </p>
              <button
                type="button"
                className="import-back-options"
                onClick={() => setMode('choose')}
                data-testid="button-back-to-options"
              >
                <ArrowLeft size={15} aria-hidden="true" /> Back to options
              </button>
            </section>

            <section className="container import-upload-section">
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tif,.tiff,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                onChange={handleInputChange}
                style={{ display: 'none' }}
                data-testid="input-resume-file"
              />

              {status === 'idle' || status === 'error' ? (
                <div
                  className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  data-testid="dropzone-resume-upload"
                >
                  <Upload size={32} strokeWidth={1.5} aria-hidden="true" />
                  <p className="dropzone-title">Drop your resume here, or click to browse</p>
                  <p className="dropzone-hint">PDF, DOCX, or image files (OCR)</p>
                  {status === 'error' ? (
                    <p className="upload-error" data-testid="text-upload-error">
                      <AlertCircle size={15} aria-hidden="true" /> {error}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {status === 'working' ? (
                <div className="upload-processing" data-testid="panel-upload-processing">
                  <Loader2 size={28} strokeWidth={2} className="spin" aria-hidden="true" />
                  <div>
                    <b className="processing-title">Reading {fileName}…</b>
                    <small className="processing-hint">Extracting text{isImageUpload ? ' via OCR' : ''} and identifying sections</small>
                  </div>
                </div>
              ) : null}

              {status === 'done' ? (
                <div className="upload-result" data-testid="panel-upload-result">
                  <div className="upload-result-header">
                    <div className="upload-result-info">
                      <CheckCircle2 size={20} strokeWidth={2} aria-hidden="true" />
                      <div>
                        <b>{fileName}</b>
                        <small>{preview.length} field{preview.length === 1 ? '' : 's'} identified</small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="button button-secondary upload-result-reset"
                      onClick={handleResetUpload}
                      data-testid="button-upload-different-file"
                    >
                      Upload a different file
                    </button>
                  </div>

                  {preview.length === 0 ? (
                    <p className="upload-empty-preview" data-testid="text-no-fields-extracted">
                      We couldn&apos;t confidently identify any fields from this resume. You can still continue to the
                      questionnaire and fill it in manually.
                    </p>
                  ) : (
                    <div className="preview-list" data-testid="list-parsed-fields">
                      {preview.map((field) => (
                        <div className="preview-row" key={field.questionId} data-testid={`preview-field-${field.questionId}`}>
                          <div className="preview-label">{field.label}</div>
                          <div className="preview-value">{field.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="upload-result-actions">
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={handleContinue}
                      data-testid="button-continue-to-questionnaire"
                    >
                      CONTINUE TO QUESTIONNAIRE <ArrowRight size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </>
        )}

        <footer className="site-footer container" style={{ display: 'block', padding: '64px 0 30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr repeat(4, 1fr)', gap: '30px', paddingBottom: '34px', borderBottom: '1.5px solid var(--stroke-main)' }}>
            <div>
              <Logo />
              <p style={{ maxWidth: '230px', margin: '14px 0 0', color: 'var(--muted)', fontSize: '12px', lineHeight: 1.6 }}>Build your career story with intention — one profile, every application.</p>
            </div>
            <div>
              <h4 style={{ margin: '0 0 14px', font: '700 10px "DM Mono"', letterSpacing: '.1em', color: '#315a7d' }}>PRODUCT</h4>
              <ul style={{ display: 'grid', gap: '10px', margin: 0, padding: 0, listStyle: 'none' }}>
                <li><a href="#" style={{ fontSize: '12px', color: 'var(--muted)' }}>Resume Builder</a></li>
                <li><a href="#" style={{ fontSize: '12px', color: 'var(--muted)' }}>Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ margin: '0 0 14px', font: '700 10px "DM Mono"', letterSpacing: '.1em', color: '#315a7d' }}>COMPANY</h4>
              <ul style={{ display: 'grid', gap: '10px', margin: 0, padding: 0, listStyle: 'none' }}>
                <li><a href="#" style={{ fontSize: '12px', color: 'var(--muted)' }}>About Us</a></li>
                <li><a href="mailto:vestorywealth@gmail.com" style={{ fontSize: '12px', color: 'var(--muted)' }}>Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ margin: '0 0 14px', font: '700 10px "DM Mono"', letterSpacing: '.1em', color: '#315a7d' }}>RESOURCES</h4>
              <ul style={{ display: 'grid', gap: '10px', margin: 0, padding: 0, listStyle: 'none' }}>
                <li><span style={{ fontSize: '12px', color: 'var(--muted)', opacity: 0.65 }}>Resume Tips</span></li>
                <li><span style={{ fontSize: '12px', color: 'var(--muted)', opacity: 0.65 }}>ATS Resume Guide</span></li>
              </ul>
            </div>
            <div>
              <h4 style={{ margin: '0 0 14px', font: '700 10px "DM Mono"', letterSpacing: '.1em', color: '#315a7d' }}>LEGAL</h4>
              <ul style={{ display: 'grid', gap: '10px', margin: 0, padding: 0, listStyle: 'none' }}>
                <li><span style={{ fontSize: '12px', color: 'var(--muted)', opacity: 0.65 }}>Privacy Policy</span></li>
                <li><span style={{ fontSize: '12px', color: 'var(--muted)', opacity: 0.65 }}>Terms of Service</span></li>
              </ul>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', paddingTop: '22px', fontSize: '11px', color: 'var(--muted)' }}>
            <small>&copy; 2026 CareerCanvas</small>
            <a href="mailto:vestorywealth@gmail.com" style={{ fontWeight: 700, color: 'var(--stroke-main)' }}>vestorywealth@gmail.com</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default ResumeImport;
