import { useEffect, useState } from 'react';
import { FileText, Plus, Trash2, Edit, Copy, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { listResumes, deleteResume, type ResumeListItem } from '../lib/api';

import '../styles/dashboard.css';

function Logo() {
  return (
    <a className="logo" href="#top">
      <b>↗</b>Resume<span>Redefined</span>
    </a>
  );
}

export default function DashboardPage({
  onCreateNew,
  onContinue,
  onLogout,
  onBack,
}: {
  onCreateNew: () => void;
  onContinue: (resumeId: string) => void;
  onLogout: () => void;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await listResumes();
      setResumes(data.resumes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleDuplicate = async (resume: ResumeListItem) => {
    try {
      const { createResume, getResume } = await import('../lib/api');
      const full = await getResume(resume.id);
      const copy = await createResume({
        name: `${resume.name} (Copy)`,
        category: resume.category ?? undefined,
        templateId: resume.templateId ?? undefined,
        data: full.data,
      });
      setResumes((prev) => [copy, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate');
    }
  };

  return (
    <div className="dashboard-page graph-canvas">
      <main>
        <nav className="nav container" id="top">
          <div className="nav-logo-row">
            <Logo />
          </div>
          <div className="nav-row">
            <a className="save-login" href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
              &larr; HOME
            </a>
            <a className="save-login" href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}>
              LOG OUT
            </a>
          </div>
        </nav>

        <section className="dashboard-hero container">
          <p className="kicker">&mdash; MY RESUMES</p>
          <h1>
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
          <p className="lead">
            Pick up where you left off or start something new.
          </p>
        </section>

        <section className="container">
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              Loading your resumes…
            </div>
          ) : (
            <div className="resume-grid">
              {/* Create New Card */}
              <button
                type="button"
                className="create-card"
                onClick={onCreateNew}
              >
                <span className="create-icon">
                  <Plus size={22} strokeWidth={2} />
                </span>
                <span>CREATE NEW RESUME</span>
              </button>

              {/* Resume Cards */}
              {resumes.map((resume) => (
                <div key={resume.id} className="resume-card">
                  <div className="resume-card-header">
                    <span className="resume-card-icon">
                      <FileText size={16} strokeWidth={2} />
                    </span>
                    <div className="resume-card-info">
                      <h3>{resume.name}</h3>
                      <small>{resume.category ?? 'General'} · Updated {new Date(resume.updatedAt).toLocaleDateString()}</small>
                    </div>
                  </div>

                  <div className="resume-card-actions">
                    <button
                      type="button"
                      onClick={() => onContinue(resume.id)}
                      className="button button-primary"
                    >
                      <Edit size={14} /> CONTINUE
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(resume)}
                      className="button button-secondary btn-icon"
                      title="Duplicate"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(resume.id, resume.name)}
                      className="button button-secondary btn-icon btn-danger"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && resumes.length === 0 && (
            <div className="empty-state">
              <p>No resumes yet. Start building your career story.</p>
              <button
                type="button"
                onClick={onCreateNew}
                className="button"
              >
                START BUILDING <b><ArrowRight size={15} /></b>
              </button>
            </div>
          )}
        </section>

        <footer className="site-footer container">
          <div className="footer-top">
            <div className="footer-brand">
              <Logo />
              <p>Build your career story with intention — one profile, every application.</p>
            </div>
            <div className="footer-col">
              <h4>PRODUCT</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onCreateNew(); }}>Resume Builder</a></li>
                <li><a href="#">Templates</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>COMPANY</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="mailto:vestorywealth@gmail.com">Contact</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>RESOURCES</h4>
              <ul>
                <li><span>Resume Tips</span></li>
                <li><span>ATS Resume Guide</span></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>LEGAL</h4>
              <ul>
                <li><span>Privacy Policy</span></li>
                <li><span>Terms of Service</span></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <small>© 2026 Resume Redefined</small>
            <a href="mailto:vestorywealth@gmail.com">vestorywealth@gmail.com</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
