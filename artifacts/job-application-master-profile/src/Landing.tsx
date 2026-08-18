import type { MouseEvent } from 'react';

import './styles/landing.css';

function Logo() {
  return (
    <a className="logo" href="#top">
      <b>↗</b>career<span>canvas</span>
    </a>
  );
}

function Landing({
  onStart,
  isAuthenticated,
  onLogin,
  onDashboard,
}: {
  onStart: () => void;
  isAuthenticated?: boolean;
  onLogin?: () => void;
  onDashboard?: () => void;
}) {
  const start = (event: MouseEvent) => {
    event.preventDefault();
    onStart();
  };

  return (
    <div className="landing-page graph-canvas">
      <main>
        <nav className="nav container" id="top">
          <div className="nav-logo-row">
            <Logo />
          </div>
          <div className="nav-row">
            {isAuthenticated ? (
              <a className="save-login" href="#" onClick={(e) => { e.preventDefault(); onDashboard?.(); }} data-testid="link-my-resumes">
                MY RESUMES
              </a>
            ) : (
              <a className="save-login" href="#" onClick={(e) => { e.preventDefault(); onLogin?.(); }} data-testid="link-login">
                LOG IN · SAVE PROGRESS
              </a>
            )}
            <a className="editorial-badge" href="#" onClick={start} data-testid="link-start-building">
              START BUILDING
            </a>
          </div>
          <div className="nav-row">
            <a className="save-login" href="#how">Live Preview</a>
            <a className="save-login" href="#templates">Templates</a>
          </div>
        </nav>

        <section className="hero container" id="hero">
          <div>
            <p className="kicker">&mdash; YOUR CAREER, IN MOTION</p>
            <h1>
              Make your
              <br />
              experience <mark>move.</mark>
            </h1>
            <p className="lead">
              Build a clear, confident career story. Then turn it into the resume that gets your work noticed.
            </p>
            <p>
              <a className="button" href="#" onClick={start} data-testid="button-build-resume">
                BUILD MY RESUME <b>&rarr;</b>
              </a>
            </p>
            <div className="note">
              <b>✓</b>
              <span>
                <strong>One profile, every resume.</strong>
                <br />
                Nothing invented — just your real work, told well.
              </span>
            </div>
          </div>
          <div className="hero-art">
            <i className="orb blue" />
            <i className="orb red" />
            <i className="axis x" />
            <i className="axis y" />
            <article className="resume">
              <header>
                <span>AM</span>
                <div>
                  <b>Alex Morgan</b>
                  <small>Product leader &middot; Builder</small>
                </div>
                <i />
              </header>
              <p className="contact">alex@domain.com &middot; Bengaluru, IN</p>
              <hr />
              <label>PROFESSIONAL SUMMARY</label>
              <div className="lines">
                <i />
                <i />
                <i />
              </div>
              <label>EXPERIENCE</label>
              <div className="job">
                <div>
                  <b>Northstar Labs</b>
                  <small>Senior Product Manager</small>
                </div>
                <time>2021 &mdash; NOW</time>
              </div>
              <ul>
                <li>Built a product engine around customer evidence.</li>
                <li>
                  Improved activation by <strong>32%</strong>.
                </li>
              </ul>
              <label>SELECTED SKILLS</label>
              <p className="pills">
                <span>Strategy</span>
                <span>Research</span>
                <span>Analytics</span>
              </p>
            </article>
            <article className="resume-mini">
              <span className="editorial-badge">MODERN TEMPLATE</span>
              <header>
                <b>ALEX MORGAN</b>
                <small>Senior Product Manager</small>
              </header>
              <hr />
              <label>CORE STRENGTHS</label>
              <p>
                <i />
                <i />
                <i />
              </p>
              <label>SELECTED WORK</label>
              <div>
                <b>Customer research hub</b>
                <small>Product strategy &middot; 2024</small>
              </div>
              <div>
                <b>Portfolio analytics</b>
                <small>Growth systems &middot; 2023</small>
              </div>
            </article>
            <aside className="callout gold">
              ✓{' '}
              <span>
                <b>ATS-optimized</b>
                <small>Passes tracking systems</small>
              </span>
            </aside>
          </div>
        </section>

        <section className="ticker">
          ONE PROFILE <b>✦</b> MANY OPPORTUNITIES <b>✦</b> YOUR STORY, SHARPENED <b>✦</b> ONE PROFILE <b>✦</b> MANY
          OPPORTUNITIES
        </section>

        <section className="process container" id="how">
          <div>
            <p className="kicker">&mdash; A BETTER STARTING POINT</p>
            <h2>
              Good careers aren&apos;t
              <br />
              one-page stories.
            </h2>
            <p className="lead small">
              Keep the context. Keep the proof. Then create the version that is right for the opportunity in front of
              you.
            </p>
            <a className="button" href="#templates" onClick={(e) => e.preventDefault()}>
              VIEW TEMPLATES <b>&rarr;</b>
            </a>
          </div>
          <div className="steps steps-4">
            <article className="blue-card">
              <b>01</b>
              <h3>Choose your path</h3>
              <p>Select the career stage that best describes you.</p>
              <i className="path-icon">◎</i>
            </article>
            <article className="red-card">
              <b>02</b>
              <h3>Choose your template</h3>
              <p>Get recommended templates, or explore every design.</p>
              <i className="template-icon">▦</i>
            </article>
            <article className="green-card">
              <b>03</b>
              <h3>Build your resume</h3>
              <p>Answer guided questions and build your resume around your target role.</p>
              <i className="build-icon">✎</i>
            </article>
            <article className="gold-card">
              <b>04</b>
              <h3>Review &amp; apply</h3>
              <p>Review the finished resume and prepare it for applications.</p>
              <i className="apply-icon">✓</i>
            </article>
          </div>
        </section>

        <section className="template" id="templates">
          <div className="container template-grid">
            <div className="preview">
              <span>LIVE PREVIEW ●</span>
              <article>
                <header>
                  <b>ALEX MORGAN</b>
                  <small>Senior Product Manager</small>
                </header>
                <hr />
                <label>EXPERIENCE</label>
                <div>
                  <b>Northstar Labs</b>
                  <time>2021 &mdash; PRESENT</time>
                  <small>Senior Product Manager &middot; Bengaluru</small>
                  <p>Led strategic development of an analytics platform, increasing customer activation by 32%.</p>
                </div>
                <label>EDUCATION</label>
                <div>
                  <b>Example University</b>
                  <time>2017 &mdash; 2019</time>
                  <small>MBA &middot; Business Administration</small>
                </div>
              </article>
            </div>
            <div>
              <p className="kicker">&mdash; MADE FOR THE REAL WORLD</p>
              <h2>
                Professional on paper.
                <br />
                <mark>Unmistakably</mark> yours.
              </h2>
              <p className="lead small">
                Choose a clear ATS-ready document or a more expressive modern layout. Your experience remains the
                source of truth either way.
              </p>
              <a className="button" href="#" onClick={start} data-testid="button-explore-builder">
                LIVE PREVIEW <b>&rarr;</b>
              </a>
            </div>
          </div>
        </section>

        <section className="about container" id="about">
          <div className="about-grid">
            <div>
              <p className="kicker">&mdash; ABOUT THE PRODUCT</p>
              <h2>
                What CareerCanvas
                <br />
                actually does.
              </h2>
              <p className="lead small">
                Build a resume that reflects where you are going — not just where you&apos;ve been.
              </p>
              <ul className="about-list">
                <li><b>1</b><span>Choose a career-focused starting point.</span></li>
                <li><b>2</b><span>Select a suitable, professionally designed template.</span></li>
                <li><b>3</b><span>Build your resume through a guided, step-by-step process.</span></li>
                <li><b>4</b><span>Tailor your content toward your target role.</span></li>
                <li><b>5</b><span>Create an ATS-friendly, professional resume.</span></li>
              </ul>
              <a className="button" href="#" onClick={start}>
                EXPLORE THE BUILDER <b>&rarr;</b>
              </a>
            </div>
            <div className="about-card">
              <p className="quote">
                Same story.<br />
                <mark>Sharper</mark> telling.
              </p>
              <p className="lead small" style={{ margin: 0 }}>
                Your experience is the source of truth. CareerCanvas helps you present it clearly, for the role you&apos;re going after next.
              </p>
            </div>
          </div>
        </section>

        <section className="closing container">
          <div>
            <p className="kicker">&mdash; MAKE THE NEXT MOVE</p>
            <h2>
              Your work has
              <br />
              <mark>direction.</mark>
            </h2>
            <p>Give it a resume that can keep up.</p>
            <a className="button light" href="#" onClick={start} data-testid="button-start-free">
              START BUILDING FREE <b>&rarr;</b>
            </a>
            <i className="target">◎</i>
          </div>
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
                <li><a href="#" onClick={start}>Resume Builder</a></li>
                <li><a href="#templates">Templates</a></li>
                <li><a href="#how">How It Works</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>COMPANY</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
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
            <small>© 2026 CareerCanvas</small>
            <a href="mailto:vestorywealth@gmail.com">vestorywealth@gmail.com</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Landing;
